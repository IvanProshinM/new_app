const mongoose = require('mongoose')
const {any} = require("joi");
const Schema = mongoose.Schema
const staffSchema = new Schema ({
    fullName:String,
    position: String,
    workExperience: String,
    imageEx:String,
})

const Staff = mongoose.model('staff', staffSchema)

module.exports = Staff