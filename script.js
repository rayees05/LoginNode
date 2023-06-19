// const path = require("path")
// const fs = require("fs")
// const value = require("./utils")
const express = require("express");
const app = express();
const dynamic = require("./views/route/dynamic");
const dbconnect = require("./views/route/DBConnection");
const cors = require("cors");
app.use(cors())
app.use(express.json());
app.use(dynamic);
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("views"));


app.get("/HKData",(req,res)=>{
    const connection = dbconnect()
    const {username,password} = req.body
    connection.query(`SELECT room.id, room.floor_id, room.number, room.name, room.inv_status, room.hk_status, room.occ_status, room.room_type_id, room_type.code, checkin.checkin_no, checkin.arr_date, checkin.exp_depart_date, checkin.act_depart_date, checkin.status, room.is_deleted,(select room_status 
      from resv_room 
      where resv_room.room_number = room.number ORDER BY room_status LIMIT 1) AS roomStatus 
      FROM room INNER JOIN room_type ON room.room_type_id = room_type.id LEFT JOIN (SELECT T2.checkin_no,T2.arr_date,T2.exp_depart_date,T2.act_depart_date,T2.room_number,T2.status
      FROM(SELECT  max(checkin_hdr.checkin_no) AS checkin_no 
      FROM checkin_hdr GROUP BY room_number)T1 INNER JOIN 
      checkin_hdr T2 ON T1.checkin_no = T2.checkin_no ) checkin ON checkin.room_number = room.number WHERE room.is_deleted = 0  GROUP BY room.number ORDER BY room.room_type_id, room.number`, (err, results) => {
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
app.post("/updateHKStatus",MiddleFunction,(req,res)=>{
  const connection = dbconnect();
  const {roomname,status} = req.body
  const Status = parseInt(status)
  const procedureCall = 'CALL update_select_hk_status(?, ?)';
  connection.query(procedureCall,[Status,roomname],(err,results)=>{
      if(err){
        console.log('Error :Not getting data',err)
        return
      }
      console.log("connected")
      res.json(results)
      console.log(results,req.body,'res')
    })
    connection.end((err) => {
      if (err) {
        console.error('Error closing the connection:', err);
        return;
      }
      console.log('Connection closed.');
    });
  connection.end();
})

function MiddleFunction (req,res,next){
  const {roomname,status} = req.body
  if (roomname !== undefined && status !== undefined){
    next()
  }else{
    res.status(401).send("error 401")
  }
}
app.get("*",(req,res)=>{
    res.status(404).send("error 404")
});

const PORT =  process.env.PORT || 3001


app.listen(PORT,(err)=>{
  if (err){
    console.log("err")
  }else{
    console.log(`server is running ${PORT}`)
  }
})

// fs.appendFile(path.join(__dirname,"/api","api.txt"),"\nhello im there are you there",(er)=>{
//     if (er) throw er;
//     console.log(value.testFunc());
//     console.log("hello")
// })