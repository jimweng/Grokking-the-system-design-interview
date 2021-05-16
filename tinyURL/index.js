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
 * 
 *      Data Schema
 *      id: Unique,
 *      original URL: String,
 *      hashed URL: String,
 *      expiration: Date,
 *      created_at: Date
 */

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment');
const { getData, CUDData } = require('./Model');
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

app.get('/getAll', async (req, res) => {
    try {
        let sql = 'SELECT * FROM tinyURL';
        const result = await getData(sql);
        res.send(result);
    } catch (error) {
        throw error;
    }
});

app.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        let sql = 'SELECT * FROM tinyURL WHERE originalURL = ?';
        const result = await getData(sql, url);
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
        const { insertId } = await CUDData(sql, queryString);
        sql = 'SELECT * FROM tinyURL WHERE id = ?';
        const [{ hashedURL }] = await getData(sql, insertId);
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
        const result = await CUDData(sql, [updateString, original_url]);
        sql = 'SELECT * FROM tinyURL WHERE originalURL = ?';
        const [{ hashedURL }] = await getData(sql, new_url);
        res.status(400).send(`new hashedURL: ${hashedURL}`);
    } catch (error) {
        res.send('Update failed: ', error);
    }
});


app.delete('/delete', async (req, res) => {
    try {
        const { url } = req.body;
        let sql = 'DELETE FROM tinyURL WHERE originalURL = ?';
        await CUDData(sql, url);
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