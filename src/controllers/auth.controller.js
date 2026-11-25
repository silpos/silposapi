const JWT_SECRETO = require("../config/jwt");
const jwt = require('jsonwebtoken');

async function verifyJWTToken(request, response, next) {
  var token = request.headers['authorization'];
  if(!token){
    response.status(401).send({
        error: "Es necesario el token de autenticación",
        status:false,
        codeerror:401,
    })
    return
  }
  token = token.replace('Bearer ', '')
  jwt.verify(token, JWT_SECRETO, function(err, user) {
    if (err) {
      response.status(401).send({
        error: 'Token inválido',
        status:false,
        codeerror:401,
      })
      // Antes seguia a next() aun con el token invalido: respondia 401 pero la ruta se
      // ejecutaba igual (productos, clientes, impresoras, allUsers quedaban abiertos).
      return
    }
    request.user = user;
    next();
  });
}
module.exports ={
  verifyJWTToken,
}