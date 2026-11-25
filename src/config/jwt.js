// Clave con la que se firman y verifican los tokens de la APK.
//
// Antes estaba escrita en el codigo y el repositorio se podia descargar desde
// internet: con ella cualquiera fabricaba un token valido. Ahora se lee de la variable de entorno
// SILPOSAPI_JWT_SECRETO o, si no existe, de jwt_secreto.local.js (junto a este archivo), que NO se
// versiona y existe solo en el servidor:
//     module.exports = '<clave larga y aleatoria>';
// Cambiar la clave invalida todos los tokens emitidos: cada usuario de la APK vuelve a iniciar
// sesion una vez.
let secreto = process.env.SILPOSAPI_JWT_SECRETO;
if (!secreto) {
  try {
    secreto = require('./jwt_secreto.local.js');
  } catch (e) {
    secreto = null;
  }
}
if (typeof secreto !== 'string' || secreto.length < 32) {
  throw new Error('silposapi: falta la clave JWT (SILPOSAPI_JWT_SECRETO o src/config/jwt_secreto.local.js, minimo 32 caracteres)');
}

module.exports = secreto;
