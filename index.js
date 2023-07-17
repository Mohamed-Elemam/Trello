import express from 'express'

import { config } from 'dotenv'
config()
import { dbConnection } from './database/dbconnection.js'
import userRouter from './src/modules/user/user.router.js'
import taskRouter from './src/modules/task/task.router.js'


const app = express()
const port = process.env.PORT

dbConnection()

app.use(express.json())


app.use('/user',userRouter)
app.use('/task',taskRouter)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))