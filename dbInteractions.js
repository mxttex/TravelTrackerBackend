const mariadb = require('mariadb')

const conn = mariadb.createConnection({
    host: "192.0.2.1",
    user: "db_user",
    password: "db_user_password",
    database: "test",
    trace: true,
 });

 