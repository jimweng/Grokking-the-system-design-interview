const mysql = require('mysql2/promise');
const sqlConfig = require('../config');

async function getUser(sql, queryString = '') {
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [result] = await connection.query(sql, queryString);

        if (result.length === 0) {
            return 'data not found';
        }

        return result;
    } catch (error) {
        throw error;
    }
}

async function CUDUser(sql, queryString = '') {
    try {
        const connection = await mysql.createConnection(sqlConfig);
        console.log('sql: ', sql);
        console.log('queryString: ', queryString)
        const [result] = await connection.query(sql, queryString);
        return result;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    getUser,
    CUDUser
}