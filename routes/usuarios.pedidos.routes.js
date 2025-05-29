const router = require("express").Router();
const pedidos = require("../controllers/pedidos.controller");
const Authorize = require("../middlewares/auth.middleware");
const AuthorizeSelfOrAdmin = require("../middlewares/authorizeselforadmin.middleware");

// GET: api/usuarios/:email/pedidos - Listar todos los pedidos del usuario (excepto carrito)
router.get(
  "/:email/pedidos",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getPedidosUsuario
);

// GET: api/usuarios/:email/pedidos/:pedidoid - Obtener un pedido específico del usuario
router.get(
  "/:email/pedidos/:pedidoid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getPedidoUsuario
);

// POST: api/usuarios/:email/pedidos - Crear un pedido directo (sin carrito)
router.post(
  "/:email/pedidos",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.crearPedidoDirecto
);

// DELETE: api/usuarios/:email/pedidos/:pedidoid - Cancelar un pedido del usuario
router.delete(
  "/:email/pedidos/:pedidoid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.cancelarPedidoUsuario
);

// GET: api/usuarios/:email/pedidos/:pedidoid/items - Listar los items de un pedido específico del usuario
router.get(
  "/:email/pedidos/:pedidoid/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getItemsPedidoUsuario
);

// GET: api/usuarios/:email/carrito - Obtener el carrito del usuario
router.get(
  "/:email/carrito",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getCarritoUsuario
);

// GET: api/usuarios/:email/carrito/items - Listar items del carrito del usuario
router.get(
  "/:email/carrito/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getItemsCarritoUsuario
);

// POST: api/usuarios/:email/carrito/items - Agregar un item al carrito
router.post(
  "/:email/carrito/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.agregarItemCarrito
);

// PUT: api/usuarios/:email/carrito/items/:itemid - Modificar cantidad de un item en el carrito
router.put(
  "/:email/carrito/items/:itemid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.modificarItemCarrito
);

// DELETE: api/usuarios/:email/carrito/items/:itemid - Eliminar un item del carrito
router.delete(
  "/:email/carrito/items/:itemid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.eliminarItemCarrito
);

// POST: api/usuarios/:email/carrito/confirmar - Confirmar carrito como pedido
router.post(
  "/:email/carrito/confirmar",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.confirmarCarrito
);

module.exports = router;
