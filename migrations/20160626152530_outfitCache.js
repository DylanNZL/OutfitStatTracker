
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('outfitCache', function (table) {
            table.string('outfitID').unique();
            table.string('outfitName');
            table.string('outfitTag');
            table.integer('MemberCount');
            table.timestamp('created');
            table.timestamp('update');
            table.json('outfitMembers');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
