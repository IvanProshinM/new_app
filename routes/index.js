const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index')
})
router.route('/staff')
    .get (async (req,res) => {
        res.render('staff')
    })

module.exports = router