module.exports.getLov = `CREATE OR REPLACE FUNCTION lov.fetch_lov_data (
    params TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
COST 100
VOLATILE
PARALLEL UNSAFE
SECURITY DEFINER
AS $BODY$
DECLARE
    input_json JSONB;
    _source TEXT;
    _hierarchy TEXT;
    _column_label TEXT;
    _conditions JSONB;
    _date_range_conditions JSONB;
    dynamic_query TEXT;
    query_result RECORD;
    where_clause TEXT := '';
    _where_column TEXT;
    _where_value TEXT;
    _where_value_type TEXT;
    _where_value_operator TEXT;
    _start_date TIMESTAMPTZ;
    _end_date TIMESTAMPTZ;
    _start_date_column TEXT;
    _end_date_column TEXT;
    result_json JSONB := '[]'::jsonb;
    i_rec RECORD;
    col RECORD;
    select_list TEXT := '';
    col_values JSONB;
    text_array TEXT[];
    in_values TEXT;
    _order_by JSONB;
    _order_by_column TEXT;
    _order_by_direction TEXT := 'ASC';
    order_clause TEXT := '';
BEGIN
    -- Parse the input to JSONB
    input_json := params::JSONB;

    -- Extract values from input JSON
    _source := input_json ->> 'source';
    _hierarchy := LOWER(input_json ->> 'hierarchy');
    _column_label := input_json ->> 'columnValue';
    _conditions := input_json -> 'conditions';
    col_values := input_json -> 'columnValues';
    _date_range_conditions := COALESCE(input_json -> 'dateRangeConditions', NULL);
    _order_by := input_json -> 'orderBy';

    -- Validate columns
    IF jsonb_array_length(col_values) = 0 THEN
        RAISE EXCEPTION 'You need to fetch at least 1 column';
    END IF;

    -- Loop through each condition to build WHERE clause
    FOR i_rec IN SELECT value FROM jsonb_array_elements(_conditions) AS t(value) LOOP
        _where_column := i_rec.value ->> 'whereColumn';
        _where_value := i_rec.value ->> 'whereValue';
        _where_value_type := UPPER(i_rec.value ->> 'whereValueType');
        _where_value_operator := UPPER(COALESCE(i_rec.value ->> 'whereValueOperator', 'EQUALS'));

        IF _where_column IS NOT NULL THEN
            IF where_clause <> '' THEN
                where_clause := where_clause || ' AND ';
            END IF;

            CASE _where_value_type
                WHEN 'INTEGER' THEN
                    IF _where_value_operator = 'IN' THEN
                        where_clause := where_clause || format('%I IN (%s)', _where_column, _where_value);
                    ELSE
                        where_clause := where_clause || format('%I = %s', _where_column, _where_value::INTEGER);
                    END IF;

                WHEN 'TEXT' THEN
                    IF _where_value_operator = 'ILIKE' THEN
                        where_clause := where_clause || format('%I ILIKE %L', _where_column, '%' || _where_value || '%');
                    ELSIF _where_value_operator = 'IN' THEN
                        text_array := string_to_array(_where_value, ',');
                        in_values := array_to_string(
                            ARRAY(SELECT quote_literal(trim(val)) FROM unnest(text_array) val),
                            ', '
                        );
                        where_clause := where_clause || format('%I IN (%s)', _where_column, in_values);
                    ELSE
                        where_clause := where_clause || format('%I = %L', _where_column, _where_value);
                    END IF;

                WHEN 'BOOLEAN' THEN
                    where_clause := where_clause || format('%I = %s', _where_column, (_where_value::BOOLEAN)::TEXT);

                ELSE
                    RAISE EXCEPTION 'Unsupported whereValueType: %', _where_value_type;
            END CASE;
        END IF;
    END LOOP;

    -- Date range handling
    IF _date_range_conditions IS NOT NULL THEN
        _start_date := COALESCE((_date_range_conditions ->> 'startDate'), CURRENT_DATE::TEXT) || ' 00:00:00+00';
        _start_date_column := _date_range_conditions ->> 'startDateColumn';
        _end_date := NULL;
        _end_date_column := NULL;

        IF (_date_range_conditions ? 'endDate') AND (_date_range_conditions ->> 'endDate') IS NOT NULL THEN
            _end_date := ((_date_range_conditions ->> 'endDate') || ' 23:59:59+00')::timestamptz;
            _end_date_column := _date_range_conditions ->> 'endDateColumn';
        END IF;

        IF _end_date IS NOT NULL AND _end_date_column IS NOT NULL THEN
            IF where_clause <> '' THEN
                where_clause := where_clause || ' AND ';
            END IF;
            where_clause := where_clause || format('%I <= %L AND %I >= %L', _start_date_column, _end_date, _end_date_column, _start_date);
        ELSE
            IF where_clause <> '' THEN
                where_clause := where_clause || ' AND ';
            END IF;
            where_clause := where_clause || format('%I >= %L', _start_date_column, _start_date);
        END IF;
    END IF;

    -- Prefix WHERE clause if needed
    IF where_clause <> '' THEN
        where_clause := 'WHERE ' || where_clause;
    END IF;

    -- Build SELECT list
    FOR col IN SELECT value FROM jsonb_array_elements(col_values) LOOP
        IF select_list <> '' THEN
            select_list := select_list || ', ';
        END IF;
        select_list := select_list || format('%I AS %I', col.value ->> 'actualName', col.value ->> 'aliasName');
    END LOOP;

    -- ORDER BY clause logic
    IF _order_by IS NOT NULL THEN
        _order_by_column := _order_by ->> 'column';
        _order_by_direction := UPPER(COALESCE(_order_by ->> 'sortBy', 'ASC'));

        IF _order_by_direction NOT IN ('ASC', 'DESC') THEN
            RAISE EXCEPTION 'Invalid order direction: %, must be ASC or DESC', _order_by_direction;
        END IF;

        -- Validate that order_by_column exists in alias list
        IF NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(col_values) AS t(val)
            WHERE val ->> 'aliasName' = _order_by_column
        ) THEN
            RAISE EXCEPTION 'Invalid orderBy.column: %, must match aliasName from columnValues', _order_by_column;
        END IF;

        order_clause := format('ORDER BY %I %s', _order_by_column, _order_by_direction);
    END IF;

    -- Final query build
    dynamic_query := format(
        'SELECT DISTINCT %s FROM %I.%I %s %s',
        select_list,
        _source,
        _hierarchy,
        where_clause,
        order_clause
    );

    RAISE NOTICE 'Generated Query: %', dynamic_query;

    -- Execute and collect results
    FOR query_result IN EXECUTE dynamic_query LOOP
        result_json := result_json || to_jsonb(query_result);
    END LOOP;

    RETURN result_json;
END;
$BODY$;`;