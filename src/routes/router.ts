import express from "express";
import multer from 'multer';
import { register, 
    forgotPassword, 
    verifyOTP, 
    resetPassword, 
    login 
} from "../controllers/auth/register";
import { 
    verifyToken, 
    verificationOtp 
} from "../utils/verifyToken";
import { 
    createComment,
    followUser, 
    getMemories, 
    getFollowers, 
    getFollowing, 
    createMemory, 
    unfollowUser, 
    updatePrivacy, 
    deleteMemory,
    deleteComment,
    getMemory,
    updateMemory,
    updateComment,
    getComment,
    getComments
} from "../controllers/user";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
const upload = multer({ storage: storage });

export const router = express.Router();

router.post("/api/v1/auth/register", register);
router.post("/api/v1/login", login);
router.post("/api/v1/verifyOTP", verifyOTP);
router.post("/api/v1/auth/forgot-password",forgotPassword)
router.post("/api/v1/auth/reset-password",resetPassword)
router.get('/api/v1/get-follower',verifyToken, verificationOtp, getFollowers)
router.get('/api/v1/get-following', verifyToken, verificationOtp, getFollowing)
router.post('/api/v1/follow-user', verifyToken, verificationOtp, followUser)
router.post('/api/v1/unfollow-user',verifyToken, verificationOtp, unfollowUser)
router.put('/api/v1/update-private', verifyToken, verificationOtp, updatePrivacy)
router.post('/api/v1/create-memory', upload.single('image'),verifyToken, verificationOtp, createMemory)
router.get('/api/v1/get-memories', verifyToken, verificationOtp, getMemories)
router.get('/api/v1/get-memory', verifyToken, verificationOtp, getMemory)
router.put('/api/v1/delete-memory', verifyToken, verificationOtp, deleteMemory)
router.put('/api/v1/update-memory', verifyToken, verificationOtp, updateMemory)
router.post('/api/v1/create-comment', verifyToken, verificationOtp, createComment)
router.put('/api/v1/delete-comment', verifyToken, verificationOtp, deleteComment)
router.put('/api/v1/update-comment', verifyToken, verificationOtp, updateComment)
router.get('/api/v1/get-comment', verifyToken, verificationOtp, getComment)
router.get('/api/v1/get-comments', verifyToken, verificationOtp, getComments)



export default router;
