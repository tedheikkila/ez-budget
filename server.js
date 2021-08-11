const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const config = { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }

// mongoose connects to Robo 3T's ez-budget at localhost:3000
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/ez-budget", config);

// routes
app.use(require("./routes/api.js"));
app.use(require("./routes/index.js"))

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});