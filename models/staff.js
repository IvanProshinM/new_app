const mongoose = require('mongoose')
const Schema = mongoose.Schema

const staffSchema = new Schema ({
    fullName:String,
    position: String,
    workExperience: String,
    imageSrc: {
    type:String,
    default:''
    }
})

const Staff = mongoose.model('staff', staffSchema)

module.exports = Staff