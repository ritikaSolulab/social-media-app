import { Request, Response, NextFunction } from "express";
import nodemailer from "nodemailer";
import { error } from "winston";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import lodash from "lodash";
import { logger } from "../../logger";
import { UserModel } from "../../model/User";
import { UserOTPVerificationModel } from "../../model/UserOTPVerification";
import { TokenModel } from "../../model/Token";

const SECRET_TOKEN = "Ritika123";

export const register = async (req: Request, res: Response) => {
  logger.info("Inside register");
  try {
    const { email,password,username } = req.body;
    if (lodash.isEmpty(email) || lodash.isEmpty(password)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // checking if email is exist or not
    const emailExist = await UserModel.findOne({ email: email });
    if (emailExist) {
      logger.error(`User with ${email} already registered`);
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    //checking if username is exist or not
    const usernameExist = await UserModel.findOne({ username: username})
    if(usernameExist){
      logger.error(`User with ${username} already exist`);
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const createUser = await UserModel.create({
      email,
      password: hash,
      username
    });
    if (createUser) {
      logger.info(`User created:${createUser}`);
      await sendOTPVerificationEmail(email);
      return res.status(201).json({
        status: "Pending",
        message: "Verification otp email sent",
      });
    }
    logger.error(`User data is not valid:${(error as any).message}`);
    return res.status(400).json({
      success: false,
      message: "User data is not valid.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const sendOTPVerificationEmail = async (email: string) => {
  logger.info("Inside OTP Verification");
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'orville59@ethereal.email',
          pass: 'SuyQWU28mdQkpHGxAu'
      }
    });
    let message = {
      from: "orville59@ethereal.email",
      to: email,
      subject: "Verify your email",
      text: `<p>Enter <b> ${otp}</b></p><p>This code <b>expires in 5 min</b>.</p>`,
    };
    await UserOTPVerificationModel.create({
      email: email,
      otp: otp,
      expiresAt: Date.now() + 1000 * 60 * 5,
    });
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  logger.info("Inside verifyOTP");
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Provide valid details" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const UserOTPVerificationRecords = await UserModel.findOne({email:email});
    if (!UserOTPVerificationRecords) {
      return res.status(400).json({
        message: "Account record does not exist or has been verified already",
      });
    }
    const otpDetails = await UserOTPVerificationModel.find({email:email})
    if(!otpDetails.length){
      return res.status(400).json({
        message: 'Your email is not exist or your otp has been expired'
      })
    }
    const dbOTP = otpDetails[otpDetails.length-1].otp
    const dbExpires = otpDetails[otpDetails.length-1].expiresAt
    if (dbOTP != otp || (dbExpires as number < Date.now())){
      return res.status(401).json({ message: "code has expired. Please request again" });
    }
    const bearerToken = Jwt.sign(
        {
          email: email, _id:UserOTPVerificationRecords._id
        },
        SECRET_TOKEN as string,
        {
          expiresIn: "5h",
        }
      );
      logger.info("Access successfully generated");
      await UserModel.updateOne({ email: email }, { isVerified: true });
      await UserOTPVerificationModel.deleteOne({otp:otp})
      return res.status(201).json({
        status: "Verified",
        message: "Your otp has been verified",
        bearerToken,
      });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server Error");
  }
};

// export const resendOtpVerificationEmail = async (
//   req: Request,
//   res: Response
// ) => {
//   logger.info("Inside resend otp");
//   try {
//     const { email, password } = req.body;
//     if (lodash.isEmpty(email) || lodash.isEmpty(password)) {
//       logger.error(`Provide all the details: ${(error as any).message}`);
//       return res.status(400).json({
//         success: false,
//         message: "Provide all the details",
//       });
//     }
    
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json("Provide valid details");
//   }
// };


export const sendEmail = async (email:string, subject:string, text:string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'orville59@ethereal.email',
          pass: 'SuyQWU28mdQkpHGxAu'
      }
    });
    let message = {
      from: "orville59@ethereal.email",
      to: email,
      subject: "reset your password",
      text: text,
    };
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};


export const forgotPassword = async(req: Request, res: Response, next: NextFunction) => {
  logger.info("Inside forgot password");
  try {
    const { email } = req.body;
    if (lodash.isEmpty(email)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Please provide your registered email",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    //checking that user is exist in database or not
    const emailExist = await UserModel.findOne({ email: email });
    if (!emailExist) {
      logger.error(`User with ${email} is not registered`);
      return res.status(400).json({
        success: false,
        message: "Email is not registered",
      });
    }


    let token = await TokenModel.findOne({ userId: emailExist._id });
    if (!token) {
        token = await new TokenModel({
          userId: emailExist._id,
            token: Jwt.sign(
              {
                _id: emailExist._id, email:emailExist.email
              },
              SECRET_TOKEN as string,
              {
                expiresIn: "5h",
              }
            ),
        }).save();
    }

    const link = `localhost:8080/password-reset/${token.token}`;
    await sendEmail(emailExist.email, "Password reset", link);
    return res.status(200).json({message:"password reset link sent to your email account"});
  } catch (err) {
      console.log(err);
      return res.status(400).json("server error");
    }
};

export const resetPassword = async(req: Request, res: Response) => {
  logger.info("Inside reset password");
  try {
      //const {userId} = req.query
      const {userId,newPassword} = req.body
      let token
      let authHeader = (req.headers.Authorization || req.headers.authorization) as string
      if(authHeader && authHeader.startsWith('Bearer')){
        token = authHeader.split(' ')[1]
      }
      //console.log(token)
      const user = await UserModel.findById(userId);
      //console.log("user",user)
      if (!user) return res.status(400).json({message:"This user does not exist"});

      const checkToken = await TokenModel.findOne({
          //userId: userId,
          token: token
      });
      //console.log(checkToken)
      if (!checkToken) return res.status(400).json({message:"Invalid token"});

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      user.password = hash;
      await user.save();
      await checkToken.deleteOne({token:token});

      if(await bcrypt.compare(user.password, newPassword)){
        return res.status(400).json({message: 'Your new password should be unique'})
      }
      return res.status(200).json({message:"password reset sucessfully."});
    
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};


export const login = async(req:Request,res:Response) => {
  logger.info('Inside login')
  try{
      const {email,password} = req.body

      //checking if email exists
      const user = await UserModel.findOne({email: email})
      if(!user) return res.status(400).json({
          success: false,
          message: 'Email or password is wrong'
      })

      if(user.isVerified !== true){
        return res.status(400).json({message:'User is not registered'})
      }

      // checking if password is correct or not
      const validPass = await bcrypt.compare(password, user.password)
      if(!validPass) return res.status(400).json({
          success: false,
          message: 'Invalid password'
      });

          if(user.isDeleted){
              return res.status(400).json({success: false,message:'This user has been deleted'})
          }

      //create and assign token
      const findUser = await UserModel.findOne({email:email});
      if (findUser) {
        logger.info(`User created:${findUser}`);
        await sendOTPVerificationEmail(email);
        return res.status(201).json({
          status: "Pending",
          message: "send otp to your email",
        });
      }
  }catch(err){
      res.status(400).json({message: 'Provide valid details'})
  }
}