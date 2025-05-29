const { producto, categoria, Sequelize } = require("../models");
const { body, validationResult } = require("express-validator");
const Op = Sequelize.Op;

let self = {};

// Validator for producto
self.productoValidator = [
  body("titulo")
    .not()
    .isEmpty()
    .withMessage("El campo {0} es obligatorio")
    .isString()
    .withMessage("El campo {0} debe ser texto"),
  body("descripcion")
    .not()
    .isEmpty()
    .withMessage("El campo {0} es obligatorio")
    .isString()
    .withMessage("El campo {0} debe ser texto"),
  body("precio")
    .not()
    .isEmpty()
    .withMessage("El campo {0} es obligatorio")
    .isDecimal({ decimal_digits: "2" })
    .withMessage("El campo {0} debe ser un número decimal válido"),
];

// GET: api/products
self.getAll = async function (req, res, next) {
  try {
    // Recibe el parámetro de búsqueda
    const { s } = req.query;

    // Filtro para buscar
    const filters = {};
    if (s) {
      filters.titulo = {
        [Op.like]: `%${s}%`,
      };
    }

    let data = await producto.findAll({
      where: filters,
      attributes: [
        ["id", "productoId"],
        "titulo",
        "descripcion",
        "precio",
        "archivoid",
      ],
      include: {
        model: categoria,
        as: "categorias",
        attributes: [["id", "categoriaId"], "nombre", "protegida"],
        through: {
          attributes: [],
        },
      },
      subQuery: false,
    });

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// GET: api/products/5
self.get = async function (req, res, next) {
  try {
    let id = req.params.id;
    let data = await producto.findByPk(id, {
      attributes: [
        ["id", "productoId"],
        "titulo",
        "descripcion",
        "precio",
        "archivoid",
      ],
      include: {
        model: categoria,
        as: "categorias", // Changed from 'categories' to match association
        attributes: [["id", "categoriaId"], "nombre", "protegida"],
        through: {
          attributes: [],
        },
      },
    });

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
};

// POST: api/products
self.create = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(JSON.stringify(errors));
    }

    // validar que no pueda hacer poner un stock negativo o mayor a un valor máximo de la cantidad soportada por Number.MAX_SAFE_INTEGER
    if (
      req.body.stock !== undefined &&
      (req.body.stock < 0 || req.body.stock > Number.MAX_SAFE_INTEGER)
    ) {
      return res.status(400).json({
        error: `El stock debe ser un número entre 0 y ${Number.MAX_SAFE_INTEGER}.`,
      });
    }

    let data = await producto.create({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      stock: req.body.stock || 0,
      archivoid: req.body.archivoid || null,
    });
    req.bitacora("producto.crear", data.id);
    return res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// PUT: api/products/5
self.update = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let id = req.params.id;
    let body = req.body;

    // Validar archivoid si viene en el body
    if (body.archivoid !== undefined) {
      let archivoid = parseInt(body.archivoid, 10);
      if (isNaN(archivoid) || archivoid < 0) {
        return res.status(400).json({
          error: "El campo archivoid debe ser un número entero positivo.",
        });
      }
      body.archivoid = archivoid;
    }

    // Validar stock
    if (
      body.stock !== undefined &&
      (isNaN(body.stock) ||
        body.stock < 0 ||
        body.stock > Number.MAX_SAFE_INTEGER)
    ) {
      return res.status(400).json({
        error: `El stock debe ser un número entre 0 y ${Number.MAX_SAFE_INTEGER}.`,
      });
    }

    let data = await producto.update(body, {
      where: { id: id },
    });

    if (data[0] === 0) return res.status(404).send();

    req.bitacora("producto.editar", id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE: api/products/5
self.delete = async function (req, res, next) {
  try {
    let id = req.params.id;
    let data = await producto.findByPk(id);

    if (!data) return res.status(404).send();

    data = await producto.destroy({
      where: { id: id },
    });

    if (data === 1) {
      req.bitacora("producto.eliminar", id);
      return res.status(204).send();
    }

    return res.status(404).send();
  } catch (error) {
    next(error);
  }
};

// POST: api/products/5/categoria
self.asignaCategoria = async function (req, res, next) {
  try {
    let itemToAssign = await categoria.findByPk(req.body.categoriaId);
    if (!itemToAssign) return res.status(404).send();

    let item = await producto.findByPk(req.params.id);
    if (!item) return res.status(404).send();

    await item.addCategoria(itemToAssign);

    // Bitácora
    req.bitacora(
      "productocategoria.agregar",
      `${req.params.id}:${req.body.categoriaId}`
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE: api/products/5/categoria/1
self.eliminaCategoria = async function (req, res, next) {
  try {
    let itemToRemove = await categoria.findByPk(req.params.categoriaId);
    if (!itemToRemove) return res.status(404).send();

    let item = await producto.findByPk(req.params.id);
    if (!item) return res.status(404).send();

    await item.removeCategoria(itemToRemove);

    // Bitácora
    req.bitacora(
      "productocategoria.remover",
      `${req.params.id}:${req.params.categoriaId}`
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
