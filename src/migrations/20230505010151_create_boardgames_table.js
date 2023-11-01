// migrations/202305061_create_boardgames_table.js
exports.up = function (knex) {
  return knex.schema.createTable('boardgames', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.string('category')
    table.integer('min_players').notNullable()
    table.integer('max_players').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('boardgames')
}
