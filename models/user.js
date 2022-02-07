// 1 Происходит импорт зависимостей и их сохранение в  переменных.
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')

// 2 Создается новая схема. Для каждого пользователя вы сохраняете email, username и password в базу данных.
// Схема описывает, как должна быть создана модель для каждого документа. Здесь вы указываете, что типом адреса электронной почты, имени
// пользователя пароль должен быть String.
const userSchema = new Schema({
    email: String,
    username: String,
    password: String
}, {

    // 3 Также для каждого пользователя вы хотите создать timestamps (* время создания/модификации файла).
    // Вы используете Mongoose для получения значений createdAt и updatedAt. Затем сохраняете их в базу данных.
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

// 4 Определяется модель, и результат присваивается константе под названием User, которая потом экспортируется в качестве модуля.
// Поэтому ее можно использовать в других частях приложения.
const User = mongoose.model('user', userSchema)
module.exports = User


module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    } catch(error) {
        throw new Error('Hashing failed', error)
    }
}