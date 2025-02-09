/* jshint esversion: 8 */
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = 3030;

app.use(cors());
app.use(require("body-parser").urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", "utf8"));

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "dealershipsDB" });

const Reviews = require("./review");
const Dealerships = require("./dealership");

try {
  Reviews.deleteMany({}).then(() => {
    Reviews.insertMany(reviews_data["reviews"]);
  });
  Dealerships.deleteMany({}).then(() => {
    Dealerships.insertMany(dealerships_data["dealerships"]);
  });
} catch (error) {
  console.error("Error initializing data:", error); // Log the error
}

app.get("/", async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

app.get("/fetchReviews", async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    console.error("Error fetching reviews:", error); // Log the error
    res.status(500).json({ error: "Error fetching documents" });
  }
});

app.get("/fetchReviews/dealer/:id", async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    console.error("Error fetching reviews by dealer:", error); // Log the error
    res.status(500).json({ error: "Error fetching documents" });
  }
});

app.get("/fetchDealers", async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    console.error("Error fetching dealerships:", error); // Log the error
    res.status(500).json({ error: "Error fetching dealerships" });
  }
});

app.get("/fetchDealers/:state", async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    console.error("Error fetching dealerships by state:", error); // Log the error
    res.status(500).json({ error: "Error fetching dealerships by state" });
  }
});

app.get("/fetchDealer/:id", async (req, res) => {
  try {
    const document = await Dealerships.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: "Dealer not found" });
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching dealer by ID:", error); // Log the error
    res.status(500).json({ error: "Error fetching dealer by id" });
  }
});

app.post("/insert_review", express.raw({ type: "*/*" }), async (req, res) => {
  const data = JSON.parse(req.body);
  const documents = await Reviews.find().sort({ id: -1 });
  let new_id = documents[0]["id"] + 1;

  const review = new Reviews({
    id: new_id,
    name: data["name"],
    dealership: data["dealership"],
    review: data["review"],
    purchase: data["purchase"],
    purchase_date: data["purchase_date"],
    car_make: data["car_make"],
    car_model: data["car_model"],
    car_year: data["car_year"],
  });

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error("Error inserting review:", error); // Log the error
    res.status(500).json({ error: "Error inserting review" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
