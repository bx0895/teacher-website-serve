const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'my_course'
  }
})

module.exports = {
  knex
}