const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

//mongodb
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xnuug.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

//nodemailer
import pkg from "nodemailer";
const { createTransport } = pkg;

const PORT = 5000;

//app initialization
const app = express();
app.use(cors());
app.use(bodyParser.json());

//generate mail sending process via nodemailer
const transporter = createTransport({
   service: "gmail",
   auth: {
      user: "john.doe@gmail.com",
      pass: "12345678",
   },
});

const mailOptions = {
   from: "john.doe@gmail.com",
   to: "jane.doe@gmail.com",
   subject: "Your daily transactions",
   text: "Number of Transactions, Number of Successful Transactions, Volume (INR)",
   attachments: [
      {
         filename: "transactions.csv",
         path: "./transactions.csv",
      },
   ],
};

transporter.sendMail(mailOptions, (error, info) => {
   if (error) {
      console.log(error);
   } else {
      console.log("Email sent: " + info.response);
   }
});

// MongoDB integration
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
   const itemsCollection = client.db(`${process.env.DB_NAME}`).collection("items");
   const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

   //connection with db
   app.get("/", (req, res) => {
      res.send("Hello from DB, it's working!");
   });

   //post request
   app.post("/addItems", (req, res) => {
      const items = req.body;
      itemsCollection.insertOne(items).then((result) => {
         res.send(result.insertedCount > 0);
      });
   });

   app.post("/addOrders", (req, res) => {
      const orders = req.body;
      ordersCollection.insertOne(orders).then((result) => {
         res.send(result.insertedCount > 0);
      });
   });

   //get request
   app.get("/showItems", (req, res) => {
      itemsCollection.find({}).toArray((err, documents) => {
         res.send(documents);
      });
   });

   app.get("/showOrders", (req, res) => {
      ordersCollection.find({}).toArray((err, documents) => {
         res.send(documents);
      });
   });
});

app.listen(PORT, () => console.log(`server is listening at ${PORT}`));
