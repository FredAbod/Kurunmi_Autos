const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const User = require("../models/userSchema");
const cloudinary = require("../utils/cloudinary");
const saltRounds = 10;

const userSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
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
      role: role,
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
      text: "Thank you for signing up with us. Namaste",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).json({ message: "User created" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Something went wrong creating a user" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { firstName, password } = req.body;
    const user = await User.findOne({ firstName: firstName });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const expirationTime = process.env.expires_In;
    const payload = {
      userId: user._id,
    };

    const token = jwt.sign(payload, process.env.secretKey, {
      expiresIn: expirationTime,
    });

    const dataInfo = {
      status: "success",
      message: "User Logged in successful",
      access_token: token,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: `${user.email}`,
      subject: "Hello from KurunmiAutos",
      text: "You Just logged In to your Site. Namaste",
    };

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

const uploadProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const { userId } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { profilePic: result.secure_url },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Something went wrong updating profile picture" });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { email: email },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "Email updated successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong updating email" });
  }
};

const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

// Associate the reset token with the user's account
const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = generateResetToken();
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
  await user.save();

  return resetToken;
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  // Configure your email provider settings here
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});
// Send the password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Please click the following link to reset your password: ${resetToken}`,
  };

  await transporter.sendMail(mailOptions);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const resetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  try {
    // Find the user by email and check if the reset token is valid and not expired
    const user = await User.findOne({ email, resetToken, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update the user's password
    user.password = hashedPassword;
    // Clear the reset token and resetTokenExpiration
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { userSignup, userLogin, uploadProfilePic, updateEmail, resetPassword, changePassword };
