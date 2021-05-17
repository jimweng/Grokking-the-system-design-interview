
const mysql = require('mysql2/promise');
const sqlConfig = require('../config');

async function getUrl(sql, queryString='') {
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [result] = await connection.query(sql, queryString);
        if (result.length === 0) {
            throw 'data no found';
        }
        return result;
    } catch (error) {
        throw error;
    }
}

async function CUDUrl(sql, queryString=''){
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [result] = await connection.query(sql, queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getUrl,
    CUDUrl
};