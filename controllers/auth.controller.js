const bcrypt = require("bcrypt");
const { usuario, rol, Sequelize } = require("../models");
const {
  GeneraToken,
  TiempoRestanteToken,
} = require("../services/jwttoken.service"); // Fixed typo in variable name

let self = {};

// POST: api/auth
self.login = async function (req, res, next) {
  const { email, password } = req.body;

  try {
    let data = await usuario.findOne({
      where: { email: email },
      raw: true,
      attributes: [
        "id",
        "email",
        "nombre",
        "passwordhash",
        [Sequelize.col("rol.nombre"), "rol"],
      ],
      include: { model: rol, attributes: [] },
    });

    if (data === null) {
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña incorrectos." });
    }

    // Se compara la contraseña vs el hash almacenado
    const passwordMatch = await bcrypt.compare(password, data.passwordhash); // Fixed case: passwordHash → passwordhash
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña incorrectos." });
    }

    // Generar token JWT
    const token = GeneraToken(data.email, data.nombre, data.rol); // Added const

    // Bitácora
    req.bitacora("usuario.login", data.email);

    return res.status(200).json({
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,
      jwt: token,
    });
  } catch (error) {
    next(error);
  }
};

// GET: api/auth/tiempo
self.tiempo = async function (req, res) {
  const tiempo = TiempoRestanteToken(req); // Fixed typo in function name
  if (tiempo == null) {
    return res.status(404).send();
  }
  return res.status(200).send(tiempo);
};

module.exports = self;
