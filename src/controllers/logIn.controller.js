const JWT_SECRETO = require("../config/jwt");
const jwt = require("jsonwebtoken");
const mysql = require("../config/database").mysql_pool;

const authSocketToken = async (req, res) => {
  try {
    var username = req.body.user;
    var password = req.body.password;

    var auth = false;

    // pool.query toma y devuelve la conexion al pool (con getConnection() nunca se devolvia).
    mysql.query(
        'SELECT * FROM company_user cu, usuarios u WHERE u.email = ? AND u.pass = ? AND cu.user_id = u.id AND cu.activo = 1',
        [username, password],
        function (err, result, fields) {
          if (err) {
            res.status(401).send({
              error: "usuario o contraseña inválidos",
            });
            return;
          }
          if (result.length > 0) {
            const dataEmpresas = new Array();

            console.log(result[0].id);
              // empresas tambien tiene una columna company_id (vale 0 en todas) y con SELECT * pisaba
              // la de company_user: la APK recibia company_id = 0, pedia /empresa con bsnid=0 y se
              // quedaba "verificando estado de la empresa". El alias al final deja el id real.
              mysql.query('SELECT *, cu.company_id AS company_id FROM company_user cu INNER JOIN empresas e ON cu.company_id = e.id WHERE cu.user_id = ?',[result[0].id],function (err, business, fields) {
                if (err) {
                  console.error('[login]', err.code || err);
                  res.status(500).send({ status: false, error: "No se pudo consultar las empresas del usuario" });
                  return;
                }
                dataEmpresas.push(business);
                  auth = true;
                  var tokenData = {
                    username: username,
                    // ANY DATA
                  };

                  var token = jwt.sign(tokenData, JWT_SECRETO, {
                    expiresIn: (60 * 60 * 24)*30, // expires in 24 hours
                  });

                  res.send({
                    status: true,
                    token: token,
                    data: result,
                    dataEmpresas: dataEmpresas[0],
                    error: false,
                  });
                  return;
                }
              );
          } else {
            res.status(401).send({
              error: "usuario o contraseña inválidos",
            });
            return;
          }
        }
    );
  } catch (e) {
    res.status(200).json({ status: false, error: e });
  }
};

const checkAuthStates = async (req, res) => {
  var token = req.body['accessToken'];
  if(!token){
    res.status(401).send({
      error: "Es necesario el token de autenticación"
    })
    return
  }
  token = token.replace('Bearer ', '')
  jwt.verify(token, JWT_SECRETO, function(err, user) {
    if (err) {
      res.status(401).send({data:{
        message: "Usuario inválido"
      },status:false})
    } else {
      res.status(200).json({data:{
        message: "Usuario válido"
      },status:true});
    }
  })
};

module.exports = {
  authSocketToken,
  checkAuthStates
};
