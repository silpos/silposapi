const JWT_SECRETO = require("../config/jwt");
const jwt = require('jsonwebtoken');
const mysql = require('../config/database').mysql_pool;

const getBusiness = async (req,res)=>{
    try {
        var token = req.headers['authorization'];
        var businessId = req.headers['bsnid'];
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
            // pool.query toma y devuelve la conexion al pool; con getConnection() nunca se
            // devolvia y, gastadas las 10 del pool, la APK se quedaba "verificando" sin fin.
            // Solo las empresas a las que pertenece el usuario del token. Antes devolvia la fila
            // de cualquier bsnid, con las credenciales de su base (dbuser/dbpass) y su token_api,
            // a quien tuviera un token, y la clave para fabricarlos estaba en el repositorio.
            // El token de /login trae el email (username); el de /loginv2, el id (user).
            var idUsuario = (user && user.user) ? user.user : 0;
            var emailUsuario = (user && user.username) ? user.username : '';
            mysql.query(
              'SELECT e.* FROM empresas e INNER JOIN company_user cu ON cu.company_id = e.id INNER JOIN usuarios u ON u.id = cu.user_id ' +
              'WHERE e.id = ? AND cu.activo = 1 AND (u.id = ? OR (? <> \'\' AND u.email = ?)) LIMIT 1',
              [businessId, idUsuario, emailUsuario, emailUsuario],
              function(err, rows, fields) {
                if (err) {
                  console.error('[empresa]', err.code || err);
                  res.status(500).json({data:false,status:false,codeerror:500});
                  return;
                }
                if (!rows || rows.length === 0) {
                  console.error('[empresa] negada bsnid=' + businessId + ' usuario=' + (idUsuario || emailUsuario));
                  res.status(403).json({data:[],status:false,codeerror:403});
                  return;
                }
                res.status(200).json({data:rows,status:true});
              });
          }
        })
    } catch (error) {
        res.status(200).json(error);
    }
}

const getTipoConsultas = async (req,res)=>{
try {
        var token = req.headers['authorization']
        if(!token){
            res.status(401).send({
                error: "Es necesario el token de autenticación",
                status:false,
                codeerror:401,
            })
            return
        }
        token = token.replace('Bearer ', '')
      
        jwt.verify(token, JWT_SECRETO, function(err, user) {
          if (err) {
            res.status(401).send({
                error: 'Token inválido',
                status:false,
                codeerror:401,
            })
          } else {

            var connection = mysql.createConnection({
                host: "localhost",
                user: req.headers['dbu'],
                password: req.headers['dbp'],
                database: req.headers['dbd'],
              });
          
              connection.connect();
                connection.query('SELECT * FROM clientes', function(err, rows, fields) {
                    if (err) {
                      console.error('[tipos_consultas]', err.code || err);
                      res.status(500).json({data:false,status:false,codeerror:500});
                      return;
                    }
                    res.status(200).json({data:rows,status:true,codeerror:false});
                  });
            
          }
        })
    } catch (error) {
        res.status(200).json({data:false,status:false,codeerror:error});
    }
}

module.exports = {
    getBusiness,
    getTipoConsultas
}
