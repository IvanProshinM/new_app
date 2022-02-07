const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose')
const passport = require('passport')

/*require('./config/passport')*/

mongoose.Promise = global.Promise //что ето ?? (пишет, что настройка mongoose, круто, но что это ???
mongoose.connect('mongodb://localhost:27017/site-auth')
// 1  Результат инициализации Express присваивается константе app. (попрошу повторить еще раз - нахуя?)
const app = express();
app.use(morgan('dev'))
// 2 Происходит настройка промежуточного ПО, которое будет заниматься представлениями. Для создания представлений вы будете использовать handlebars.
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', expressHandlebars({defaultLayout: 'layout'}))
app.set('view engine', 'handlebars');

// 3 Вы настроили промежуточное ПО для bodyparser, cookie, session и passport. Passport будет использоваться, когда пользователи хотят войти в приложение.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'codeworkrsecret',
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize())
app.use(passport.session())

// 4 В определенные моменты вы будете отображать флэш-сообщения. Поэтому вам необходимо настроить промежуточное ПО для этого и
// создать необходимый вам тип флэш-сообщений.


app.use(flash())
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success')
    res.locals.error_messages = req.flash('error')

    next()
})

// 5 Промежуточное ПО для настройки маршрутов. Будет обрабатывать любой запрос, сделанный к пути URL (Uniform Resource Locator -
// унифицированный указатель [местонахождения информационного] ресурса). Здесь указаны пути URL для путей, указанных в файлах index и users.

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

// 6 Промежуточное ПО для обработки ошибок 404. Данное промежуточное ПО начинает действовать, если запрос не соответствует никакому из
// вышеуказанных промежуточному ПО.
app.use((req, res, next) => {
    res.render('notFound')
})
// 7 Сервер настраивается на прослушивание запросов по 5000 порту.
    app.listen(5000, () => console.log('Server started listening on port 5000!'))