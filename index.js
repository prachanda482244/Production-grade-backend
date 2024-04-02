import express from 'express'
import { config } from 'dotenv'
const app = express()
config()

app.get("/",(req,res)=>{
      res.send("Hello world")
})
app.get('/bachhi',(req,res)=>{
      res.send('<h1>Hello janeman</h1>')
})
app.get('/desc',(req,res)=>{
      res.send('<h1>I love you so much janeman</h1>')
})

app.listen(process.env.PORT,()=>{
      console.log("Server is running")
})
