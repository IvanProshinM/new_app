const mongoose = require('mongoose')
const {any} = require("joi");
const Schema = mongoose.Schema
const ObjectId = require('mongodb').ObjectId;
const staffSchema = new Schema({
    fullName: String,
    position: String,
    workExperience: String,
    imageEx: Boolean,
    createdAt: String,
    isActive: Boolean
})

const Staff = mongoose.model('staff', staffSchema)

module.exports = Staff