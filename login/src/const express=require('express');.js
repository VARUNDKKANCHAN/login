const express=require('express');
const path=require("path");
const bcrypt=require("bcrypt");
const ejs = require("ejs");
const collection=require("./config");
const { body, validationResult } = require('express-validator');
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{
  res.render("login");
});const express=require('express');
const path=require("path");
const bcrypt=require("bcrypt");
const ejs = require("ejs");
const collection=require("./config");
const { body, validationResult } = require('express-validator');
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{
  res.render("login");
});

app.get("/signup",(req,res)=>{

  res.render("signup");
});

app.post("/signup",async(req,res)=>{
const data={
  name:req.body.name,
  password:req.body.password,
}
const exiting=await collection.findOne({name:data.name});
if(exiting){
  res.send("user already exist");
}else{
  //hash
 const saltround=10;
 const hashPassword=await bcrypt.hash(data.password,saltround);
 data.password=hashPassword;
 
const userdata=await collection.insertMany(data);
console.log(userdata);
}
});
//login function

app.post("/login",async(req,res)=>{
try{
  const check=await collection.findOne({name:req.body.username})
if(!check){
  res.render("login");
}else{
//comapre password
const isPasswordMatch=await bcrypt.compare(req.body.password,check.password);
if(isPasswordMatch){
  res.render("home");
}else{
  res.send("password not match");
}
}
}catch{
res.send("Wrong details");
}
});


const port=5000;
app.listen(port,()=>{
  console.log(`server runing on port:${port}`);
});





app.get("/signup",(req,res)=>{

  res.render("signup");
});

app.post("/signup",async(req,res)=>{
const data={
  name:req.body.name,
  password:req.body.password,
}
const exiting=await collection.findOne({name:data.name});
if(exiting){
  res.send("user already exist");
}else{
  //hash
 const saltround=10;
 const hashPassword=await bcrypt.hash(data.password,saltround);
 data.password=hashPassword;
 
const userdata=await collection.insertMany(data);
console.log(userdata);
}
});
//login function

app.post("/login",async(req,res)=>{
try{
  const check=await collection.findOne({name:req.body.username})
if(!check){
  res.render("login");
}else{
//comapre password
const isPasswordMatch=await bcrypt.compare(req.body.password,check.password);
if(isPasswordMatch){
  res.render("home");
}else{
  res.send("password not match");
}
}
}catch{
res.send("Wrong details");
}
});


const port=5000;
app.listen(port,()=>{
  console.log(`server runing on port:${port}`);
});



