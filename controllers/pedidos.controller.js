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

// GET: api/usuarios/:email/pedidos - Listar todos los pedidos del usuario (excepto carrito)
self.getPedidosUsuario = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const pedidosUsuario = await pedido.findAll({
      where: {
        usuarioid: user.id,
        esCarrito: false,
      },
      order: [["fecha", "DESC"]],
    });

    return res.status(200).json(pedidosUsuario);
  } catch (error) {
    next(error);
  }
};

// GET: api/usuarios/:email/pedidos/:pedidoid - Obtener un pedido específico del usuario
self.getPedidoUsuario = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const pedidoUsuario = await pedido.findOne({
      where: {
        id: req.params.pedidoid,
        usuarioid: user.id,
        esCarrito: false,
      },
    });

    if (!pedidoUsuario)
      return res.status(404).json({ error: "Pedido no encontrado" });
    return res.status(200).json(pedidoUsuario);
  } catch (error) {
    next(error);
  }
};

// GET: api/usuarios/:email/pedidos/:pedidoid/items - Listar los items de un pedido específico del usuario
self.getItemsPedidoUsuario = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const pedidoUsuario = await pedido.findOne({
      where: {
        id: req.params.pedidoid,
        usuarioid: user.id,
        esCarrito: false,
      },
    });

    if (!pedidoUsuario)
      return res.status(404).json({ error: "Pedido no encontrado" });

    const items = await itempedido.findAll({
      where: { pedidoid: pedidoUsuario.id },
      include: [{ model: producto }],
    });

    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// POST: api/usuarios/:email/pedidos - Crear un pedido directo (sin carrito)
self.createPedidoDirecto = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const user = await usuario.findOne({
      where: { email: req.params.email },
      transaction: t,
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // items debe venir en el body: [{productoid, cantidad, precioUnitario}]
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0)
      return res
        .status(400)
        .json({ error: "Debes enviar los items del pedido" });

    // Restar stock y calcular total
    let total = 0;
    for (const item of items) {
      const prod = await producto.findByPk(item.productoid, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!prod)
        throw new Error(`Producto con id ${item.productoid} no encontrado`);
      if (prod.stock < item.cantidad)
        throw new Error(`Stock insuficiente para el producto ${prod.titulo}`);
      prod.stock -= item.cantidad;
      await prod.save({ transaction: t });
      total += item.cantidad * item.precioUnitario;
    }

    const nuevoPedido = await pedido.create(
      {
        usuarioid: user.id,
        fecha: new Date(),
        estado: req.body.estado || "pendiente",
        total,
        direccionEnvio: req.body.direccionEnvio || "Sin dirección",
        metodoPago: req.body.metodoPago || "Sin método",
        esCarrito: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction: t }
    );

    // Crear los items del pedido
    for (const item of items) {
      await itempedido.create(
        {
          pedidoid: nuevoPedido.id,
          productoid: item.productoid,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.cantidad * item.precioUnitario,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json(nuevoPedido);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// DELETE: api/usuarios/:email/pedidos/:pedidoid - Cancelar un pedido del usuario
self.cancelarPedidoUsuario = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const pedidoUsuario = await pedido.findOne({
      where: {
        id: req.params.pedidoid,
        usuarioid: user.id,
        esCarrito: false,
      },
    });

    if (!pedidoUsuario)
      return res.status(404).json({ error: "Pedido no encontrado" });

    pedidoUsuario.estado = "cancelado";
    await pedidoUsuario.save();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = self;
