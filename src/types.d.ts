import { Request as ExpressRequest } from "express";


export interface Request extends ExpressRequest {
    token?: string;
    user?:any;
}

export interface CustomRequest extends ExpressRequest {
    user?: any;
  }
  
export interface Memory extends ExpressRequest {
    file?: any;
    title?: string;
    description?: string;
    tags?: string[];
    imageUrl?: string;
    comments?: string,
  }
  
export interface Comment extends ExpressRequest {
    comments?: string;
    username?: string;
    createdAt?: Date;
}

export interface Post extends ExpressRequest {
  id?: number;
  title?: string;
  content?: string;
  likes?: number;
}