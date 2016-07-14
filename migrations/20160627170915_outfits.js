
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('outfits', function (table) {
            table.string('outfit_id').unique();
            table.string('name');
            table.string('alias');
            table.integer('kills');
            table.integer('deaths');
            table.integer('faction');
            table.integer('members');
            table.timestamp('created').defaultTo(knex.fn.now());
            table.timestamp('updated').defaultTo(knex.fn.now());
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
