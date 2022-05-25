const mysql = require('mysql');
const config = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'my_course'
}
 

exports.db = (sql, sqlParams) => {
  return new Promise((resolve, reject) => {
    const pool = mysql.createPool(config)
    pool.getConnection((err, conn) => {
      if (!err) {
        conn.query(sql, sqlParams, (e, results) => {
          if (!e) {
            resolve(results)
            conn.destroy()
          } else {
            console.log("sql: " + e)
            reject(e)
          }
        })
      } else {
        console.log("conn err: " + err)
        reject(err)
      }
    })
  })
}
