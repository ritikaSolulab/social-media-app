import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, required:true, ref:'User'},
        title: { 
            type: String, 
            required: true 
        },
        description: { type: String, required: true },
        tags: [String],
        imageUrl: { 
            type: String, 
            required: true,
        },
        isDeleted: {
            type:Boolean,
            default:false
        },
    }, 
    { timestamps: true }
);

export const MemoryModel = mongoose.model('Memory', MemorySchema);