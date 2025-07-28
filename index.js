import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './Routers/user.router.js'
import tourRoutes from './Routers/tour.router.js'
import connectDb from './Database/db_config.js'


const app = express()
dotenv.config()
const PORT = process.env.PORT || 4000;

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT','PATCH','DELETE'], 
    credentials: true
  }

app.use(cors())
app.use(express.json())




app.get('/',(req,res)=>{
    res.status(200).json('App is working fine')
})
connectDb()
app.use('/api/user',userRoutes)
app.use('/api/tour',tourRoutes)




app.listen(PORT,()=>{
    console.log('APP is working in the PORT:',PORT);
})