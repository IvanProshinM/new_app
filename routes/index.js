const express = require('express')
const router = express.Router()




router.route('/')
    .get(async (req, res) => {
        res.render('index')
    })
router.route('/uploads')

    .post(async (req, res, next) => {
            let filedata = req.file;
            console.log(filedata);
            if (!filedata) {
                res.send('Ошибка при загрузке файла');
            } else {
                res.send('Файл загружен')
            }
        }
    )

router.route('/staff')
    .get(async (req, res) => {
        res.render('staff')
    })


module.exports = router