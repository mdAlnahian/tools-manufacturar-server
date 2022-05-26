const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());

//data that connect with mongodb cluster

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s7bd8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function run(){
    try{
      await client.connect();
      const toolCollection = client.db("bigbros").collection("tool");
      const orderCollection = client.db("bigbros").collection("order");
      const reviewCollection = client.db("bigbros").collection("review");
      const userInfoCollection = client.db("bigbros").collection("userinfo");
      const userCollection = client.db("bigbros").collection("users");

      //get every item
      app.get("/tool", async (req, res) => {
        const query = {};
        const cursor = toolCollection.find(query);
        const tools = await cursor.toArray();
        res.send(tools);
      });

      //get item by using dynamic route
      app.get("/tool/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const tool = await toolCollection.findOne(query);
        res.send(tool);
      });

      //for adding a new product by admin
      app.post('/tool',async(req,res)=>{
          const newTool = req.body;
          const newResult = await toolCollection.insertOne(newTool);
          return res.send({ success : true , newResult }) ;
      }) 

      //put mehod for getting all users
      app.put('/user/:email',async(req , res) => {
          const email = req.params.email ;
          const user = req.body ;
          const filter = { email : email } ;
          const options = { upsert: true } ;
          const updateDoc = {
            $set: user,
          };
          const userResult = await userCollection.updateOne(filter , updateDoc , options) ;
          res.send(userResult);

      })

      //post method for get item from client
      app.post("/order", async (req, res) => {
        const order = req.body;
        const query = {
          name: order.name,
          email: order.email,
          address: order.address,
          phone: order.phone,
          availableQuantity: order.availableQuantity,
          price: order.price,
        };
        console.log(query);

        const exists = await orderCollection.findOne(query);
        if (exists) {
          return res.send({ success: false, order: exists });
        }
        const result = await orderCollection.insertOne(order);
        return res.send({ success: true, result });
      });

      // get data from post method and show to dashboard
      app.get("/order", async (req, res) => {
        const orders = await orderCollection.find().toArray();
        res.send(orders);
      });
      app.get("/order/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const orders = await orderCollection.findOne(query);
        res.send(orders);
      });

      // get review data from mongodb
      app.get("/review", async (req, res) => {
        const query = {};
        const review = reviewCollection.find(query);
        const reviews = await review.toArray();
        res.send(reviews);
      });
      //recive post data for review section
      app.post("/review", async (req, res) => {
        const review = req.body;
        const query = {
          name: review.name,
          description: review.description,
          ratings: review.ratings,
          img: review.img,
        };
        console.log(query);

        // const alreadyExists = await reviewCollection.findOne(query);
        // if (alreadyExists) {
        //   return res.send({ success: false, query: alreadyExists });
        // }
        const reviewResult = await reviewCollection.insertOne(review);
        return res.send({ success: true, reviewResult });
      });

      // cancel order  from dashboard
      app.delete("/order/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const deleteResult = await orderCollection.deleteOne(query);
        res.send(deleteResult);
      });

      // for updating user profile
      app.get("/userinfo", async (req, res) => {
        const userinfos = await userInfoCollection.find().toArray();
        res.send(userinfos);
      });
      app.get("/userinfo/:id", async (req, res) => {
        const userinfos = await userInfoCollection.find().toArray();
        res.send(userinfos);
      });

      app.put("/userinfo", async (req, res) => {
        const id = req.params.id;
        const userinfo = req.body;
        const filter = { id: id };
        const options = { upsert: true };
        const updateDoc = {
          $set: userinfo,
        };
        const result = await userInfoCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      });
      //code completed for updating profile
    }
    finally{

    }
}
run().catch(console.dir);



//response to browser
app.get('/',(req,res) => {
    res.send("Running Big Bros Limited");
})

app.listen(port , ()=>{
    console.log('Listening to port', port);
})