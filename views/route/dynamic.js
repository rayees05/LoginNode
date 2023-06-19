const express = require("express");
const app = express();
const router = express.Router();
const dbconnect = require("./DBConnection")
app.use(express.json());


router.get("/",(req,res)=>{
    res.send("hey!")
     console.log("")
});
router.get("/dashboardData",async(req,res)=>{
        var roomdata =[];
  const connection = dbconnect();
  connection.query(`SELECT id ,code FROM room_type`,(err,results)=>{
        if(err){
                console.log("error")
                return res.sendStatus(500);
        }
        roomdata = results
        console.log(results,"result")
        const roomengageddata =  results.map((item)=>{
            return new Promise((resolve,reject)=>{
                  const procedure_call = "CALL select_room_status(?,?)"
                  connection.query(procedure_call,[item.id,item.code], (err, results) => {
                  if (err) {
                        console.error('Error executing the query:', err);
                        reject (err);
                  }else{
                        resolve(results)
                  }
                  // res.json(results)
                  // roomengageddata.push(results)
                  });
            })
      })
      Promise.all(roomengageddata).then((data)=>{
            console.log('Query results:', data);
            res.send(data);
      }).catch((err)=>{
            console.error('Error:', err);
            res.sendStatus(500);
      }).finally(()=>{
            connection.end((err) => {
                  if (err) {
                        console.error('Error closing the connection:', err);
                        return;
                  }
                  console.log('Connection closed.');
                  });
            
      })
  })
//   connection.end();
});
router.get("/userData",(req,res)=>{
      try{
            const connection = dbconnect();
            connection.query(`SELECT d.id ,d.name,d.is_admin,d.is_new_booking,d.is_guest_details,d.is_settings,d.is_housekeeping,d.is_cashier,d.user_group_id,ug.name as user_group_name FROM users d INNER JOIN user_groups ug ON ug.id = d.user_group_id`,(err,results)=>{
                  if(err){
                        res.sendStatus(404)
                        return;
                  }
                  res.send(results)
            })
            connection.end((err) => {
                  if (err) {
                        console.error('Error closing the connection:', err);
                        return;
                  }
                  console.log('Connection closed.');
                  });
      }catch{
            res.send("Connection error").res.status(402)
            console.log("Oops, Something went wrong!")
      }
})
const DataMiddleAction = (req,res,next)=>{
      const {cat_name,status,user_id} = req.body
      if (cat_name !== undefined && status !== undefined && user_id !== undefined){
        next()
      }else{
        res.status(401).send("error 401")
      }
}
router.post("/userUpdate",DataMiddleAction,(req,res)=>{
      const {cat_name,status,user_id} = req.body
      const category = cat_name == "House Keeping" ? "is_housekeeping" : cat_name == "New Booking" ? "is_new_booking" :cat_name == "Guest Details" ? "is_guest_details" :cat_name ==  "AMS" ? "is_AMS" :null
      try{
            const connection = dbconnect();
            connection.query('UPDATE dashboard_user_details SET ?? = ? WHERE id = ?', [category,status,user_id],(err,results)=>{
                  if(err){
                        res.sendStatus(404)
                        console.log("getting error")
                        return;
                  }
                  res.send("updated succesfully")
                  console.log("success")
            })
            connection.end((err) => {
                  if (err) {
                        console.error('Error closing the connection:', err);
                        return;
                  }
                  console.log('Connection closed.');
                  });
      }catch{
            res.send("Connection error").res.status(402)
            console.log("Oops, Something went wrong!")
      }
})
const validateDateForGuestDetails = (req,res,next)=>{
      const {startDate,endDate} = req.body;
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      const valStartDate = dateFormatRegex.test(startDate)
      const valEndDate = dateFormatRegex.test(endDate)
      if(valStartDate && valEndDate){
            next()
            return
      }
      res.status(401)

}
router.post("/guestDetails",validateDateForGuestDetails,(req,res)=>{
      const connection = dbconnect();
      const {startDate,endDate} = req.body;
      try{
            const procedureCall = 'CALL Getguestdetails(?, ?)';
            connection.query(procedureCall,[startDate,endDate],(err,results)=>{
                  if(err){
                        res.send("connection failed").status(404)
                        return;
                  }
                  res.json(results[0])
            })

      }catch{
            res.status(500)
            res.send("connection error")
            console.log("error")
      }
})


module.exports = router;