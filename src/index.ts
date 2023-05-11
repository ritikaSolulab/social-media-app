import express from 'express';
const app = express();
import mongoose from "mongoose";
import cors from "cors";
import {router} from './routes/router';


import {httpLogger} from './httpLogger'

const uri =  'mongodb+srv://admin:admin123@cluster0.mxfmsmq.mongodb.net/test'

//mongo db connection
mongoose
 .connect(uri)
 .then(()=>console.log("Database connected"))
 .catch((err:any) => {
    console.log(err);
});


app.use(cors());
app.use(express.json());
app.use(httpLogger)

//router 
app.use(router);

const PORT = 8080
app.listen(PORT || 5000, () => {
    console.log(`Server is listening on port ${PORT}`);
});



