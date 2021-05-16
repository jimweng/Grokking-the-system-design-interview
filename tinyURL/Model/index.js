
const mysql = require('mysql2/promise');

const sqlConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'system_interview',
    dialect: 'mysql'
};

async function getData(sql, queryString='') {
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [result] = await connection.query(sql, queryString);
        if (result.length === 0) {
            throw error;
        }
        return result;
    } catch (error) {
        throw error;
    }
}

async function CUDData(sql, queryString=''){
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [result] = await connection.query(sql, queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getData,
    CUDData
};