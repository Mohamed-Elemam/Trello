import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
//schema(  ,  ,  hashed ,  ,  , )
userName:{
type:String,

},
email:{
    type:String,
    unique:true,
},
password:{
    type:String,
},
age:{
    type:Number,
},
gender:{
    type:String,
    enum:{values:['male' , 'female']}
},
phone:{
    type:Number,
},
isOnline:{
    type:String,
    enum:{values :[true , false]},
   
},
isDeleted:{
    type:String,
    enum:{values :[true , false]},
   
},
isConfimed:{
    type:Boolean,
    default:false
}

},{
    timestamps:true
})


export const userModel = mongoose.model('User', userSchema)