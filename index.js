const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongodb setup start.............................................................................
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_USER_PASSWORD}@cluster0.chedirm.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Send a ping to confirm a successful connection
    console.log(
      `Welcome to 'Zehad Sarkar' Portfolio DB. You successfully connected to MongoDB!`
    );

    // ................................Database Collections.....................................

    const db = client.db("portfolio");
    const userCollection = db.collection("users");
    const projectsCollection = db.collection("projects");
    const blogsCollection = db.collection("blogs");
    // ................................Database Collections.....................................

    // Api's
    // ........................Create Admin Api...........................
    app.post("/api/v1/create-user/admin", async (req, res) => {
      const { name, email, password } = req.body;

      const existingAdmin = await userCollection.findOne({ email });

      // bcrypt password
      const passwordHashed = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT)
      );

      // Checking existing admin
      if (!existingAdmin && passwordHashed) {
        const createAdmin = await userCollection.insertOne({
          name,
          email,
          passwordHashed,
          role: "admin",
        });
        res.status(201).json({
          success: true,
          message: "You Have Successfully Created The Admin",
          createAdmin,
        });
      } else {
        return res
          .status(500)
          .json({ success: false, message: "This Admin Already Exist" });
      }
    });

    // .............................Login Admin Api.....................................


    // // Get User Info Api
    // app.get("/api/v1/users", async (req, res) => {
    //   try {
    //     const users = await userCollection.find().toArray();

    //     if (users.length > 0) {
    //       res.status(200).json({
    //         success: true,
    //         message: "Users Retrieved Successful",
    //         data: users,
    //       });
    //     } else {
    //       res.status(404).json({
    //         success: false,
    //         message: "No Users Found",
    //         data: [],
    //       });
    //     }
    //   } catch (error) {
    //     console.log("users-error", error);
    //     res.status(500).json({
    //       success: false,
    //       message: "Internal server error",
    //     });
    //   }
    // });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// mongodb setup end................................................................................

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Congratulations! Your Server Running Perfectly",
  });
});

app.listen(port, () => {
  console.log(
    `Congratulations! 'Zehad Sarkar' portfolio server are running on port: ${port}`
  );
});

app.use("*", (req, res, next) => {
  res.status(404).json({
    success: "false",
    message: "This api not found",
  });
  next();
});
