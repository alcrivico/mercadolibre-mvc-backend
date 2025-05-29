const { usuario, rol } = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

let self = {};

self.registrarUsuario = async function (req, res, next) {
  try {
    // Busca el rol "Usuario"
    const rolUsuario = await rol.findOne({ where: { nombre: "Usuario" } });
    if (!rolUsuario)
      return res.status(500).json({ error: "Rol Usuario no existe" });

    // Valida datos mínimos (puedes agregar más validaciones)
    if (!req.body.email || !req.body.password || !req.body.nombre) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Verifica si el email ya está registrado
    const existingUser = await usuario.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    //verificar si el email tiene un formato válido
    const emailRegex =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!emailRegex.test(req.body.email)) {
      return res
        .status(400)
        .json({ error: "El email no tiene un formato válido" });
    }

    // Verificar que la contraseña tenga al menos 8 caracteres, una mayúscula, una minúscula y un número

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
      });
    }

    // Crea el usuario con rol "Usuario" forzado
    const data = await usuario.create({
      id: crypto.randomUUID(),
      email: req.body.email,
      passwordhash: await bcrypt.hash(req.body.password, 10),
      nombre: req.body.nombre,
      rolid: rolUsuario.id,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rol: "Usuario",
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    next(error);
  }
};

module.exports = self;
