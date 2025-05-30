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
  try {
    const user = await usuario.findOne({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let carrito = await pedido.findOne({
      where: { usuarioid: user.id, esCarrito: true },
    });

    console.log("Carrito encontrado:", carrito);

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

    // Verifica si el producto ya está en el carrito
    let item = await itempedido.findOne({
      where: {
        productoid: req.body.productoid,
      },
      include: [{ model: producto }],
    });
    console.log("Item encontrado:", item);

    const productoExistente = await producto.findByPk(req.body.productoid);

    if (!productoExistente) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verifica si el stock es suficiente
    if (productoExistente.stock < req.body.cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    if (item) {
      console.log("Item ya existe en el carrito:", item);

      if (!(item.cantidad + req.body.cantidad <= productoExistente.stock)) {
        return res
          .status(400)
          .json({ error: "Stock insuficiente para el item" });
      }
      item.cantidad += req.body.cantidad || 1;
      item.subtotal =
        item.cantidad * (req.body.precioUnitario || item.precioUnitario);
      await item.save();
    } else {
      console.log("Creando nuevo item en el carrito");
      // Si no existe, lo crea
      item = await itempedido.create({
        pedidoid: carrito.id,
        productoid: req.body.productoid,
        cantidad: req.body.cantidad || 1,
        precioUnitario: req.body.precioUnitario,
        subtotal: (req.body.cantidad || 1) * req.body.precioUnitario,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.status(201).json(item);
  } catch (error) {
    debug.write("Error al agregar item al carrito:", error);
    next(error);
  }
};

// PUT: api/usuarios/:email/carrito/items/:itemid - Modificar cantidad de un item en el carrito
self.modificarItemCarrito = async function (req, res, next) {
  try {
    let item = await itempedido.findOne({
      where: {
        pedidoid: req.params.itemid,
      },
      include: [{ model: producto }],
    });

    if (!item) return res.status(404).json({ error: "Item no encontrado" });

    if (item.producto && item.producto.stock < (req.body.cantidad || 1)) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    if (req.body.cantidad !== undefined) {
      item.cantidad = req.body.cantidad;
      item.subtotal = item.cantidad * item.precioUnitario;
      await item.save();
    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// DELETE: api/usuarios/:email/carrito/items/:itemid - Eliminar un item del carrito
self.eliminarItemCarrito = async function (req, res, next) {
  try {
    const item = await itempedido.findByPk(req.params.itemid);
    if (!item) return res.status(404).json({ error: "Item no encontrado" });

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
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
    next(error);
  }
};

module.exports = self;
