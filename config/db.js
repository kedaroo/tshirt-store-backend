const mongoose = require("mongoose");

const { DB_URL } = process.env;

const connectWithDb = () => {
  try {
    mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected to db");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectWithDb;
