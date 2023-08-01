const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePic: {type: String},
    resetToken: { type: String},
    resetTokenExpiration: { type: String},
    role: {type: String, default: "user", enum: ["admin", "user"]},
},
{
    timestamps: true,
    versionKey: false,
  })

    module.exports = mongoose.model('User', userSchema);