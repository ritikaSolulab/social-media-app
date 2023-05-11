import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        comments: {type: String },
        userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        memoryId: {type: mongoose.Schema.Types.ObjectId, ref:'Memory'},
        isDeleted: {
            type:Boolean,
            default:false
        },
    }, 
    { timestamps: true }
);

export const CommentModel = mongoose.model('Comment', CommentSchema);