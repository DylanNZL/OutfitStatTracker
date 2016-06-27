
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('trackedKill', function (table) {
            table.increments('_id');
            table.timestamp('timestamp');
            table.string('character_id');
            table.string('weapon');
            table.integer('loadout');
            table.string('loserChar');
            table.integer('loserLoadout');
            table.boolean('isHeadshot');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
