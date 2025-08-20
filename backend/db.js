const Pool = require("pg").Pool
const pool = new Pool({
    user: "postgres",
    password: "123",
    host: "localhost",
    port: 5433,
    database: "auto_qa3"
})

module.exports = { pool };