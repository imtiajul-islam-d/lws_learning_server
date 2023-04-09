const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// mongo db start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibovumw.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// mongo db end
// main file start
async function run() {
  try {
    const database = client.db("learning");
    const usersCollection = database.collection("users");
    const videosCollection = database.collection("videos");
    const assignmentsCollection = database.collection("assignments");
    const quizzesCollection = database.collection("quizzes");
    const assignmentMarkCollection = database.collection("assignmentMark");
    const quizMarkCollection = database.collection("quizMark");

    // make query
    // get a jwt token
    app.get("/jwt", async (req, res) => {
      // take the email user gave input
      const email = req.query.email;
      // make query to find user from db as user input
      const query = { email: email };
      // find user in database
      const user = await usersCollection.findOne(query);
      if (user) {
        // if user found generate token
        const token = jwt.sign(
          {
            email,
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: "1h" }
        );
        return res.send({
          accessToken: token,
        });
      }
      // if user not found
      res.status(403).send({ accessToken: "" });
    });
    // get a jwt token end
    // get user logged in
    app.post("/login", async (req, res) => {
      const body = req.body;
      const query = { email: body.email };
      const options = await usersCollection.find(query).toArray();
      if (options.length > 0) {
        res.send({
          accessToken: "available",
          user: options[0],
        });
      } else {
        res.send("Cannot find user");
      }
    });

    // register a student
    app.post("/register", async (req, res) => {
      const body = req.body;
      //  check if user already available
      const isAvailable = await usersCollection
        .find({ email: body.email })
        .toArray();
      if (isAvailable.length > 0) {
        res.send("Email already exists");
      } else {
        const options = await usersCollection.insertOne(body);
        const user = await usersCollection
          .find({ _id: new ObjectId(options?.insertedId) })
          .toArray();
        console.log(user);
        res.send({
          accessToken: "available",
          user: user[0],
        });
      }
    });
    // ---------------------------- Users -----------------------
    //get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    // get single user
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await usersCollection.find(query).toArray();
      console.log(user[0]);
      res.send(user);
    });
    // ----------------------------- Videos ---------------------
    // get all videos
    app.get("/videos", async (req, res) => {
      const query = {};
      const videos = await videosCollection.find(query).toArray();
      res.send(videos);
    });
    app.post("/videos", async (req, res) => {
      const body = req.body;
      const videos = await videosCollection.insertOne(body);
      if (videos.acknowledged) {
        const v = await videosCollection
          .find({ _id: new ObjectId(videos.insertedId) })
          .toArray();
        res.send(v[0]);
      } else {
        res.send("");
      }
    });
    // get single video
    app.get("/videos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const video = await videosCollection.find(query).toArray();
      res.send(video[0]);
    });
    // update single video
    app.patch("/videos/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: body,
      };
      const result = await videosCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      if (result.acknowledged) {
        const updatedItem = await videosCollection
          .find({ title: body.title })
          .toArray();
        // console.log(updatedItem);
        res.send(updatedItem[0]);
      }
    });
    app.delete("/videos/:id", async (req, res) => {
      const id = req.params.id;
      const result = await videosCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 1) {
        res.send({});
      }
    });
    // -------------------------- Assignment -----------------------
    // get all assignments
    app.get("/assignments", async (req, res) => {
      const query = {};
      const assignments = await assignmentsCollection.find(query).toArray();
      res.send(assignments);
    });
    app.post("/assignments", async (req, res) => {
      const body = req.body;
      const assignment = await assignmentsCollection.insertOne(body);
      console.log(assignment);
      if (assignment?.acknowledged) {
        const result = {
          ...body,
          _id: assignment?.insertedId,
        };
        res.send(result);
      }
    });
    // get one assignment
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const assignment = await assignmentsCollection.find(query).toArray();
      res.send(assignment[0]);
    });
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const result = await assignmentsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 1) {
        res.send({});
      }
    });
    app.patch("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: body,
      };
      const result = await assignmentsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      if (result.acknowledged) {
        const updatedItem = await assignmentsCollection
          .find({ title: body.title })
          .toArray();
        console.log(updatedItem);
        res.send(updatedItem[0]);
      } else {
        res.send({});
      }
    });
    // --------------------------- quizzes -------------------------------
    // get all quizzes
    app.get("/quizzes", async (req, res) => {
      const query = {};
      const quizzes = await quizzesCollection.find(query).toArray();
      res.send(quizzes);
    });
    // get one quiz
    app.get("/quizzes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const quiz = await quizzesCollection.find(query).toArray();
      res.send(quiz[0]);
    });
    app.post("/quizzes", async (req, res) => {
      const body = req.body;
      const quiz = await quizzesCollection.insertOne(body);
      if (quiz?.acknowledged) {
        const result = {
          ...body,
          _id: quiz?.insertedId,
        };
        res.send(result);
      }
    });
    app.delete("/quizzes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await quizzesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 1) {
        res.send({});
      } else {
        res.send();
      }
    });
    app.patch("/quizzes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: body,
      };
      const result = await quizzesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      if (result.acknowledged) {
        const updatedItem = await quizzesCollection
          .find({ _id: new ObjectId(id) })
          .toArray();
        // console.log(updatedItem);
        res.send(updatedItem[0]);
      } else {
        res.send({});
      }
    });

    // -------------------- assignment marks ----------------------------
    // get assignment marks
    app.get("/assignmentMark", async (req, res) => {
      const query = {};
      const marks = await assignmentMarkCollection.find(query).toArray();
      res.send(marks);
    });
    // get one assignment
    app.get("/assignmentMark/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const assignment = await assignmentsCollection.find(query).toArray();
      res.send(assignment[0]);
    });
    app.post("/assignmentMark", async (req, res) => {
      const body = req.body;
      const assignment = await assignmentMarkCollection.insertOne(body);
      if (assignment?.acknowledged) {
        const result = {
          ...body,
          _id: assignment?.insertedId,
        };
        res.send(result);
      } else {
        res.send();
      }
    });
    app.patch("/assignmentMark/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const options = { upsert: true };
      const updateDoc = {
          $set: body,
        };
        console.log(id);
      const result = await assignmentMarkCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      if (result.acknowledged) {
          const updatedItem = await assignmentMarkCollection
          .find({ _id: new ObjectId(id) })
          .toArray();
          console.log(updatedItem);
        res.send(updatedItem[0]);
      } else {
        res.send({});
      }
    });

    // get quizzes Marks
    app.get("/quizMark", async (req, res) => {
      const query = {};
      const marks = await quizMarkCollection.find(query).toArray();
      res.send(marks);
    });
    // get one assignment
    app.get("/quizMark/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const quiz = await quizMarkCollection.find(query).toArray();
      res.send(quiz[0]);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.listen(port, () => console.log("Server is running"));
