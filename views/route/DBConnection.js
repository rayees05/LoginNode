var mysql  = require('mysql2');

const connectionDb = ()=>{
    const connection = mysql.createConnection({
        host: '192.168.1.27',
        user: 'rayeestest',
        password: 'password',
        database: 'rayeesdb3'
    });
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err);
          return;
        }
        console.log('Connected to the database.');
      });
      return connection
} 
module.exports = connectionDb