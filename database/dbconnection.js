import mongoose from "mongoose";




export const  dbConnection = async ()=>{

await mongoose.connect('mongodb://127.0.0.1:27017/trello')
.then(()=>{console.log('database connect successfully')})
.catch((err)=>{console.log('database connection failed',err)})
}



