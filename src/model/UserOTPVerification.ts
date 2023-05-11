import mongoose from 'mongoose'

const userOTPVerificationSchema = new mongoose.Schema(
    {
        email: {type: String, ref:'User',required:true},
        otp:{type:String},
        expiresAt: {type:Number},
    },
);

export const UserOTPVerificationModel = mongoose.model('UserOTPVerification', userOTPVerificationSchema);