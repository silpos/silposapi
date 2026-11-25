const JWT_SECRETO = require("../config/jwt");
const jwt = require('jsonwebtoken');
const mysql = require('../config/database').mysql_pool;

const statusServices = (req,res) => {
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

            // Solo comprueba que la base de master responde (el resultado nunca se uso: el
            // header llega en minusculas y 'Company' siempre venia vacio). pool.query devuelve
            // la conexion al pool; con getConnection() se quedaba tomada y, gastadas las 10,
            // la APK se quedaba "verificando estado de la empresa" sin fin.
            mysql.query('SELECT 1', function(err) {
                if (err) {
                  console.error('[statusservices]', err.code || err);
                  res.status(200).json({
                    status:false,
                    database:false,
                    codeerror:500,
                  });
                  return;
                }
                res.status(200).json(
                    {
                        status:true,
                        database:true,
                        codeerror:false,
                    }
                );
              });
          }
        })
    } catch (error) {
        res.status(200).json(error);
    }
}

module.exports={
    statusServices,
}