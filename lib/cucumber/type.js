define([
    './type/collection',
    './type/hash_data_table',
    './type/string'
], function(Collection, HashDataTable, String) {
var Type           = {};
Type.Collection    = Collection;
Type.HashDataTable = HashDataTable;
Type.String        = String;
return Type;
});
