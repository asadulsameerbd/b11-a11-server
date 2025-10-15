require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require("cors")
const app = express()
const port = process.env.PORT || 3000


// malware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eynxzxz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        // collection
        const clientSide = client.db("assignment11").collection("client-side")

        // client add 

        app.post("/addtutors", async (req, res) => {
            const addTutors = req.body;
            const result = await clientSide.insertOne(addTutors)
            res.send(result)
        })

        // client read 

        app.get('/addtutors', async (req, res) =>{
            const tutors = await clientSide.find().toArray()
            res.send(tutors)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
       
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Hi, Sameer")
})

app.listen(port, () => {
    console.log(`Port is running on ${port}`);
})