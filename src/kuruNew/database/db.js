const mongoose = require("mongoose");

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
      console.log("Connected to Database");
    } catch (error) {
      console.log("Error Connecting to Database", error);
    }
  };
 module.exports = connectDB;