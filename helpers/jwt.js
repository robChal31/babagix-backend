var { expressjwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.SECRET_JWT;
  return expressjwt({
    secret: process.env.SECRET_JWT,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/upload\/(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/public\/avatar\/(.*)/, method: ["GET", "OPTIONS"] },
      // { url: /\/public\/upload(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/item(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/category(.*)/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/message(.*)/, method: ["GET", "OPTIONS"] },
      {
        url: /\/api\/v1\/user\/confirm(.*)/,
        method: ["GET", "OPTIONS", "POST"],
      },
      "/api/v1/user/login",
      "/api/v1/user/register",
    ],
  });
}

async function isRevoked(req, token) {
  // if (!token.payload.verified) {
  //   return true;
  // }
  return undefined;
}

module.exports = authJwt;
