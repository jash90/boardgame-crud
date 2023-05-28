// knex migration file
exports.up = function(knex) {
  return knex.schema.table('rentals', function(table) {
    table.integer('rating').nullable();
    table.string('review', 1000).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('rentals', function(table) {
    table.dropColumn('rating');
    table.dropColumn('review');
  });
};
