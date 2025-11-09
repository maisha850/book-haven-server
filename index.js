const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://bookHaven:ciZnOzzKdbPpX1si@cluster0.6aaggy0.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
app.get('/' , (req , res)=>{
    res.send('book haven server is running')
})

async function run() {
  try {
  await client.connect();
const db = client.db('books_haven')
const booksCollection = db.collection('books')
app.get('/books' , async(req , res)=>{
  const cursor = booksCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.post('/books' , async(req , res)=>{
  const data = req.body;
  console.log(data)
  const result = await booksCollection.insertOne(data)
  res.send(result)
})
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port , ()=>{
    console.log(`book haven server is running on port: ${port}`)
})

