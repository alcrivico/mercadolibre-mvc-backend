const { pedido, usuario, Sequelize } = require("../models");

let self = {};

// GET: api/pedidos
self.getAll = async function (req, res, next) {
  try {
    const data = await pedido.findAll({
      include: {
        model: usuario,
        attributes: ["id", "email", "nombre"],
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// GET: api/pedidos/:id
self.get = async function (req, res, next) {
  try {
    const data = await pedido.findByPk(req.params.id, {
      include: {
        model: usuario,
        attributes: ["id", "email", "nombre"],
      },
    });
    if (!data) return res.status(404).send();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// POST: api/pedidos (puede crear carrito o pedido normal)
self.create = async function (req, res, next) {
  try {
    // Si quieres que este endpoint solo cree carritos, fuerza los valores aquí:
    const isCarrito =
      req.body.esCarrito === true || req.body.estado === "carrito";

    const usuarioid = await usuario.findOne({
      where: { email: req.body.email },
    });

    if (!usuarioid) {
      return res.status(404).send();
    }

    const data = await pedido.create({
      usuarioid: usuarioid.id,
      fecha: new Date(),
      estado: isCarrito ? "carrito" : req.body.estado || "pendiente",
      total: req.body.total || 0,
      direccionEnvio: req.body.direccionEnvio || "Sin dirección",
      metodoPago: req.body.metodoPago || "Sin método",
      esCarrito: isCarrito,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// PUT: api/pedidos/:id
self.update = async function (req, res, next) {
  try {
    if (!req.body.estado) {
      return res.status(400).json({ error: "El estado es obligatorio" });
    }

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = [
      "pendiente",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!estadosPermitidos.includes(req.body.estado)) {
      return res.status(400).json({
        error: `El estado debe ser uno de los siguientes: ${estadosPermitidos.join(
          ", "
        )}`,
      });
    }

    if (req.body.esCarrito === true) {
      return res.status(400).json({
        error: "No se puede actualizar un pedido a carrito una vez creado.",
      });
    }

    req.body.updatedAt = new Date();
    req.body.fecha = new Date();

    const [updated] = await pedido.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated === 0) return res.status(404).send();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// DELETE: api/pedidos/:id
self.delete = async function (req, res, next) {
  try {
    const pedidoExistente = await pedido.findByPk(req.params.id);
    if (!pedidoExistente) {
      return res.status(404).send();
    }

    if (pedidoExistente.esCarrito) {
      return res.status(400).json({
        error: "No se puede eliminar un carrito, solo pedidos.",
      });
    }

    const deleted = await pedido.destroy({
      where: { id: req.params.id },
    });

    if (deleted === 0) return res.status(404).send();
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
