// Nunca devolver la contrasena de los usuarios en un listado.
const sinClave = (filas) => Array.isArray(filas) ? filas.map(function (f) { const c = Object.assign({}, f); delete c.pass; delete c.password; return c; }) : filas;
const JWT_SECRETO = require("../config/jwt");
const mysql = require('../config/database').mysql_pool;
const jwt = require('jsonwebtoken');

const getUsers = async (req, res) => {
    try {
        var token = req.headers['authorization']
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
            mysql.query('SELECT * FROM usuarios', function(err, rows, fields) {
                if (err) {
                  console.error('[users]', err.code || err);
                  res.status(500).json({data:false,status:false});
                  return;
                }
                res.status(200).json({data:sinClave(rows),status:true});
              });
          }
        })
    } catch (error) {
        res.status(200).json(error);
    }
}

const getUsersById = async(req,res)=>{
  try {
    var token = req.headers['authorization'];
    var id = req.params.id;
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
        mysql.query('SELECT * FROM usuarios WHERE id = ?', [id], function(err, rows, fields) {
            if (err) {
              console.error('[users/:id]', err.code || err);
              res.status(500).json({data:false,status:false});
              return;
            }
            res.status(200).json({data:sinClave(rows),status:true});
          });
      }
    })
} catch (error) {
    res.status(200).json(error);
}
}

module.exports = {
    getUsers,
    getUsersById,
}