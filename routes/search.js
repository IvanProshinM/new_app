const express = require('express');
const router = express.Router();





const Staff = require("../models/staff");


router.route('/')
    .get(async (req, res, next) => {
        try {
            const keyword = req.query['searchField'];


            console.log(keyword)
            if (keyword === '' || keyword === undefined) {
                console.log('Вы ничего не ввели')
                return res.render('search', {
                    search: []
                })
            } else {
                const searchUser = await Staff.find({
                        $or: [{'fullName': {$regex:keyword}}, {'position': {$regex:keyword}}, {'experience': {$regex:keyword}}]
                    }).lean()
                console.log(searchUser)
                return res.render('search', {
                    search: searchUser
                })
            }
        } catch (err) {
            next(err)
        }

    })

module.exports = router
