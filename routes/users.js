const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require("bcryptjs");
const {hashPassword} = require("../models/user");
const http = require('http');
const url = require('url');
const nodemailer = require('nodemailer');
const LocalStrategy = require('passport-local').Strategy



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

const recoverSchema = Joi.object().keys({
    email: Joi.string().email().required()
})
const resetSchema = Joi.object().keys({
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).required(),
    passwordResetHash: Joi.string().required()

})
/*function piterSalt(pass) {
    const salt = bcrypt.genSalt(10)
    bcrypt.hashSync(pass, salt)

}*/

let transpoter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: 'SSL',
    auth: {
        user: 'proshinvanivanoff',
        pass: 'onphovhouktqjlfl',
    },
})


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


            /* let vadik = new Date().toLocaleDateString()
             let hash = crypto.createHash('md5').update(vadik).digest('hex');
             console.log("Сюда смотри!",hash)*/


            const isValidPassword = await bcrypt.compare(req.body.password, user.password)
            console.log(isValidPassword);
            if (isValidPassword === true) {
                req.flash('success', 'Вы успешно авторизовались')
                res.redirect('http://localhost:5000/')
            } else {
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
            /*let date = new Date().toLocaleDateString() + req.body.email;*/
            const user = await User.findOne({'email': result.value.email})
            if (user) {
                req.flash('error', 'Email is already in use.')
                res.redirect('/users/register')
                return
            }
            let date = new Date().toLocaleDateString() + req.body.email;
            const hash = await User.hashPassword(result.value.password)


            const hashAct = await User.hashActive(result.value.email + (new Date().toLocaleDateString() + req.body.email))

            delete result.value.confirmationPassword
            result.value.password = hash

            console.log("сюда смотри, додик!", hashAct)
            result.value.activateHash = hashAct
            result.value.activatedAt = null
            console.log(result.value)
            const newUser = await new User(result.value)
            await newUser.save()
            const linkActivate = '/users/confirm?hash=' + hashAct
            req.flash('success', 'Registration successfully, go ahead and login. На почту прислалась ссылка, надо по ней перейти для подтверждения')
            await transpoter.sendMail({
                from: 'proshinvanivanoff@yandex.ru',
                to: req.body.email,
                subject: 'Подтверждение о регистрации',
                text: 'Ваша ссылка для подтверждения почты: ' + linkActivate
            })
            res.redirect('/users/login')

        } catch (error) {
            next(error)
        }
    })
router.route('/confirm')
    .get(async (req, res) => {

        const hashGet = req.query['hash']
        console.log('ВТОРОЙ ВАРИАНТ', hashGet)

        try {
            const hashFinder = await User.findOne({'activateHash': hashGet})
            console.log('ЗДЕСССЬЬЬ', hashFinder)
            if (hashFinder != null) {
                hashFinder.activateHash = null;
                hashFinder.activatedAt = new Date().toLocaleDateString()
                console.log(hashFinder.activatedAt)
                console.log(hashFinder.activateHash)
                req.flash('success', 'Аккаунт успешно активирован')
                res.redirect('/users/login')
                const newUser = await new User(hashFinder)
                await newUser.save()
            } else {
                req.flash('error', 'Такой хэш не найден или недействителен')
                res.redirect('/users/login')
            }

        } catch (error) {

        }
        /* req.flash('success',urlRequest)*/
    })

router.route('/recovery')
    .get(async (req, res) => {
        res.render('recovery')
    })
    .post(async (req, res, next) => {
        try {

            const result = Joi.validate(req.body, recoverSchema)
            const user = await User.findOne({'email': result.value.email})

            if (result.error) {
                console.log('ЧТО В ЗАПРОСЕ', req.body)
                req.flash('error', 'Data entered is not valid. Please try again.')
                res.redirect('/users/recovery')
                return
            }

            if (user) {
                const resetHash = await User.hashActive(user.email + new Date().toLocaleDateString())
                /*    console.log('РЕЗЕТ ХЭШ ЙОПТА', resetHash)*/
                user.passwordResetHash = resetHash;
                const linkActivate = '/users/reset?hash=' + resetHash;
                req.flash('success', 'Ваша ссылка для сброса пароля отправлена на Ваш почтовый ящик');
                await transpoter.sendMail({
                    from: 'proshinvanivanoff@yandex.ru',
                    to: user.email,
                    subject: 'Сброс пароля',
                    text: 'Ваша ссылка для сброса пароля: ' + linkActivate
                })
                res.redirect('/users/recovery')
                const newUser = await new User(user)
                await newUser.save()

            } else {
                req.flash('error', 'Такого пользователя нет')
                res.redirect('/users/recovery')
            }

        } catch (error) {
            next(error)
        }
    })
router.route('/reset')
    .get(async (req, res) => {

        const hashGet = req.query['hash']
        console.log('ВТОРОЙ ВАРИАНТ', hashGet)
        try {
            const hashFinder = await User.findOne({'passwordResetHash': hashGet})

            if (hashFinder == null) {
                req.flash('error', 'Такой хэш не найден')
                res.redirect('/users/recovery')
            } else {
                req.flash('success', 'Введите новый пароль')
                res.render('reset', {'hash': hashGet})
            }
        } catch (error) {
            next(error)
        }
    })
    .post(async (req, res) => {
        try {
            console.log(req.body)
            const result = Joi.validate(req.body, resetSchema)
            console.log(result.error)

            if (result.error) {
                req.flash('error', 'Data entered is not valid. Please try again.')
                return res.render('reset')
            }
            const newPass = req.body.password
            console.log(req.body.password)
            const hash = req.body.passwordResetHash
            console.log(req.body.passwordResetHash)
            const hashFinder = await User.findOne({'passwordResetHash': hash})
            console.log('НАШ ХЭШ', hashFinder)
            if (hashFinder != null) {
                hashFinder.password = await User.hashActive(newPass + new Date().toLocaleDateString())
                console.log(newPass)
                req.flash('success', 'Пароль упешно изменен!')
                hashFinder.passwordResetHash = null
                await hashFinder.save()
                res.redirect('/users/login')
            }

        } catch (error) {
            req.flash('error', 'Data entered is not valid. Please try again.')
            console.log(error)
            return res.render('reset')
        }
    })


module.exports = router

