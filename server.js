const express = require("express");
const cors = require("cors");
const mongoose =require("mongoose");
const config = require("./config/config.json");

// configaration
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// db connection
mongoose.connect(config.MONGO_URL).then((data)=>{
    console.log("conencted to db");
}).catch((err)=>{
    console.log("no connection")
});

// api Routes
app.use("/api/userRoutes/", require("./routes/userRoutes"));

app.listen(config.PORT,()=>{
    console.log(`server is runninng on the: http://localhost:${config.PORT}`);
})