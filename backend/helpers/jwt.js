const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL
    console.log("test")
    return expressJwt({
        secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            {url: `${api}/products`, method: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}

module.exports = authJwt;
