import mongoose, { Schema } from "mongoose"



const taskSchema = new Schema ({

title:{
    type:String
},
description:{
    type:String
},
status:{
    type:String,
    enum:{values:['toDo' , 'doing' , 'done']}
},
userId:{
    type:Schema.Types.ObjectId,
    ref:'User'
},
assignTo:{
    type:Schema.Types.ObjectId,
    ref:'User'
},
deadline:{
    type:Date
},taskPic:{
    url :String, secure_url:String
},
taskCoverPic:[{   url :String, secure_url:String}]


},{timestamps : true})





export const tasksModel = mongoose.model('Tasks', taskSchema) 