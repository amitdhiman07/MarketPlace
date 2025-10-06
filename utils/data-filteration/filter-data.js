const filterData = (data) => {
    return data.map(({ createdOn, modifiedOn, isActive, createdBy, modifiedBy, ...rest }) => rest);
};

module.exports = {
    filterData
};