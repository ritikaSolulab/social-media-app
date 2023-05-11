import express from "express";
import { error } from "winston";
import lodash from "lodash";
import nodemailer from "nodemailer";
import { logger } from "../logger";
import { UserModel } from "../model/User";
import path from "path";
import { MemoryModel } from "../model/Memories";
import { CommentModel } from "../model/Comment";
import { Request } from "../types";


export const getFollowers = async (
  req: Request,
  res: express.Response
) => {
  logger.info("Inside get Follower");
  try {
    const { userId, username } = req.query;
    if (lodash.isEmpty(userId) || lodash.isEmpty(username)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const user:any = await UserModel.findOne({ email: req.user.email })
    await UserModel.findById(userId).populate("followers");
    
    return res
      .status(200)
      .json({ username: username, followers: user!.followers });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const getFollowing = async (
  req: Request,
  res: express.Response
) => {
  logger.info("Inside get Following");
  try {
    const { userId, username } = req.query;
    if (lodash.isEmpty(userId) || lodash.isEmpty(username)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const user:any = await UserModel.findOne({ email: req.user.email })
    await UserModel.findById(userId).populate("following");

    return res
      .status(200)
      .json({ username: username, following: user!.following });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const getUser = async (req: Request, res: express.Response) => {
  logger.info("Inside get User");
  try {
    const { userId } = req.query;
    if (lodash.isEmpty(userId)) {
      logger.error(`Provide user id: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide user id",
      });
    }
    // checking if user is exist or not
    const userExist = await UserModel.findOne({ _id: userId });
    if (!userExist) {
      logger.error(`User with ${userExist} is not exist`);
      return res.status(400).json({
        success: false,
        message: "user id does not exist",
      });
    }
    return res.status(200).json(userExist);

    //   logger.error(`User data is not valid:${(error as any).message}`);
    //   return res.status(400).json({
    //     success: false,
    //     message: "User data is not valid.",
    //   });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const sendEmail = async (email: string) => {
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
      subject: "Follow user",
      text: 'You have a new follower', //${user.email}
    };
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};

export const followUser = async (req: Request, res: express.Response) => {
  logger.info("Inside follow user");
  try {
    const { userId } = req.body;
    if (lodash.isEmpty(userId)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    if (typeof userId == undefined) {
      return res.status(400).json({ message: "Kindly provide your username" });
    }

    const checkUsername = await UserModel.findOne({ _id: userId })
    //console.log(checkUsername)
    if (!checkUsername)
      return res.status(404).json({ message: "This username does not exist" });

    const findUserByToken: any = await UserModel.find({
      _id: req.user.userId,
    });

    const following: any = await UserModel.findOne({ email: req.user.email });

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

    await sendEmail(checkUsername.email);

    await Promise.all([checkUsername.save(), following.save()]);

    return res.json({ message: "User followed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const unfollowUser = async (
  req: Request,
  res: express.Response
) => {
  logger.info("Inside unfollow user");
  try {
    const { userId } = req.body;
    if (lodash.isEmpty(userId)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    if (typeof userId == undefined) {
      return res.status(400).json({ message: "Kindly provide your username" });
    }
    const checkUsername = await UserModel.findOne({ _id: userId });
    //console.log(checkUsername?.following)
    
    if (!checkUsername)
      return res.status(404).json({ message: "This userId does not exist" });

    const findUserByToken:any = await UserModel.findOne({_id:req.user._id})
    console.log(req.user._id)
    console.log(findUserByToken)
   
    if (!findUserByToken) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.userId == userId) {
      return res.status(400).json({ message: "you cannot unfollow youself" });
    }

    console.log(findUserByToken.following)
    

    if (!findUserByToken.following.includes(checkUsername._id)) {
      return res.status(400).json({error:'Not following this user'});
    }

    const followerIndex = findUserByToken.following.indexOf(checkUsername);
    const followingIndex = checkUsername.followers.indexOf(req.user.userId);

    findUserByToken.following.splice(followerIndex, 1);
    checkUsername.followers.splice(followingIndex, 1);

    await Promise.all([findUserByToken.save(),checkUsername.save()]);

    return res.status(200).json({ message: "User unfollowed successfully"});
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const updatePrivacy = async (
  req: Request,
  res: express.Response
) => {
  try {
    const user = req.user;
    await UserModel.findOneAndUpdate(
      { email: user.email },
      { $set: { private: true } },
      { new: true }
    );
    // console.log(res.locals.user)

    return res.status(200).json({
      success: true,
      message: "Your profile is set to private",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const createMemory =  async (req: Request, res: express.Response) => {
  logger.info('Inside memories')
  try {
    const { userId, title, description, tags, imageUrl } = req.body;
    if (lodash.isEmpty(userId) || lodash.isEmpty(title)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const image = req.file ? path.join('uploads/', req.file.filename) : '';

    const checkMemory = await MemoryModel.findOne({userId: userId})
    if(checkMemory?.isDeleted == true){
      return res.status(400).json({message:'Memory is deleted'})
    }
    // else if(checkMemory){
    //   await MemoryModel.updateOne({userId:userId},{$set:{userId, title, description, tags, imageUrl}})
    //   return res.status(201).json({message:'Memory updated!'})
    // }
    await MemoryModel.create({ userId, title, description, tags, imageUrl });
    
    return res.status(201).json({message: 'Memory created!'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error'});
  }
};

export const getMemory = async (req: Request, res: express.Response) => {
  logger.info('get single memory')
  try {
    
    const memory = await MemoryModel.findOne({userId:req.user._id})
    if(memory?.isDeleted == true){
      return res.status(400).json({message:'Memory is deleted'})
    }
    //console.log(req.user._id)
    return res.status(200).json({ memory });
  } catch (error) {
    res.status(500).json({ message:'Internal server error' });
  }
};

export const deleteMemory = async(req:Request, res:express.Response) => {
  logger.info('Inside delete memory')
  try{
    await MemoryModel.findOneAndUpdate({userId:req.user._id},{$set:{isDeleted:true}})
    return res.status(200).json({message:'Memory is deleted'})
  }catch (error) {
    console.log(error)
    res.status(500).json({ message:'Internal server error' });
  }
}

export const getMemories =  async (req:Request, res:express.Response) => {
  logger.info('Inside get memories')
  try{
    const { page, title } = req.query
    let match:any = {}
    //let limit:any = {}
    if (title) match.title = {$regex: title, $options: 'i'}
    const memory = await MemoryModel.find(match).limit(2)
    res.status(200).json({
        page,
        //match,
        result: memory,
    });
  }catch (error) {
    res.status(500).json({ message:'Internal server error' });
  }
}

export const updateMemory = async(req:Request, res:express.Response)=> {
  logger.info('Inside update memory')
  try{
    const {userId} = req.query
    const { title, description, tags, imageUrl } = req.body;
    const image = req.file ? path.join('uploads/', req.file.filename) : '';

    const checkMemory = await MemoryModel.findOne({userId: userId})
    if(checkMemory?.isDeleted == true){
      return res.status(400).json({message:'Memory is deleted'})
    }
    if(!checkMemory) return res.status(400).json({message:'Memory not found'})
    await MemoryModel.updateOne({userId:userId},{$set:{userId, title, description, tags, imageUrl}})
    return res.status(201).json({message:'Memory updated!'})
    
  }catch (error) {
    console.log(error)
    res.status(500).json({ message:'Internal server error' });
  }
}

export const createComment = async (req: Request, res:express.Response) => {
  logger.info('Inside create comment')
  try{
    const { memoryId, comments, userId } = req.body;
    if (typeof comments == undefined) {
      return res.status(400).json({ message: "Your comments field is empty" });
    }

    const memory:any = await MemoryModel.findOne({_id:memoryId})
    if (!memory) {
      return res.status(404).json({message:'Memory not found'})
    }

    const checkComment = await CommentModel.findOne({memoryId:memoryId})
    if(checkComment?.isDeleted == true) return res.status(400).json({messgae:'This comment is deleted'})
    // else if(checkComment){
    //   await CommentModel.updateOne({memoryId:memoryId},{$set:{memoryId:memory._id, comments, userId}})
    //   return res.status(201).json({message:'Comment updated!'})
    // }

    await CommentModel.create({ memoryId:memory._id, comments, userId })

    // memory.comments.push(comment._id)
    //await memory.save();
    return res.status(201).json({message: 'Comment Done!'});
  }catch (error) {
    res.status(500).json({ message:'Internal server error' });
  }
};

export const deleteComment = async(req:Request, res:express.Response) => {
  logger.info('Inside delete comment')
  try{
    const {memoryId} = req.query
    const commentDelete = await CommentModel.findOneAndUpdate({memoryId:memoryId},{$set:{isDeleted:true}})
    if(!commentDelete) return res.status(400).json({message:'Comment not found'})
    return res.status(200).json({message:'Comment is deleted'})
  }catch (error) {
    console.log(error)
    res.status(500).json({ message:'Internal server error' });
  }
}

export const updateComment = async(req:Request, res:express.Response) => {
  logger.info('Inside update comment')
  try{
    const { memoryId, comments, userId } = req.body;

    const memory:any = await MemoryModel.findOne({_id:memoryId})
    if (!memory) {
      return res.status(404).json({message:'Memory not found'})
    }

    const checkComment = await CommentModel.findOne({memoryId:memoryId})
    if(checkComment?.isDeleted == true) return res.status(400).json({messgae:'This comment is deleted'})
    
    await CommentModel.updateOne({memoryId:memoryId},{$set:{memoryId:memory._id, comments, userId}})
    return res.status(201).json({message:'Comment updated!'})
    
  }catch (error) {
    console.log(error)
    res.status(500).json({ message:'Internal server error' });
  }
}

export const getComment = async (req: Request, res: express.Response) => {
  logger.info('get single Comment')
  try {
    const check = await CommentModel.findOne({userId:req.user._id})
    if(check?.isDeleted == true){
      return res.status(400).json({message:'Comment is deleted'})
    }
    const comment = await CommentModel.findOne({userId:req.user._id}).select('comments')
    //console.log(req.user._id)
    return res.status(200).json({ comment })
  } catch (error) {
    res.status(500).json({ message:'Internal server error' });
  }
}

export const getComments =  async (req:Request, res:express.Response) => {
  logger.info('Inside get comments')
  try{
    const { page, comments } = req.query
    let match:any = {}
    //let limit:any = {}
    if (comments) match.comments = {$regex: comments, $options: 'i'}
    const comment = await CommentModel.find(match).limit(1)
    res.status(200).json({
        page,
        //match,
        result: comment,
    });
  }catch (error) {
    res.status(500).json({ message:'Internal server error' });
  }
}









