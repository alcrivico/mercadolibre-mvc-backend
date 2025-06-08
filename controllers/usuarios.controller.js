const { usuario, rol, Sequelize } = require("../models");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

let self = {};

// GET: api/usuarios
self.getAll = async function (req, res, next) {
  try {
    const data = await usuario.findAll({
      raw: true,
      attributes: [
        "id",
        "email",
        "nombre",
        [Sequelize.col("rol.nombre"), "rol"],
      ],
      include: {
        model: rol,
        attributes: [],
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// GET: api/usuarios/email
self.get = async function (req, res, next) {
  try {
    const email = req.params.email;
    const data = await usuario.findOne({
      where: { email: email },
      attributes: ["id", "email", "nombre"],
      include: {
        model: rol,
        attributes: ["nombre"],
      },
    });

    if (data) {
      // Devuelve el rol como string plano
      return res.status(200).json({
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol ? data.rol.nombre : null,
      });
    }

    return res.status(404).send();
  } catch (error) {
    next(error);
  }
};

// POST: api/usuarios
self.create = async function (req, res, next) {
  try {
    const rolusuario = await rol.findOne({
      where: { nombre: req.body.rol },
    });

    if (!rolusuario) {
      return res.status(400).send();
    }

    const data = await usuario.create({
      id: crypto.randomUUID(),
      email: req.body.email,
      passwordhash: await bcrypt.hash(req.body.password, 10),
      nombre: req.body.nombre,
      rolid: rolusuario.id, // Fixed: solid → rolid
    });

    // Bitácora
    req.bitacora("usuarios.crear", data.email);

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rolid: rolusuario.nombre, // Fixed: solid → rol
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }
    next(error);
  }
};

// PUT: api/usuarios/email
self.update = async function (req, res, next) {
  try {
    const email = req.params.email;

    // Find the role
    const rolUsuario = await rol.findOne({
      where: { nombre: req.body.itemToEdit.rol },
    });

    if (!rolUsuario) {
      return res.status(400).json({
        success: false,
        message: "Rol especificado no existe",
      });
    }

    req.body.itemToEdit.rolid = rolUsuario.id;

    const data = await usuario.update(req.body.itemToEdit, {
      where: { email: email },
    });

    if (data[0] === 0) {
      return res.status(404).send();
    }

    // Bitácora
    req.bitacora("usuarios.editar", email);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE: api/usuarios/email
self.delete = async function (req, res, next) {
  try {
    const email = req.params.email;
    const user = await usuario.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // No se pueden eliminar usuarios protegidos
    if (user.protegido) {
      return res.status(403).send();
    }

    const result = await usuario.destroy({
      where: { email: email },
    });

    if (result === 1) {
      // Bitácora
      req.bitacora("usuarios.eliminar", email);
      return res.status(204).send();
    }

    return res.status(500).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
