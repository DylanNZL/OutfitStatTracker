
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('weapons', function (table) {
            table.string('weapon_id').unique();
            table.string('name');
            table.string('category_id');
            table.string('image_id');
            table.integer('kills');
            table.integer('deaths');
            table.integer('headshots');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
