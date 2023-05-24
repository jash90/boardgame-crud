exports.up = function (knex) {
  return knex.schema.table('BoardGames', function (table) {
    table.string('barcode');
  });
};

exports.down = function (knex) {
  return knex.schema.table('BoardGames', function (table) {
    table.dropColumn('barcode');
  });
};
