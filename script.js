// const path = require("path")
// const fs = require("fs")
// const value = require("./utils")
const express = require("express");
const app = express();
var mysql      = require('mysql2');
// const mysql = require('mysql');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));


// fs.appendFile(path.join(__dirname,"/api","api.txt"),"\nhello im there are you there",(er)=>{
//     if (er) throw er;
//     console.log(value.testFunc());
//     console.log("hello")
// })
const connectionDb = ()=>{
    const connection = mysql.createConnection({
        host: '192.168.1.27',
        user: 'rayeestest',
        password: 'password',
        database: 'rayeesdb'
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




app.get("/",(req,res)=>{
    res.sendFile()
     console.log("starting")
});

app.post("/submited",(req,res)=>{
    const connection = connectionDb()
    const {username,password} = req.body
    connection.query(`INSERT INTO login VALUES ('${username}','${password}') `, (err, results) => {
    if (err) {
        console.error('Error executing the query:', err);
        return;
    }
    // res.json(results)
    res.send(results)
    console.log('Query results:', results);
    });
    connection.end((err) => {
        if (err) {
          console.error('Error closing the connection:', err);
          return;
        }
        console.log('Connection closed.');
      });
    connection.end();
});
app.get("*",(req,res)=>{
    res.status(404).send("error 404")
});

const PORT =  process.env.PORT || 3001

app.listen(PORT)