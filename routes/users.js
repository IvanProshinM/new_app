const express = require('express');
const router = express.Router()
const Joi = require('joi')
const passport = require('passport')

const User = require('../models/user')
const bcrypt = require("bcryptjs");
const {hashPassword} = require("../models/user");


//validation schema

const userSchema = Joi.object().keys({
    email: Joi.string().email().required(),                  //здесь не понял - object.keys (obj) - возвращает массив ключей, соответственно что означает запись Joi.string().email().required()
    username: Joi.string().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
})
const loginSchema = Joi.object().keys({
    email: Joi.string().email().required(),                  //здесь не понял - object.keys (obj) - возвращает массив ключей, соответственно что означает запись Joi.string().email().required()
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
})

/*function piterSalt(pass) {
    const salt = bcrypt.genSalt(10)
    bcrypt.hashSync(pass, salt)

}*/


router.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post(async (req, res, next) => {
        try {

            const result = Joi.validate(req.body, loginSchema)
            if (result.error) {
                req.flash('error', 'Хуйня, вводи снова и правильно')
                res.redirect('login')
            }

            const user = await User.findOne({'email': result.value.email});
            /*console.log(user)*/
            if (user == null) {
                req.flash('error', 'Нет такого пользователя.')
                return res.redirect('/users/login')
            }

            console.log(req.body.password)
            let newpass = await hashPassword(req.body.password)
            console.log(newpass)
            console.log(user.password)
            const isValidPassword = await bcrypt.compare(req.body.password, user.password)
            console.log(isValidPassword);
            if (isValidPassword === true) {
                req.flash('success', 'Вы успешно авторизовались')
                res.redirect('http://localhost:5000/')
            }
            else {
                req.flash('error', 'Пароль неверный')
                res.redirect('/users/login')
            }



        } catch (error) {
            next(error)
        }

    })
router.route('/register')
    .get((req, res) => {
        res.render('register')
    })
    .post(async (req, res, next) => {
        try {
            const result = Joi.validate(req.body, userSchema)
            if (result.error) {
                req.flash('error', 'Data entered is not valid. Please try again.')
                res.redirect('/users/login')
                return
            }

            const user = await User.findOne({'email': result.value.email})
            if (user) {
                req.flash('error', 'Email is already in use.')
                res.redirect('/users/register')
                return
            }

            const hash = await User.hashPassword(result.value.password)

            delete result.value.confirmationPassword
            result.value.password = hash

            const newUser = await new User(result.value)
            await newUser.save()

            req.flash('success', 'Registration successfully, go ahead and login.')
            res.redirect('/users/login')

        } catch (error) {
            next(error)
        }
    })

module.exports = router