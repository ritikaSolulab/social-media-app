"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_express2 = __toESM(require("express"));
var import_mongoose6 = __toESM(require("mongoose"));
var import_cors = __toESM(require("cors"));

// src/routes/router.ts
var import_express = __toESM(require("express"));
var import_multer = __toESM(require("multer"));

// src/controllers/auth/register.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_winston2 = require("winston");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var import_validator = __toESM(require("validator"));
var import_lodash = __toESM(require("lodash"));

// src/logger.ts
var import_winston = __toESM(require("winston"));
var options = {
  file: {
    level: "info",
    filename: "./logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true
  }
};
var logger = import_winston.default.createLogger({
  levels: import_winston.default.config.npm.levels,
  transports: [
    new import_winston.default.transports.File(options.file),
    new import_winston.default.transports.Console(options.console)
  ],
  exitOnError: false
});

// src/model/User.ts
var import_mongoose = __toESM(require("mongoose"));
var userSchema = new import_mongoose.default.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    username: {
      type: String,
      index: { unique: true }
    },
    followers: [{ type: String }],
    following: [{ type: String }],
    isVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public"
    }
  },
  { timestamps: true }
);
var UserModel = import_mongoose.default.model("User", userSchema);

// src/model/UserOTPVerification.ts
var import_mongoose2 = __toESM(require("mongoose"));
var userOTPVerificationSchema = new import_mongoose2.default.Schema(
  {
    email: { type: String, ref: "User", required: true },
    otp: { type: String },
    expiresAt: { type: Number }
  }
);
var UserOTPVerificationModel = import_mongoose2.default.model("UserOTPVerification", userOTPVerificationSchema);

// src/model/Token.ts
var import_mongoose3 = __toESM(require("mongoose"));
var tokenSchema = new import_mongoose3.default.Schema(
  {
    userId: {
      type: import_mongoose3.Types.ObjectId,
      required: true,
      ref: "User"
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600
    }
  },
  { timestamps: true }
);
var TokenModel = import_mongoose3.default.model("Token", tokenSchema);

