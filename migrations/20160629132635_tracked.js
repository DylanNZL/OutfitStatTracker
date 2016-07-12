
exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema.createTable('tracked', function (table) {
          table.string('character_id').unique();
          table.string('name');
          table.integer('rank');
          table.integer('kills');
          table.integer('deaths');
          table.integer('headshots');
          table.timestamp('created').defaultTo(Date.now());
          table.timestamp('updated').defaultTo(Date.now());
      })
  ])
};

exports.down = function(knex, Promise) {
  
};
