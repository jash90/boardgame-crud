module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    migrations: {
      directory: './src/migrations', // replace this with your new migration path
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'admin',
      password: 'dbB2r#e4',
      database: 'boardgames',
    },
    migrations: {
      directory: './src/migrations', // replace this with your new migration path
    },
    useNullAsDefault: true,
  },
};
