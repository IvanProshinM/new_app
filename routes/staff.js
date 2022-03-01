const express = require('express');
const router = express.Router();
const Staff = require("../models/staff");
const paginate = require("express-paginate");


router.route('/')

    .get(async (req, res, next) => {

        try {
            let optionsQuery = {}
            if (req.user == null) {
                optionsQuery = {isActive: true}
            }

            const [staffList, itemCount] = await Promise.all([
                Staff.find(optionsQuery).limit(req.query.limit).skip(req.skip).lean().exec(),
                Staff.count(optionsQuery)

            ])
            const currentPage = req.query.page
            const pageCount = Math.ceil(itemCount / req.query.limit)

            res.render('staff', {
                "staffList": staffList,
                pageCount,
                itemCount,
                pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),

                pagination: {
                    page: currentPage,
                    limit: req.query.limit,
                    totalRows: itemCount,
                    queryParams: req.query.page
                }
            })

        } catch (err) {
            next(err)
        }
    })

module.exports = router