const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', true);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
var path = require('path');
//middlewares

// Este es el archivo que arranca Passenger (no src/index.js). Con el limite por defecto de
// express.json() (100 KB), un celular con muchas ventas acumuladas recibia 413 en /backupventas.
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:false, limit: '50mb'}));

// Cierra al terminar cada peticion las conexiones MySQL que abran los controladores.
app.use(require('./src/functions/cerrarConexiones').cerrarConexiones);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
//routes
app.use(require('./src/routes/index'));

app.listen(3001);
console.log('Server on port 3001');
