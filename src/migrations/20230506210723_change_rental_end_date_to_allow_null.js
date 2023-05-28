exports.up = function(knex) {
  return knex.schema.alterTable('rentals', (table) => {
    table.date('rental_end_date').nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('rentals', (table) => {
    table.date('rental_end_date').notNullable().alter();
  });
};
