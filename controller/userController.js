const User = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const config = require("../config/config.json");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const userController = {
       userRegister:async(req,res)=>{
          console.log(req.body);
          const {name, email , password} = req.body;
          const user = await User.findOne({email});
          if(user){
              return res.status(400).json({err:{message:"User already exists"}});
          }
          
          const passwordhash = await bcrypt.hash(password,10);
          const newUser = new User({
              name:name,
              email:email,
              password:passwordhash
          })
          await newUser.save();
          return res.status(201).json({message:"User Register Successfully", data:newUser});
       },

       /// UserLogin
       Login:async(req,res)=>{
        try{
         console.log(req.body);
         const {email, password} = req.body;
         const validate = validator.isEmail(email);
         if(!validate){
             return res.status(400).json({message:"email format is not valid"
           });
         }
         const user = await User.findOne({email});
         if(!user){
             return res.status(400).json({message:"User is not exists"});
         }
         const isMatch = await bcrypt.compare(password,user.password);
         if(!isMatch){
             return res.status(400).json({message:"password does not matched"});
         }
         const Token  = jwt.sign({
          id:user._id,
  
      },config.SECRET_KEY,{expiresIn:"7d"});
         return res.status(200).json({
             message:"Login success",
             data:user,
             token:Token
         });
         }catch(err){
           return res.status(500).json({err:err.message}); 
        }
      },

    forgetPassword:async(req,res)=>{
        try{ 
            console.log(req.body);
            const email = req.body.email
            const user = await User.findOne({email:email});
            if(user){
                const randomString = randomstring.generate();
                sendEmailResetPasswordMail(user.name,user.email,randomString)
                const data =await User.updateOne({email:email},{$set:{resetToken:randomString}});
                return res.status(200).json({
                    message:"Please check your mail box and reset  your password",
                    data:data
                })
            }else{
                return res.status(400).json({err:{message:"this email deos not exists"}});
            }
        }catch(err){
            return res.status(500).json({err:{message:"Some error occured!"}});
        }
    },
    
   reset_Password:async(req,res)=>{
      try{
        const token = req.query.resetToken;
        const tokenData = await User.findOne({token:resetToken});
        if(tokenData){
            password = req.body.password;
             const newPassword = await bcrypt.hash(password,10);
             const updateData = await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:newPassword, token:''}},{new:true});
             return res.status(200).json({
                 message:"Password has been reset successfully",
                 data:updateData
             })
        }
        else{
            return res.status(400).json({message:"Token link has been expired or incorrect token "});
        }
      }catch(err){
          return res.status(500).json({
              err:{
                  message:"Some error occured",
              }
          })
      }
   },

}

 const sendEmailResetPasswordMail= async(name,email,resetToken)=>{
    try{
    const transporter =  nodemailer.createTransport({
          host:'smtp.gmail.com',
          port:587,
          secure:false,
          requireTLS:true,
          auth:{
              user:config.emailUser,
              pass:config.userPass,
          }

      });

      const mailOptions = {
          from:config.emailUser,
          to:email,
          subject:'reset passowrd',
          html:`<h1> ${name} please reset your password for use of the given url: ${config.client_url}/reset_Password/${resetToken}</h1>`
      }
      transporter.sendMail(mailOptions,(error,response)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log("Mail has been sent", response.response);
        }
      });
        
    }catch(err){
        return res.status(400).json({err:{message:err.message}})
    }


}

module.exports = userController;