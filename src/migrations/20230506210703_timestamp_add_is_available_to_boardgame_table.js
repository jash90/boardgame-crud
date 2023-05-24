exports.up = function (knex) {
  return knex.schema.table('boardgames', (table) => {
    table.boolean('is_available').defaultTo(true).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('boardgames', (table) => {
    table.dropColumn('is_available');
  });
};
