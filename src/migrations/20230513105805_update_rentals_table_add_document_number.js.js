exports.up = async function (knex) {
  await knex.schema.table('rentals', function (table) {
    table.string('document_number');
  });
};

exports.down = async function (knex) {
  await knex.schema.table('rentals', function (table) {
    table.dropColumns('document_number');
  });
};