// src/controllers/auth/register.ts
var SECRET_TOKEN = "Ritika123";
var register = async (req, res) => {
  logger.info("Inside register");
  try {
    const { email, password, username } = req.body;
    if (import_lodash.default.isEmpty(email) || import_lodash.default.isEmpty(password)) {
      logger.error(`Provide all the details: ${import_winston2.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    const salt = import_bcrypt.default.genSaltSync(10);
    const hash = import_bcrypt.default.hashSync(password, salt);
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      logger.error(`User with ${email} already registered`);
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    const usernameExist = await UserModel.findOne({ username });
    if (usernameExist) {
      logger.error(`User with ${username} already exist`);
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }
    if (!import_validator.default.isEmail(email)) {
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
        message: "Verification otp email sent"
      });
    }
    logger.error(`User data is not valid:${import_winston2.error.message}`);
    return res.status(400).json({
      success: false,
      message: "User data is not valid."
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var sendOTPVerificationEmail = async (email) => {
  logger.info("Inside OTP Verification");
  try {
    const otp = `${Math.floor(1e3 + Math.random() * 9e3)}`;
    const transporter = import_nodemailer.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "orville59@ethereal.email",
        pass: "SuyQWU28mdQkpHGxAu"
      }
    });
    let message = {
      from: "orville59@ethereal.email",
      to: email,
      subject: "Verify your email",
      text: `<p>Enter <b> ${otp}</b></p><p>This code <b>expires in 5 min</b>.</p>`
    };
    await UserOTPVerificationModel.create({
      email,
      otp,
      expiresAt: Date.now() + 1e3 * 60 * 5
    });
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};
var verifyOTP = async (req, res) => {
  logger.info("Inside verifyOTP");
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Provide valid details" });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const UserOTPVerificationRecords = await UserModel.findOne({ email });
    if (!UserOTPVerificationRecords) {
      return res.status(400).json({
        message: "Account record does not exist or has been verified already"
      });
    }
    const otpDetails = await UserOTPVerificationModel.find({ email });
    if (!otpDetails.length) {
      return res.status(400).json({
        message: "Your email is not exist or your otp has been expired"
      });
    }
    const dbOTP = otpDetails[otpDetails.length - 1].otp;
    const dbExpires = otpDetails[otpDetails.length - 1].expiresAt;
    if (dbOTP != otp || dbExpires < Date.now()) {
      return res.status(401).json({ message: "code has expired. Please request again" });
    }
    const bearerToken = import_jsonwebtoken.default.sign(
      {
        email,
        _id: UserOTPVerificationRecords._id
      },
      SECRET_TOKEN,
      {
        expiresIn: "5h"
      }
    );
    logger.info("Access successfully generated");
    await UserModel.updateOne({ email }, { isVerified: true });
    await UserOTPVerificationModel.deleteOne({ otp });
    return res.status(201).json({
      status: "Verified",
      message: "Your otp has been verified",
      bearerToken
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server Error");
  }
};
var sendEmail = async (email, subject, text) => {
  try {
    const transporter = import_nodemailer.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "orville59@ethereal.email",
        pass: "SuyQWU28mdQkpHGxAu"
      }
    });
    let message = {
      from: "orville59@ethereal.email",
      to: email,
      subject: "reset your password",
      text
    };
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};
var forgotPassword = async (req, res, next) => {
  logger.info("Inside forgot password");
  try {
    const { email } = req.body;
    if (import_lodash.default.isEmpty(email)) {
      logger.error(`Provide all the details: ${import_winston2.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Please provide your registered email"
      });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const emailExist = await UserModel.findOne({ email });
    if (!emailExist) {
      logger.error(`User with ${email} is not registered`);
      return res.status(400).json({
        success: false,
        message: "Email is not registered"
      });
    }
    let token = await TokenModel.findOne({ userId: emailExist._id });
    if (!token) {
      token = await new TokenModel({
        userId: emailExist._id,
        token: import_jsonwebtoken.default.sign(
          {
            _id: emailExist._id,
            email: emailExist.email
          },
          SECRET_TOKEN,
          {
            expiresIn: "5h"
          }
        )
      }).save();
    }
    const link = `localhost:8080/password-reset/${token.token}`;
    await sendEmail(emailExist.email, "Password reset", link);
    return res.status(200).json({ message: "password reset link sent to your email account" });
  } catch (err) {
    console.log(err);
    return res.status(400).json("server error");
  }
};
var resetPassword = async (req, res) => {
  logger.info("Inside reset password");
  try {
    const { userId, newPassword } = req.body;
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }
    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(400).json({ message: "This user does not exist" });
    const checkToken = await TokenModel.findOne({
      //userId: userId,
      token
    });
    if (!checkToken)
      return res.status(400).json({ message: "Invalid token" });
    const salt = import_bcrypt.default.genSaltSync(10);
    const hash = import_bcrypt.default.hashSync(newPassword, salt);
    user.password = hash;
    await user.save();
    await checkToken.deleteOne({ token });
    if (await import_bcrypt.default.compare(user.password, newPassword)) {
      return res.status(400).json({ message: "Your new password should be unique" });
    }
    return res.status(200).json({ message: "password reset sucessfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var login = async (req, res) => {
  logger.info("Inside login");
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Email or password is wrong"
      });
    if (user.isVerified !== true) {
      return res.status(400).json({ message: "User is not registered" });
    }
    const validPass = await import_bcrypt.default.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    if (user.isDeleted) {
      return res.status(400).json({ success: false, message: "This user has been deleted" });
    }
    const findUser = await UserModel.findOne({ email });
    if (findUser) {
      logger.info(`User created:${findUser}`);
      await sendOTPVerificationEmail(email);
      return res.status(201).json({
        status: "Pending",
        message: "send otp to your email"
      });
    }
  } catch (err) {
    res.status(400).json({ message: "Provide valid details" });
  }
};

// src/utils/verifyToken.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_winston3 = require("winston");
var SECRET_TOKEN2 = "Ritika123";
var verifyToken = async (req, res, next) => {
  logger.info("Inside verifyToken");
  try {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (Array.isArray(authHeader)) {
      authHeader = authHeader.join(",");
    }
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      import_jsonwebtoken2.default.verify(token, SECRET_TOKEN2, (err, decoded) => {
        if (err) {
          console.log(err);
          logger.error("User is not authorized");
          return res.status(401).json({
            message: "User is not authorized"
          });
        } else {
          req.user = decoded;
          next();
        }
      });
    } else {
      logger.error("User is not authorized or token is missing in the header");
      return res.status(401).json({ message: "User is not authorized or token is missing in the header" });
    }
  } catch (err) {
    logger.error(`Error in verifyToken: ${import_winston3.error.message}`);
    return res.status(400).json({ message: "server error" });
  }
};
var verificationOtp = async (req, res, next) => {
  logger.info("Inside verificationOTP");
  const user = await UserModel.findOne({ email: req.user.email });
  if (!user)
    return res.status(400).json({ message: "User is not valid" });
  verifyToken(req, res, () => {
    if (user.isVerified === true) {
      next();
    } else {
      return res.status(403).json({ message: "You are not verified!" });
    }
  });
};

