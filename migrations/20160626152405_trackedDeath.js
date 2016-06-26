
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('trackedDeath', function (table) {
            table.increments('_id');
            table.timestamp('timestamp');
            table.string('character_id');
            table.string('outfitID');
            table.string('outfitTag');
            table.string('outfitName');
            table.string('weapon');
            table.integer('winnerLoadout');
            table.string('loserChar');
            table.integer('loserLoadout');
            table.boolean('isHeadshot');
        })
    ])
};


exports.down = function(knex, Promise) {
  
};
