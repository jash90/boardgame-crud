exports.up = async function(knex) {
    await knex.schema.table('rentals', function(table) {
        table.dropColumn('customer_name');
        table.string('first_name');
        table.string('last_name');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('rentals', function(table) {
        table.dropColumns('first_name', 'last_name');
        table.string('customer_name');
    });
};
