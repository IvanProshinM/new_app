const Joi = require("joi");
const {hashPassword} = require("../models/user");
const bcrypt = require("bcryptjs");
try {

    const result = Joi.validate(req.body, loginSchema)
    if (result.error) {
        req.flash('error', 'Хуйня, вводи снова и правильно')
        res.redirect('login')
    }

    /*const user = await User.findOne({'email': result.value.email});*/
    /*console.log(user)*/
    /* if (user == null) {
         req.flash('error', 'Нет такого пользователя.')
         return res.redirect('/users/login')
     }

     console.log(req.body.password)*/
    let newpass = await hashPassword(req.body.password)

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    /* console.log(isValidPassword);
     if (isValidPassword === true) {
         req.flash('success', 'Вы успешно авторизовались')
         res.redirect('http://localhost:5000/')
     } else {
         req.flash('error', 'Пароль неверный')
         res.redirect('/users/login')
     }

*/
} catch (error) {
    next(error)
}