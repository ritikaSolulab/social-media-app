import {Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {logger} from '../logger';
import { error } from 'winston';
import {Request} from '../types';
import { UserModel } from '../model/User';

const SECRET_TOKEN = 'Ritika123'


// for verifying the token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Inside verifyToken');
    try{
        let token:any;
        let authHeader = req.headers.Authorization || req.headers.authorization;
        if(Array.isArray(authHeader)){
            authHeader = authHeader.join(',')
        }
        if(authHeader && authHeader.startsWith('Bearer')){
            token = authHeader.split(' ')[1]
            jwt.verify(token, SECRET_TOKEN as string, (err:any,decoded:any) => {
                if(err){
                    console.log(err)
                    logger.error('User is not authorized');
                    return res.status(401).json({
                        message:'User is not authorized'
                    });
                } else {
                    req.user = decoded;
                    next();
                }
            });
        } else {
            logger.error('User is not authorized or token is missing in the header')
            return res.status(401).json({message:'User is not authorized or token is missing in the header'});
        }
    }catch(err){
        logger.error(`Error in verifyToken: ${(error as any).message}`);
        return res.status(400).json({message:'server error'})
    }
};

export const verificationOtp = async(req: Request, res: Response, next: NextFunction) => {
    logger.info('Inside verificationOTP');
    const user = await UserModel.findOne({email:req.user.email})
    if(!user) return res.status(400).json({message:'User is not valid'})
    verifyToken(req, res, () => {
      if (user.isVerified === true) {
        next();
      } else {
        return res.status(403).json({message:"You are not verified!"});
      }
    });
  };

