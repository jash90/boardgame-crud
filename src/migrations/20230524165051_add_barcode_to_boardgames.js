exports.up = function (knex) {
  return knex.schema.table('boardgames', function (table) {
    table.string('barcode')
  })
}

exports.down = function (knex) {
  return knex.schema.table('boardgames', function (table) {
    table.dropColumn('barcode')
  })
}
