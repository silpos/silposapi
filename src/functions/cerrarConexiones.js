// Cierre automatico de las conexiones MySQL abiertas durante una peticion.
//
// Los controladores abren una conexion propia a la base de la empresa con
// mysql.createConnection() y ninguno la cerraba: cada peticion dejaba una conexion viva en
// MySQL hasta su wait_timeout. Ademas, una conexion sin oyente de 'error' tumba el proceso
// Node completo si falla (base caida, credenciales malas), y con el todas las peticiones
// de todos los clientes de la APK.
//
// En vez de tocar cada controlador, se envuelve mysql.createConnection una sola vez: cada
// conexion creada dentro de una peticion queda registrada y se cierra cuando la respuesta
// termina o el cliente se desconecta. end() espera a que acaben las consultas pendientes.
const { AsyncLocalStorage } = require('async_hooks');
const mysql = require('mysql');

const almacen = new AsyncLocalStorage();
const createConnectionOriginal = mysql.createConnection;

mysql.createConnection = function (...args) {
  const connection = createConnectionOriginal.apply(this, args);
  connection.on('error', function (err) {
    console.error('[mysql] error de conexion:', err && err.code ? err.code : err);
  });
  const store = almacen.getStore();
  if (store) {
    store.push(connection);
  }
  return connection;
};

function cerrarConexiones(req, res, next) {
  const conexiones = [];
  let cerradas = false;
  const cerrar = function () {
    if (cerradas) return;
    cerradas = true;
    conexiones.forEach(function (connection) {
      try {
        connection.end(function () {});
      } catch (e) {
        // ya estaba cerrada o nunca se conecto
      }
    });
  };
  res.on('finish', cerrar);
  res.on('close', cerrar);
  almacen.run(conexiones, next);
}

module.exports = { cerrarConexiones };
