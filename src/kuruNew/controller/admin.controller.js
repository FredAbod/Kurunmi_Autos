const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("../utils/cloudinary");
const User = require("../models/userSchema");
const Car = require('../models/cars.schema')
const saltRounds = 10;

const adminSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      role: "admin",
    });
    await newUser.save();

    // Create a transporter using your Gmail account
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: `${newUser.email}`,
      subject: "Hello from KurunmiAutos",
      text: "Thank you for signing up with us as an Admin. Namaste",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).json({ message: "Admin created" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Something went wrong creating a user" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { firstName, password } = req.body;
    const user = await User.findOne({ firstName: firstName });
    if (!user) {
     return res.status(404).json({ message: "user not found" });
    }
    if(user.role !== "admin") {
      return  res.status(404).json({ message: "You are not Authorized" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Incorrect Password" });
    }
    const expirationTime = process.env.expires_In;
    const payload = {
      userId: user._id,
    };
    
    const token = jwt.sign(
      payload,
      process.env.secretKey,
      { expiresIn: expirationTime }
      );
      // console.log(token)
      
    const dataInfo = {
      status: "success",
      message: "Admin Logged in successful",
      access_token: token,
    };
    // Create a transporter using your Gmail account
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: `${user.email}`,
      subject: "Hello from KurunmiAutos",
      text: "You Just logged In to your Site. Namaste",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    return res.status(200).json({ dataInfo });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong logging in user" });
  }
};

const findAllUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to access this route" });
    }

    // Only fetch users with the role "user"
    const allUser = await User.find({ role: "user" });

    return res.status(200).json({ count: allUser.length, data: allUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong finding all users" });
  }
};

const saveCar = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to access this route" });
    }

    const { carName, carModel, year_of_man, color, type, carImage } = req.body;
    console.log(req.body);
    const result = await cloudinary.uploader.upload(req.file.path);
    // Create a new car instance using the Car model
    const newCar = new Car({
      carName: carName,
      carModel: carModel,
      year_of_man: year_of_man,
      color: color,
      type: type,
      carImage: result.secure_url,
    });

    // Save the car to the database
    const savedCar = await newCar.save();

    res.status(201).json({ message: 'Car saved successfully', car: savedCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save the car' });
  }
};


module.exports = { adminSignup, adminLogin, findAllUser, saveCar };
