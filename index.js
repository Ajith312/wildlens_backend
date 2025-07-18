import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './Routers/user.router.js'
import connectDb from './Database/db_config.js'


const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())




app.get('/',(req,res)=>{
    res.send(200).json('App is working fine')
})
connectDb()
app.use('/api/user',userRoutes)




app.listen(process.env.PORT,()=>{
    console.log('APP is working in the PORT:',process.env.PORT);
})