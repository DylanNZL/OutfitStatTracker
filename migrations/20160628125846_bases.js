
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('base_history', function (table) {
            table.increments();
            table.timestamp('timestamp');
            table.string('base_id');
            table.string('base_name');
            table.string('previous_faction');
            table.string('new_faction');
            table.string('outfit_id');
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
