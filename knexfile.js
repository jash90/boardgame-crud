require('dotenv').config()
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    migrations: {
      directory: './src/migrations' // replace this with your new migration path
    },
    useNullAsDefault: true
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/migrations' // replace this with your new migration path
    },
    useNullAsDefault: true
  }
}
