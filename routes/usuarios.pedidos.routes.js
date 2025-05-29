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

// GET: api/usuarios/:email/pedidos/:pedidoid/items - Listar los items de un pedido específico del usuario
router.get(
  "/:email/pedidos/:pedidoid/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.getItemsPedidoUsuario
);

// POST: api/usuarios/:email/pedidos - Crear un pedido directo (sin carrito)
router.post(
  "/:email/pedidos",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  pedidos.createPedidoDirecto
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

module.exports = router;
