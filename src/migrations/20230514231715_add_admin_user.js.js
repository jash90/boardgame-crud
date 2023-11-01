const bcrypt = require('bcrypt')
const saltRounds = 10

exports.up = function (knex) {
  const hash = bcrypt.hashSync('password', saltRounds)
  return knex('users').insert({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: hash,
    role: 'admin'
  })
}

exports.down = function (knex) {
  return knex('users').where('email', 'admin@example.com').del()
}
