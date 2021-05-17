const User = require('../Model/user');


async function checkUser(email) {
    try {
        let sql = `SELECT * FROM user WHERE email = ? `
        const [{ password }] = await User.getUser(sql, email);
        return password;

    } catch (error) {
        throw 'can not get the user';
    }
}

async function createUser(userInfo) {
    try {
        let sql = `INSERT INTO user SET ?`
        const result = await User.CUDUser(sql, userInfo);
        return result;

    } catch (error) {
        console.log('error: ', error);
        throw 'operation error'
    }
}

module.exports = {
    checkUser,
    createUser
}