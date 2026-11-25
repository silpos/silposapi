// Nunca devolver la contrasena de los usuarios en un listado.
const sinClave = (filas) => Array.isArray(filas) ? filas.map(function (f) { const c = Object.assign({}, f); delete c.pass; delete c.password; return c; }) : filas;
var mysql = require("mysql");
const { masterConnection } = require("../functions/connectionParams");
const Users = require('../models/users.model');

const getAllUsers = async (req, res) => {
  try {
    var connection = mysql.createConnection(masterConnection());
    connection.connect();
    Users.findAll(connection, req.headers['company'], function(err, users) {
      if (err)
        res.send(err);

      res.status(200).json({data:sinClave(users), status:true, codeerror:false});
    });
  } catch (error) {
      res.status(200).json({data:false, status:false, codeerror:error});
  }
};

module.exports={
    getAllUsers
}