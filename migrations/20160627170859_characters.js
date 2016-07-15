
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('characters', function (table) {
            table.string('character_id').unique();
            table.string('name');
            table.integer('rank');
            table.integer('kills');
            table.integer('deaths');
            table.integer('faction');
            table.string('outfit_id');
            table.string('outfit_name');
            table.string('outfit_alias');
            table.timestamp('created');
            table.timestamp('updated');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
