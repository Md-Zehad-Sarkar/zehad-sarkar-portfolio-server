const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authGuard = require("./utls/authGuard");
const projectValidationMiddleware = require("./utls/projectValidation");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://zehad-sarkar-developer-portfolio.vercel.app",
      "http://localhost:3000",
    ],
    credentials: "true",
  })
);
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

    // ................................Database Collections start.....................................
    const db = client.db("portfolio");
    const userCollection = db.collection("users");
    const projectsCollection = db.collection("projects");
    const blogsCollection = db.collection("blogs");
    const skillsCollection = db.collection("skills");
    const courseCollection = db.collection("courses");
    // ................................Database Collections end.....................................

    //....................................... Api's ............................................
    // ........................Create Admin Api...........................
    app.post("/api/v1/create-user/admin", async (req, res) => {
      try {
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
            password: passwordHashed,
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
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Admin Created Failed" });
      }
    });

    // .............................Login Admin Api.....................................
    app.post("/api/v1/login-users", async (req, res) => {
      try {
        const { email, password } = req.body;

        const users = await userCollection.findOne(
          { email },
          { _id: 0, role: 0 }
        );

        if (!users && users?.email !== email) {
          return res
            .status(500)
            .json({ success: false, message: "Invalid User Email" });
        } else {
          const isValidPassword = await bcrypt.compare(
            password,
            users?.password
          );

          if (isValidPassword) {
            const token = jwt.sign(
              {
                id: users?._id,
                email: users?.email,
                name: users?.name,
                role: users?.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRESIN }
            );
            res.status(200).json({
              success: true,
              message: "User Login Successful",
              accessToken: token,
            });
          } else {
            res
              .status(401)
              .json({ success: false, message: "Unauthorized Access" });
          }
        }
      } catch (error) {
        // console.log(error);
        res
          .status(401)
          .json({ success: false, message: "Unauthorized Access" });
      }
    });

    // .............................Get User Info Api............................................
    app.get("/api/v1/users", async (req, res) => {
      try {
        const email = req.query.email;
        const users = await userCollection.findOne({ email });

        if (users.email) {
          res.status(200).json({
            success: true,
            message: "Users Retrieved Successful",
            data: users,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "No Users Found",
            data: [],
          });
        }
      } catch (error) {
        console.log("users-error", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // ..............................................Add Projects Api..................................
    app.post(
      "/api/v1/add-projects",
      projectValidationMiddleware,
      async (req, res) => {
        try {
          const body = req.body;

          const projects = await projectsCollection.insertOne({
            ...body,
            createdAt: new Date().toISOString(),
          });

          if (projects?.insertedId) {
            res.status(201).json({
              success: true,
              message: "Projects Added Successful",
              projects,
            });
          } else {
            res.status(500).json({
              success: true,
              message: "Projects Added failed",
            });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: true,
            message: "Something Went Wrong",
          });
        }
      }
    );

    // ..............................................Get Projects Api..................................
    app.get("/api/v1/projects", async (req, res) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const projects = await projectsCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();
        if (projects.length > 0) {
          res.status(200).json({
            success: true,
            message: "Projects Retrieved Successful",
            data: projects,
            page: page,
            limit: limit,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Projects Not Found",
            data: [],
            page: 0,
            limit: 0,
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    // ..............................................Create Blogs Api..................................
    app.post("/api/v1/add-blogs", async (req, res) => {
      try {
        const body = req.body;

        const blogs = await blogsCollection.insertOne({
          ...body,
          author: "Md. Zehad Sarkar",
        });
        if (blogs?.insertedId) {
          res.status(201).json({
            success: true,
            message: "Blogs Has Been Added Successful",
            blogs,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Blogs Added Failed",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    // ..............................................Get Blogs Api..................................
    app.get("/api/v1/blogs", async (req, res) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await blogsCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();
        if (blogs?.length > 0) {
          res.status(200).json({
            success: true,
            message: "All Blogs Retrieved Successful",
            data: blogs,
            page: page,
            limit: limit,
          });
        } else {
          res.status(500).json({
            success: true,
            message: "All Blogs Retrieved Successful",
            data: [],
            page: 0,
            limit: 0,
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: true,
          message: "Internal Server Error",
        });
      }
    });

    // ..............................................Add Skill Api..................................
    app.post("/api/v1/add-skills", async (req, res) => {
      try {
        const body = req.body;

        const skills = await skillsCollection.insertOne({
          ...body,
          createdAt: new Date().toISOString(),
        });
        if (skills?.insertedId) {
          res.status(201).json({
            success: true,
            message: "Skills Added Successful",
            skills,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Skills Added Failed",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Something Went Wrong",
        });
      }
    });

    // ..............................................Get Skill Api..................................
    app.get("/api/v1/skills", async (req, res) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 30;
        const skip = (page - 1) * limit;
        const skills = await skillsCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();

        if (skills?.length > 0) {
          res.status(200).json({
            success: true,
            message: "Skills Retrieved Successful",
            data: skills,
            page: page,
            limit: limit,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Something Went Wrong",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Something Went Wrong",
        });
      }
    });

    // ..............................................Add Course Api..................................
    app.post("/api/v1/add-course", async (req, res) => {
      try {
        const body = req.body;

        const course = await courseCollection.insertOne({
          ...body,
          createdAt: new Date().toISOString(),
        });
        if (course?.insertedId) {
          res.status(201).json({
            success: true,
            message: "Course Added Successful",
            course,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Course Added Failed",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Something Went Wrong",
        });
      }
    });

    // ..............................................Get Courses Api..................................
    app.get("/api/v1/courses", async (req, res) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const courses = await courseCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();

        if (courses?.length > 0) {
          res.status(200).json({
            success: true,
            message: "Courses Retrieved Successful",
            data: courses,
            page: page,
            limit: limit,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Something Went Wrong",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Something Went Wrong",
        });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// mongodb setup end................................................................................

app.get("/", (req, res) => {
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
