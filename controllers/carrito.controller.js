const { pedido, usuario, itempedido, producto } = require("../models");

let self = {};

// GET: api/usuarios/:email/carrito - Obtener el carrito del usuario
self.getCarritoUsuario = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let carrito = await pedido.findOne({
      where: { usuarioid: user.id, esCarrito: true },
      include: [
        {
          model: itempedido,
          include: [{ model: producto }],
        },
      ],
    });

    // Si no existe, lo crea vacío
    if (!carrito) {
      carrito = await pedido.create({
        usuarioid: user.id,
        fecha: new Date(),
        estado: "carrito",
        total: 0,
        direccionEnvio: "Sin dirección",
        metodoPago: "Sin método",
        esCarrito: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.status(200).json(carrito);
  } catch (error) {
    next(error);
  }
};

// GET: api/usuarios/:email/carrito/items - Listar items del carrito
self.getItemsCarrito = async function (req, res, next) {
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const carrito = await pedido.findOne({
      where: { usuarioid: user.id, esCarrito: true },
    });

    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const items = await itempedido.findAll({
      where: { pedidoid: carrito.id },
      include: [{ model: producto }],
    });

    const itemsPlano = items.map((item) => ({
      id: item.id,
      pedidoId: item.pedidoid,
      productoId: item.productoid,
      cantidad: item.cantidad,
      stock: item.producto?.stock,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      titulo: item.producto?.titulo,
      descripcion: item.producto?.descripcion,
      archivoId: item.producto?.archivoid,
    }));

    return res.status(200).json(itemsPlano);
  } catch (error) {
    next(error);
  }
};

// POST: api/usuarios/:email/carrito/items - Agregar un item al carrito
self.agregarItemCarrito = async function (req, res, next) {
  const t = await require("../models").sequelize.transaction();
  try {
    const user = await usuario.findOne({
      where: { email: req.params.email },
      transaction: t,
    });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let carrito = await pedido.findOne({
      where: { usuarioid: user.id, esCarrito: true },
      transaction: t,
    });

    console.log("Carrito encontrado:", carrito);

    if (!carrito) {
      carrito = await pedido.create(
        {
          usuarioid: user.id,
          fecha: new Date(),
          estado: "carrito",
          total: 0,
          direccionEnvio: "Sin dirección",
          metodoPago: "Sin método",
          esCarrito: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction: t }
      );
    }

    // Verifica si el producto ya está en el carrito
    let item = await itempedido.findOne({
      where: {
        productoid: req.body.productoid,
      },
      include: [{ model: producto }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    console.log("Item encontrado:", item);

    const productoExistente = await producto.findByPk(req.body.productoid, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!productoExistente) {
      await t.rollback();
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verifica si el stock es suficiente
    if (productoExistente.stock < req.body.cantidad) {
      await t.rollback();
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    if (item) {
      console.log("Item ya existe en el carrito:", item);

      if (!(item.cantidad + req.body.cantidad <= productoExistente.stock)) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Stock insuficiente para el item" });
      }
      item.cantidad += req.body.cantidad || 1;
      item.subtotal =
        item.cantidad * (req.body.precioUnitario || item.precioUnitario);
      await item.save({ transaction: t });
    } else {
      console.log("Creando nuevo item en el carrito");
      // Si no existe, lo crea
      item = await itempedido.create(
        {
          pedidoid: carrito.id,
          productoid: req.body.productoid,
          cantidad: req.body.cantidad || 1,
          precioUnitario: req.body.precioUnitario,
          subtotal: (req.body.cantidad || 1) * req.body.precioUnitario,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction: t }
      );
    }

    // Actualiza el total del carrito
    const itemsActuales = await itempedido.findAll({
      where: { pedidoid: carrito.id },
      transaction: t,
    });
    carrito.total = itemsActuales.reduce((sum, it) => sum + it.subtotal, 0);
    await carrito.save({ transaction: t });

    await t.commit();
    return res.status(201).json(item);
  } catch (error) {
    await t.rollback();
    debug.write("Error al agregar item al carrito:", error);
    next(error);
  }
};

// PUT: api/usuarios/:email/carrito/items/:itemid - Modificar cantidad de un item en el carrito
self.modificarItemCarrito = async function (req, res, next) {
  const t = await require("../models").sequelize.transaction();
  try {
    // Buscar el item por su id
    let item = await itempedido.findByPk(req.params.itemid, {
      include: [{ model: producto }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!item) {
      await t.rollback();
      return res.status(404).json({ error: "Item no encontrado" });
    }

    // Buscar el carrito
    const carrito = await pedido.findByPk(item.pedidoid, { transaction: t });
    if (!carrito) {
      await t.rollback();
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Buscar el producto y ajustar stock
    const prod = await producto.findByPk(item.productoid, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!prod) {
      await t.rollback();
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Calcular diferencia de cantidad
    const nuevaCantidad = req.body.cantidad;
    const diferencia = nuevaCantidad - item.cantidad;

    // Validar stock suficiente si se aumenta la cantidad
    if (diferencia > 0 && prod.stock < diferencia) {
      await t.rollback();
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    // Actualizar item
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precioUnitario;
    await item.save({ transaction: t });

    // Actualizar total del carrito
    const itemsActuales = await itempedido.findAll({
      where: { pedidoid: carrito.id },
      transaction: t,
    });
    carrito.total = itemsActuales.reduce((sum, it) => sum + it.subtotal, 0);
    await carrito.save({ transaction: t });

    await t.commit();
    return res.status(200).json(item);
  } catch (error) {
    if (t) await t.rollback();
    next(error);
  }
};

// DELETE: api/usuarios/:email/carrito/items/:itemid - Eliminar un item del carrito
self.eliminarItemCarrito = async function (req, res, next) {
  const t = await require("../models").sequelize.transaction();
  try {
    const item = await itempedido.findByPk(req.params.itemid, {
      transaction: t,
    });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ error: "Item no encontrado" });
    }

    // Busca el carrito al que pertenece el item
    const carrito = await pedido.findByPk(item.pedidoid, { transaction: t });
    if (!carrito) {
      await t.rollback();
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Guarda el subtotal antes de eliminar
    const subtotalEliminado = item.subtotal;

    // Elimina el item
    await item.destroy({ transaction: t });

    // Resta el subtotal al total del carrito y guarda
    carrito.total = Math.max(0, carrito.total - subtotalEliminado);
    await carrito.save({ transaction: t });

    await t.commit();
    return res.status(204).send();
  } catch (error) {
    if (t) await t.rollback();
    next(error);
  }
};

// POST: api/usuarios/:email/carrito/confirmar - Confirmar carrito como pedido
self.confirmarCarrito = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const user = await usuario.findOne({
      where: { email: req.params.email },
      transaction: t,
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const carrito = await pedido.findOne({
      where: { usuarioid: user.id, esCarrito: true },
      include: [{ model: itempedido }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    if (!carrito.itempedidos || carrito.itempedidos.length === 0)
      return res.status(400).json({ error: "El carrito está vacío" });

    // Restar stock de cada producto
    for (const item of carrito.itempedidos) {
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
    }

    // Actualiza el estado y total
    carrito.estado = "pendiente";
    carrito.esCarrito = false;
    carrito.total = carrito.itempedidos.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    carrito.fecha = new Date();
    await carrito.save({ transaction: t });

    await t.commit();
    return res.status(200).json(carrito);
  } catch (error) {
    await t.rollback();
    console.error("ERROR EN PEDIDO:", error);
    next(error);
  }
};

module.exports = self;
