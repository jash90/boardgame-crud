exports.up = function(knex) {
  return knex.schema.table('boardgames', function(table) {
    table.string('cover');
  });
};

exports.down = function(knex) {
  return knex.schema.table('boardgames', function(table) {
    table.dropColumn('cover');
  });
};
