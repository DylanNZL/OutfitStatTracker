
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('outfits', function (table) {
            table.string('outfit_id').unique();
            table.string('name');
            table.integer('alias');
            table.integer('kills');
            table.integer('deaths');
            table.integer('faction');
            table.integer('members');
            table.timestamp('created');
            table.timestamp('updated');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
