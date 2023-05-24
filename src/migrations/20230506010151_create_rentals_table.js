exports.up = function (knex) {
  return knex.schema.createTable('rentals', function (table) {
    table.increments('id').primary();
    table
      .integer('boardgame_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('boardgames');
    table.string('customer_name').notNullable();
    table.date('rental_start_date').notNullable();
    table.date('rental_end_date').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('rentals');
};
