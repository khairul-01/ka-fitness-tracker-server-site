const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// KaFitnessTracker
// UZCsHXs0mNMr3WmD

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52ba6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection

    const trainersCollection = client.db('KaFitnessTracker').collection('trainer');
    const usersCollection = client.db('KaFitnessTracker').collection('users');
    const galleryCollection = client.db('KaFitnessTracker').collection('gallery');

    app.get('/trainers', async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    })

    // users related API
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    // gallery related api
    app.get('/images', async (req, res) => {
      const { page } = req.query;
      const pageSize = 12;
      const skip = (page - 1) * pageSize;
      // const skip = pageSize;

      const images = await galleryCollection.find().skip(skip).limit(pageSize).toArray();
      res.send(images);
      // try {
      // } catch (error) {
      //   console.error("Error fetching images:", error);
      //   res.status(500).json({ error: "Internal Server Error" });
      // }
    })

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('KA Fitness tracker is running')
})

app.listen(port, () => {
  console.log(`KA Fitness tracker is running on port ${port}`);
})