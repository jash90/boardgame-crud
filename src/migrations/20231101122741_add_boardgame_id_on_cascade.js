exports.up = async function (knex) {
  await knex.schema.alterTable('rentals', function (table) {
    table.dropForeign('boardgame_id')

    table.foreign('boardgame_id')
      .references('id')
      .inTable('boardgames')
      .onDelete('CASCADE')
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('rentals', function (table) {
    table.dropForeign('boardgame_id')

    table.foreign('boardgame_id')
      .references('id')
      .inTable('boardgames')
  })
}
