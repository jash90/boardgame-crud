exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('username')
  })
}

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('username').notNullable()
  })
}