// src/controllers/user.ts
var import_winston4 = require("winston");
var import_lodash2 = __toESM(require("lodash"));
var import_nodemailer2 = __toESM(require("nodemailer"));
var import_path = __toESM(require("path"));

// src/model/Memories.ts
var import_mongoose4 = __toESM(require("mongoose"));
var MemorySchema = new import_mongoose4.default.Schema(
  {
    userId: { type: import_mongoose4.default.Schema.Types.ObjectId, required: true, ref: "User" },
    title: {
      type: String,
      required: true
    },
    description: { type: String, required: true },
    tags: [String],
    imageUrl: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
var MemoryModel = import_mongoose4.default.model("Memory", MemorySchema);

// src/model/Comment.ts
var import_mongoose5 = __toESM(require("mongoose"));
var CommentSchema = new import_mongoose5.default.Schema(
  {
    comments: { type: String },
    userId: { type: import_mongoose5.default.Schema.Types.ObjectId, ref: "User", required: true },
    memoryId: { type: import_mongoose5.default.Schema.Types.ObjectId, ref: "Memory" },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
var CommentModel = import_mongoose5.default.model("Comment", CommentSchema);

// src/controllers/user.ts
var getFollowers = async (req, res) => {
  logger.info("Inside get Follower");
  try {
    const { userId, username } = req.query;
    if (import_lodash2.default.isEmpty(userId) || import_lodash2.default.isEmpty(username)) {
      logger.error(`Provide all the details: ${import_winston4.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    const user = await UserModel.findOne({ email: req.user.email });
    await UserModel.findById(userId).populate("followers");
    return res.status(200).json({ username, followers: user.followers });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var getFollowing = async (req, res) => {
  logger.info("Inside get Following");
  try {
    const { userId, username } = req.query;
    if (import_lodash2.default.isEmpty(userId) || import_lodash2.default.isEmpty(username)) {
      logger.error(`Provide all the details: ${import_winston4.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    const user = await UserModel.findOne({ email: req.user.email });
    await UserModel.findById(userId).populate("following");
    return res.status(200).json({ username, following: user.following });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var sendEmail2 = async (email) => {
  try {
    const transporter = import_nodemailer2.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "orville59@ethereal.email",
        pass: "SuyQWU28mdQkpHGxAu"
      }
    });
    let message = {
      from: "orville59@ethereal.email",
      to: email,
      subject: "Follow user",
      text: "You have a new follower"
      //${user.email}
    };
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};
var followUser = async (req, res) => {
  logger.info("Inside follow user");
  try {
    const { userId } = req.body;
    if (import_lodash2.default.isEmpty(userId)) {
      logger.error(`Provide all the details: ${import_winston4.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    if (typeof userId == void 0) {
      return res.status(400).json({ message: "Kindly provide your username" });
    }
    const checkUsername = await UserModel.findOne({ _id: userId });
    if (!checkUsername)
      return res.status(404).json({ message: "This username does not exist" });
    const findUserByToken = await UserModel.find({
      _id: req.user.userId
    });
    const following = await UserModel.findOne({ email: req.user.email });
    if (!findUserByToken) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user._id == userId) {
      return res.status(400).json({ message: "you cannot follow youself" });
    }
    if (checkUsername.followers.includes(req.user._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }
    checkUsername.followers.push(req.user._id);
    following.following.push(userId);
    await sendEmail2(checkUsername.email);
    await Promise.all([checkUsername.save(), following.save()]);
    return res.json({ message: "User followed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var unfollowUser = async (req, res) => {
  logger.info("Inside unfollow user");
  try {
    const { userId } = req.body;
    if (import_lodash2.default.isEmpty(userId)) {
      logger.error(`Provide all the details: ${import_winston4.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    if (typeof userId == void 0) {
      return res.status(400).json({ message: "Kindly provide your username" });
    }
    const checkUsername = await UserModel.findOne({ _id: userId });
    if (!checkUsername)
      return res.status(404).json({ message: "This userId does not exist" });
    const findUserByToken = await UserModel.findOne({ _id: req.user._id });
    console.log(req.user._id);
    console.log(findUserByToken);
    if (!findUserByToken) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.userId == userId) {
      return res.status(400).json({ message: "you cannot unfollow youself" });
    }
    console.log(findUserByToken.following);
    if (!findUserByToken.following.includes(checkUsername._id)) {
      return res.status(400).json({ error: "Not following this user" });
    }
    const followerIndex = findUserByToken.following.indexOf(checkUsername);
    const followingIndex = checkUsername.followers.indexOf(req.user.userId);
    findUserByToken.following.splice(followerIndex, 1);
    checkUsername.followers.splice(followingIndex, 1);
    await Promise.all([findUserByToken.save(), checkUsername.save()]);
    return res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var updatePrivacy = async (req, res) => {
  try {
    const user = req.user;
    await UserModel.findOneAndUpdate(
      { email: user.email },
      { $set: { private: true } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Your profile is set to private"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var createMemory = async (req, res) => {
  logger.info("Inside memories");
  try {
    const { userId, title, description, tags, imageUrl } = req.body;
    if (import_lodash2.default.isEmpty(userId) || import_lodash2.default.isEmpty(title)) {
      logger.error(`Provide all the details: ${import_winston4.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    const image = req.file ? import_path.default.join("uploads/", req.file.filename) : "";
    const checkMemory = await MemoryModel.findOne({ userId });
    if (checkMemory?.isDeleted == true) {
      return res.status(400).json({ message: "Memory is deleted" });
    }
    await MemoryModel.create({ userId, title, description, tags, imageUrl });
    return res.status(201).json({ message: "Memory created!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getMemory = async (req, res) => {
  logger.info("get single memory");
  try {
    const memory = await MemoryModel.findOne({ userId: req.user._id });
    if (memory?.isDeleted == true) {
      return res.status(400).json({ message: "Memory is deleted" });
    }
    return res.status(200).json({ memory });
  } catch (error4) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteMemory = async (req, res) => {
  logger.info("Inside delete memory");
  try {
    await MemoryModel.findOneAndUpdate({ userId: req.user._id }, { $set: { isDeleted: true } });
    return res.status(200).json({ message: "Memory is deleted" });
  } catch (error4) {
    console.log(error4);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getMemories = async (req, res) => {
  logger.info("Inside get memories");
  try {
    const { page, title } = req.query;
    let match = {};
    if (title)
      match.title = { $regex: title, $options: "i" };
    const memory = await MemoryModel.find(match).limit(2);
    res.status(200).json({
      page,
      //match,
      result: memory
    });
  } catch (error4) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateMemory = async (req, res) => {
  logger.info("Inside update memory");
  try {
    const { userId } = req.query;
    const { title, description, tags, imageUrl } = req.body;
    const image = req.file ? import_path.default.join("uploads/", req.file.filename) : "";
    const checkMemory = await MemoryModel.findOne({ userId });
    if (checkMemory?.isDeleted == true) {
      return res.status(400).json({ message: "Memory is deleted" });
    }
    if (!checkMemory)
      return res.status(400).json({ message: "Memory not found" });
    await MemoryModel.updateOne({ userId }, { $set: { userId, title, description, tags, imageUrl } });
    return res.status(201).json({ message: "Memory updated!" });
  } catch (error4) {
    console.log(error4);
    res.status(500).json({ message: "Internal server error" });
  }
};
var createComment = async (req, res) => {
  logger.info("Inside create comment");
  try {
    const { memoryId, comments, userId } = req.body;
    if (typeof comments == void 0) {
      return res.status(400).json({ message: "Your comments field is empty" });
    }
    const memory = await MemoryModel.findOne({ _id: memoryId });
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    const checkComment = await CommentModel.findOne({ memoryId });
    if (checkComment?.isDeleted == true)
      return res.status(400).json({ messgae: "This comment is deleted" });
    await CommentModel.create({ memoryId: memory._id, comments, userId });
    return res.status(201).json({ message: "Comment Done!" });
  } catch (error4) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteComment = async (req, res) => {
  logger.info("Inside delete comment");
  try {
    const { memoryId } = req.query;
    const commentDelete = await CommentModel.findOneAndUpdate({ memoryId }, { $set: { isDeleted: true } });
    if (!commentDelete)
      return res.status(400).json({ message: "Comment not found" });
    return res.status(200).json({ message: "Comment is deleted" });
  } catch (error4) {
    console.log(error4);
    res.status(500).json({ message: "Internal server error" });
  }
};
var updateComment = async (req, res) => {
  logger.info("Inside update comment");
  try {
    const { memoryId, comments, userId } = req.body;
    const memory = await MemoryModel.findOne({ _id: memoryId });
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    const checkComment = await CommentModel.findOne({ memoryId });
    if (checkComment?.isDeleted == true)
      return res.status(400).json({ messgae: "This comment is deleted" });
    await CommentModel.updateOne({ memoryId }, { $set: { memoryId: memory._id, comments, userId } });
    return res.status(201).json({ message: "Comment updated!" });
  } catch (error4) {
    console.log(error4);
    res.status(500).json({ message: "Internal server error" });
  }
};
var getComment = async (req, res) => {
  logger.info("get single Comment");
  try {
    const check = await CommentModel.findOne({ userId: req.user._id });
    if (check?.isDeleted == true) {
      return res.status(400).json({ message: "Comment is deleted" });
    }
    const comment = await CommentModel.findOne({ userId: req.user._id }).select("comments");
    return res.status(200).json({ comment });
  } catch (error4) {
    res.status(500).json({ message: "Internal server error" });
  }
};
var getComments = async (req, res) => {
  logger.info("Inside get comments");
  try {
    const { page, comments } = req.query;
    let match = {};
    if (comments)
      match.comments = { $regex: comments, $options: "i" };
    const comment = await CommentModel.find(match).limit(1);
    res.status(200).json({
      page,
      //match,
      result: comment
    });
  } catch (error4) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// src/routes/router.ts
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
var upload = (0, import_multer.default)({ storage });
var router = import_express.default.Router();
router.post("/api/v1/auth/register", register);
router.post("/api/v1/login", login);
router.post("/api/v1/verifyOTP", verifyOTP);
router.post("/api/v1/auth/forgot-password", forgotPassword);
router.post("/api/v1/auth/reset-password", resetPassword);
router.get("/api/v1/get-follower", verifyToken, verificationOtp, getFollowers);
router.get("/api/v1/get-following", verifyToken, verificationOtp, getFollowing);
router.post("/api/v1/follow-user", verifyToken, verificationOtp, followUser);
router.post("/api/v1/unfollow-user", verifyToken, verificationOtp, unfollowUser);
router.put("/api/v1/update-private", verifyToken, verificationOtp, updatePrivacy);
router.post("/api/v1/create-memory", upload.single("image"), verifyToken, verificationOtp, createMemory);
router.get("/api/v1/get-memories", verifyToken, verificationOtp, getMemories);
router.get("/api/v1/get-memory", verifyToken, verificationOtp, getMemory);
router.put("/api/v1/delete-memory", verifyToken, verificationOtp, deleteMemory);
router.put("/api/v1/update-memory", verifyToken, verificationOtp, updateMemory);
router.post("/api/v1/create-comment", verifyToken, verificationOtp, createComment);
router.put("/api/v1/delete-comment", verifyToken, verificationOtp, deleteComment);
router.put("/api/v1/update-comment", verifyToken, verificationOtp, updateComment);
router.get("/api/v1/get-comment", verifyToken, verificationOtp, getComment);
router.get("/api/v1/get-comments", verifyToken, verificationOtp, getComments);

// src/httpLogger.ts
var import_morgan = __toESM(require("morgan"));
var import_morgan_json = __toESM(require("morgan-json"));
var format = (0, import_morgan_json.default)({
  method: ":method",
  url: ":url",
  status: ":status",
  contentLength: ":res[content-length]",
  responseTime: ":response-time"
});
var httpLogger = (0, import_morgan.default)(format, {
  stream: {
    write: (message) => {
      const {
        method,
        url,
        status,
        contentLength,
        responseTime
      } = JSON.parse(message);
      logger.info("HTTP Access Log", {
        timestamp: (/* @__PURE__ */ new Date()).toString(),
        method,
        url,
        status: Number(status),
        contentLength,
        responseTime: Number(responseTime)
      });
    }
  }
});

// src/index.ts
var app = (0, import_express2.default)();
var uri = "mongodb+srv://admin:admin123@cluster0.mxfmsmq.mongodb.net/test";
import_mongoose6.default.connect(uri).then(() => console.log("Database connected")).catch((err) => {
  console.log(err);
});
app.use((0, import_cors.default)());
app.use(import_express2.default.json());
app.use(httpLogger);
app.use(router);
var PORT = 8080;
app.listen(PORT || 5e3, () => {
  console.log(`Server is listening on port ${PORT}`);
});
