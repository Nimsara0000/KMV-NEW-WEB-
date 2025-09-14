const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password',
    database: 'kmv_school'
});

db.connect(err => {
    if(err) console.error('DB connection error:', err);
    else console.log('Connected to MySQL');
});

module.exports = db;
