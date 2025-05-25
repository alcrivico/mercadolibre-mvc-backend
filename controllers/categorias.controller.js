const { categoria } = require("../models");
const { body, validationResult } = require("express-validator");

let self = {};

// Validator for categoria
self.categoriaValidator = [
  body("nombre")
    .not()
    .isEmpty()
    .withMessage("El campo {0} es obligatorio")
    .isString()
    .withMessage("El campo {0} debe ser texto"),
];

// GET: api/categories
self.getAll = async function (req, res, next) {
  try {
    let data = await categoria.findAll({
      attributes: [["id", "categoriaid"], "nombre", "protegida"],
    });

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// GET: api/categories/5
self.get = async function (req, res, next) {
  try {
    let id = req.params.id;
    let data = await categoria.findByPk(id, {
      attributes: [["id", "categoriaid"], "nombre", "protegida"],
    });
    if (data) return res.status(200).json(data);
    else return res.status(404).send();
  } catch (error) {
    next(error);
  }
};

// POST: api/categories
self.create = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(JSON.stringify(errors));
    }

    let data = await categoria.create({
      nombre: req.body.nombre,
    });
    req.bitacora("categoria.crear", data.id);
    return res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// PUT: api/categories/5
self.update = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(JSON.stringify(errors));
    }

    let id = req.params.id;
    let body = req.body;
    let data = await categoria.update(body, {
      where: { id: id },
    });

    if (data[0] === 0) return res.status(404).send();

    req.bitacora("categoria.editar", id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE: api/categories/5
self.delete = async function (req, res, next) {
  try {
    let id = req.params.id;
    let data = await categoria.findByPk(id);

    if (!data) return res.status(404).send();

    if (data.protegida) {
      return res.status(400).send();
    }

    data = await categoria.destroy({
      where: { id: id },
    });

    if (data === 1) {
      req.bitacora("categoria.eliminar", id);
      return res.status(204).send();
    }

    return res.status(404).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
