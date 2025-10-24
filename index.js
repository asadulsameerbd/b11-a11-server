require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require("cors")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const app = express()
const port = process.env.PORT || 3000


// middleware  
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())



// jwt verify

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token

    if (!token) {
        return res.status(401).send({ message: "unauthorized Access" })
    }

    jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "unauthorized Access" })
        }

        req.decoded = decoded

        next()
    })
}


// mongoDB

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

        // Client side collection
        const clientSide = client.db("assignment11").collection("client-side")
        const bookedCollection = client.db("assignment11").collection("bookedTutor")




        // client add 

        app.post("/addtutors", async (req, res) => {
            const addTutors = req.body;
            const result = await clientSide.insertOne(addTutors)
            res.send(result)
        })

        // client read 

        app.get('/addtutors', async (req, res) => {


            const tutors = await clientSide.find().toArray()
            res.send(tutors)
        })

        //tutor details
        app.get("/tutorDetails/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await clientSide.findOne(query)
            res.send(result)
        })


        // mytutorial 

        app.get("/add-tutors", verifyToken, async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: "forbidden access" })
            }
            const result = await clientSide.find(query).toArray()
            res.send(result)
        })

        // Booked tutor

        app.post('/bookedTutor', async (req, res) => {
            const tutor = req.body;
            const alreadyBooked = await bookedCollection.findOne({
                tutorId: tutor.tutorId,
                BookedBy: tutor.bookedBy
            })

            if (alreadyBooked) {
                return res.send({ message: "Already Booked" })
            }

            const result = await bookedCollection.insertOne(tutor)
            res.send(result)
        })

        // loggin user to show their booked tutors 

        app.get('/bookedTutor', async (req, res) => {
            const email = req.query.email;
            const query = { bookedBy: email }
            const bookedTutor = await bookedCollection.find(query).toArray()
            res.send(bookedTutor)
        })



        // delete booked id 

        app.delete('/deleteTutor/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await clientSide.deleteOne(query)
            res.send(result)
        })

        // update tutor

        app.put("/update-tutor/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const tutorUpdate = req.body;
            const updateDoc = {
                $set: tutorUpdate
            }
            const result = await clientSide.updateOne(filter, updateDoc)
            res.send(result)
        })

        // find update single tutors

        app.get('/update-tutor/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const UpdateSingle = await clientSide.findOne(query)
            res.send(UpdateSingle)
        })


        // jwt 

        app.post("/jwt", async (req, res) => {
            const userData = req.body
            const token = jwt.sign(userData, process.env.JWT_SECRET_TOKEN, { expiresIn: "2h" })

            res.cookie("token", token, {
                httpOnly: true,
                secure: false
            })


            res.send({ status: true })
        })

        app.post("/logout", (req, res) => {
            res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax" });
            res.send({ success: true });
        });




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