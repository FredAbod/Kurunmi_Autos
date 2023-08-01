const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    carName: {type: String, required: true},
    carModel: {type: String, required: true},
    year_of_man: {type: String, required: true, unique: true},
    color: {type: String, required: true},
    type: {type: String, required: true},
    carImage: {type: String, required: true},
},
{
    timestamps: true,
    versionKey: false,
  })

    module.exports = mongoose.model('Car', carSchema);