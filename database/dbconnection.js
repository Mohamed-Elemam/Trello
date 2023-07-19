import mongoose from "mongoose";




export const  dbConnection = async ()=>{

await mongoose.connect(process.env.DB_connection_url)
.then(()=>{console.log('database connect successfully')})
.catch((err)=>{console.log('database connection failed',err)})
}



