/**
 *   設計一個URL轉址的service
 *      backend: Express
 *      DB: mySQL, Redis
 *      (optional): Lambda
 * 
 *      API Design:
 *          Create : 1 API
 *          Read   : 2 APIs, getALL, get
 *          Update : 1 API
 *          Delete : 1 API
 *          + Signin : 1 API
 *          + Signout: 1 API
 *          + Signup : 1 API
 * 
 *      Data Schema
 *      URL:
 *          id: Number(Unique),
 *          original URL: String(Unique),
 *          hashed URL: String,
 *          expiration: Date,
 *          created_at: Date,
 *          + userId: Number
 * 
 *      + User:
 *          + UserId: Number(Unique),
 *          + Name: String,
 *          + Email: String,
 *          + CreationDate: Date,
 *          + LastLogin: Date
 *      
 */

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { getUrl, CUDUrl } = require('./Model/tinyURL');
const userController = require('./Controller/userController');
// const {Sequelize, DataTypes} = require('sequelize');
// const sequelize = new Sequelize('database', 'username', 'password',  {
//     host: 'localhost',
//     dialect: 'mysql'});

// const URL = sequelize.define('tinyURL', {
//     originalURL: DataTypes.String,
//     hashedURL: DataTypes.String,
//     expiration: DataTypes.Number,
//     created_at: DataTypes.Number
// });
function randomString(size = 10) {
    return crypto
        .randomBytes(size)
        .toString('base64')
        .slice(0, size);
}


// const corsOption = {
//     origin: '127.0.0.1:3306' 
// };

// app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/signin', async (req, res) => {
    try {
    const { email, password } = req.body;
    const hashedPassword = await userController.checkUser(email);
    const result = await bcrypt.compare(password, hashedPassword);
    res.send('OK!')
    } catch (error) {
        res.send('signin error');
    }
    
})

app.post('/signup', async (req, res) => {
    try {
    const { email, password, name } = req.body;
    let userInfo = {};

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    userInfo = {
        name,
        email,
        password: hashedPassword
    }
    
    console.log('userInfo: ', userInfo);
    const result = await userController.createUser(userInfo)
    
    console.log('result: ', result);
    res.send('OK!')
    } catch(error) {
        res.send(`signup error ${error}`);
    }
})

app.get('/getAll', async (req, res) => {
    try {
        let sql = 'SELECT * FROM tinyURL';
        const result = await getUrl(sql);
        res.send(result);
    } catch (error) {
        throw error;
    }
});

app.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        let sql = 'SELECT * FROM tinyURL WHERE originalURL = ?';
        const result = await getUrl(sql, url);
        res.send(result);
    } catch (error) {
        res.send('Can not find the url');
    }

});

app.post('/create', async (req, res) => {
    try {
        const { url } = req.body;
        let sql = 'INSERT INTO tinyURL SET ?';
        const queryString = {
            originalURL: url,
            hashedURL: 'tinyURL/' + randomString(),
            created_at: moment().unix(),
            expiration: moment().add(5, 'years').unix()
        }
        const { insertId } = await CUDUrl(sql, queryString);
        sql = 'SELECT * FROM tinyURL WHERE id = ?';
        const [{ hashedURL }] = await getUrl(sql, insertId);
        res.status(200).send(`Finished: ${hashedURL}`);
    } catch (error) {
        res.status(404).send(`Create failed: ${error}`);
    }
});

app.put('/update', async (req, res) => {
    try {
        const { new_url, original_url } = req.body;
        let sql = 'UPDATE tinyURL SET ? WHERE originalURL = ?';
        const updateString = {
            originalURL: new_url,
            hashedURL: 'tinyURL/' + randomString(),
            created_at: moment().unix(),
            expiration: moment().add(5, 'years').unix()
        }
        const result = await CUDUrl(sql, [updateString, original_url]);
        sql = 'SELECT * FROM tinyURL WHERE originalURL = ?';
        const [{ hashedURL }] = await getUrl(sql, new_url);
        res.status(400).send(`new hashedURL: ${hashedURL}`);
    } catch (error) {
        res.send('Update failed: ', error);
    }
});


app.delete('/delete', async (req, res) => {
    try {
        const { url } = req.body;
        let sql = 'DELETE FROM tinyURL WHERE originalURL = ?';
        await CUDUrl(sql, url);
        res.send('finished');
    } catch (error) {
        res.send('Delete failed: ', error);
    }
})

// sequelize.sync().then(function(){

// })



app.listen(3000, () => {
    console.log('listening on port 3000');
});