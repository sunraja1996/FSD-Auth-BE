var express = require('express');
const {mongoose} = require('mongoose');
const {dbUrl} = require('../config/dbconfig');
const {userModel} = require ('../schema/userSchema');
const {hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin,roleUser} = require('../config/auth')
const {sendEmailService} = require('../utils/emailService')

var router = express.Router();

mongoose.connect(dbUrl,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));






router.get('/email/:emailid', async(req, res) => {
  try {
    await sendEmailService(req.params.emailid, 'TEST  EMAIL', `<h1> Hi this is the test email from React app <h1>`)
    res.send({statusCode:200, message:"Email sent"})
  } catch (error) {
    console.log('error');
    res.send({statusCode:500, message:"Internal server Error"})
  }
})



router.get('/all-users', validate, roleAdmin, async(req, res)=>{
  try {
    let users = await userModel.find({}, {password:0});
    res.send({statusCode:200, users, message:"DATA Fetch Successfull"})
  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})



router.put('/update-user/:email', validate, async (req, res) => {
  try {
 
    const updatedUser = await userModel.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
      
    );

    console.log(updatedUser);
    
    if (!updatedUser) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "User not found" });
    }

    res.send({
      statusCode: 200,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});



router.delete('/delete-user/:email', validate, roleAdmin, async (req, res) => {
  try {
    const deletedUser = await userModel.findOneAndDelete(req.params.email);

    if (!deletedUser) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "User not found" });
    }

    res.send({
      statusCode: 200,
      user: deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});



router.get('/userprofile',validate, async (req, res) => {

  try {
    const { email } = req.body;
    console.log(email);
    let user = await userModel.findOne({ email }, { password: 0 });

    if (!user) 
    {
    return res.status(404).send({ statusCode: 404, message: 'User not found' });
  }

    res.send({statusCode:200, user, message:"Profile Verified"})

  } catch (error) {

    res.send({statusCode:500, message:"Internal Server Error"})
    
  }
})






router.post('/signup', async(req, res)=>{
  try {
    let user = await userModel.findOne({email:req.body.email})
    if(!user){
      let hashedPassword = await hashPassword(req.body.password)
      let otp = Math.round(Math.random()*10000)
      let data = {
          firstName : req.body.firstName,
          lastName : req.body.lastName,
          email : req.body.email,
          password : hashedPassword, 
          tempOTP : otp,
      } 

      let emailBody = `
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Verify you Email</a>
        </div>
        <p style="font-size:1.1em">Hi, ${data.firstName} ${data.lastName}</p>
        <p>Thank you for choosing. Use the following OTP to complete your Sign Up procedures. OTP is valid for 2 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />Shanmugaraja  &#169; </p>
        <hr style="border:none;border-top:1px solid #eee" />
      </div>
    </div>
      `

      await userModel.create(data)
      await sendEmailService(data.email, 'Verify Your Email', emailBody)


      res.send({statusCode:200, message:"User Signup Successful"})

    }else
      res.send({statusCode:400, message:"User already exists"})
    

  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})


router.post('/verify-email', async(req, res) => {
  try {
    let user = await userModel.findOne({email:req.body.email})
    if(user)
    {
        if(req.body.otp===user.tempOTP){
          user.tempOTP=null
          user.emailVerify='Y'
          await user.save();

          res.send({statusCode:200, message:"Verification Successfull"})
        }
        else {
      res.send({statusCode:400, message:"Invalid OTP"})
        }
    }
    else 
      res.send({statusCode:400, message:"User doesnot exists"})
    
  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})


router.post('/login', async(req, res)=>{
  try {

    let user = await userModel.findOne({email:req.body.email})

    if (user) {
      if(await hashCompare(req.body.password, user.password))
      {
        let token = await createToken(user)
        if (user.role === 'admin') {

          res.send({statusCode:200, message:"Admin Login Successful", role: 'admin', token})

        } else if (user.role === 'user') {

          res.send({statusCode:200, message:"User Login Successful", role: 'user', token})

        } else {
          res.send({statusCode:400, message:"Invalid Role"})
        }
      }

      else
        res.send({statusCode:400, message:"Invalid Crediantials"})
      

    }
    else 
    
      res.send({statusCode:400, message:"User doesnot exists"})
    

  
  } catch (error) {
    console.log(error);
    res.send({statusCode:500, message:"Internal server Error"})
  }
})



module.exports = router;
