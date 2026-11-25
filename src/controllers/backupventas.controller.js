const JWT_SECRETO = require("../config/jwt");
const jwt = require("jsonwebtoken");
var mysql = require("mysql");

const backupventas = async (req,res)=>{
    try {
        var token = req.headers['authorization'];
        var businessId = req.headers['bsnid'];
        var data = req.body.ventas;
        if(!token){
            res.status(401).send({
              error: "Es necesario el token de autenticación"
            })
            return
        }
        token = token.replace('Bearer ', '')
        jwt.verify(token, JWT_SECRETO, function(err, user) {
          if (err) {
            res.status(401).send({
              error: 'Token inválido'
            })
          } else {

	   var connection = mysql.createConnection({
              host: "localhost",
              user: req.headers['dbu'],
              password: req.headers['dbp'],
              database: req.headers['dbd'],
            });
            var dictstring = JSON.stringify(data);
            // Antes el JSON iba pegado dentro del SQL (un apostrofo en un producto o cliente lo
            // rompia) y cualquier error se lanzaba con throw dentro del callback: nadie lo
            // atrapaba y se caia el proceso Node completo, con todas las peticiones de todos los
            // clientes. Pasaba siempre en las empresas cuya base no tiene backup_ventas_movil
            // (casi todas). Ahora el valor va como parametro y el error se responde.
            var fallo = function (etapa, err) {
              console.error('[backupventas] ' + etapa + ' bd=' + req.headers['dbd'] + ':', err && err.code ? err.code : err);
              res.status(200).json({data:false,status:false,codeerror:(err && err.code) ? err.code : 500});
            };
            connection.connect(function(err) {
              if (err) {
                fallo('conexion', err);
                return;
              }
              connection.query("INSERT INTO backup_ventas_movil (response, status) VALUES (?, '1')", [dictstring], function (err, result) {
                if (err) {
                  fallo('insert', err);
                  return;
                }
                res.status(200).json({data:result,status:true});
              });
            });
	 //res.status(200).json({status:dictstring});
          }
        })
    } catch (error) {
        res.status(200).json(error);
    }
}

module.exports = {
    backupventas
}
