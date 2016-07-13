
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('bases', function (table) {
            table.string('base_id').unique();
            table.string('base_name');
            table.string('base_type');
            table.integer('base_zone_id');
            table.integer('captures');
        })
    ])
};

exports.down = function(knex, Promise) {

};