const router = require("express").Router();
const carrito = require("../controllers/carrito.controller");
const Authorize = require("../middlewares/auth.middleware");
const AuthorizeSelfOrAdmin = require("../middlewares/authorizeselforadmin.middleware");

// GET: api/usuarios/:email/carrito - Obtener el carrito del usuario
router.get(
  "/:email/carrito",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.getCarritoUsuario
);

// GET: api/usuarios/:email/carrito/items - Listar items del carrito del usuario
router.get(
  "/:email/carrito/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.getItemsCarrito
);

// POST: api/usuarios/:email/carrito/items - Agregar un item al carrito
router.post(
  "/:email/carrito/items",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.agregarItemCarrito
);

// PUT: api/usuarios/:email/carrito/items/:itemid - Modificar cantidad de un item en el carrito
router.put(
  "/:email/carrito/items/:itemid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.modificarItemCarrito
);

// DELETE: api/usuarios/:email/carrito/items/:itemid - Eliminar un item del carrito
router.delete(
  "/:email/carrito/items/:itemid",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.eliminarItemCarrito
);

// POST: api/usuarios/:email/carrito/confirmar - Confirmar carrito como pedido
router.post(
  "/:email/carrito/confirmar",
  Authorize("Usuario,Administrador"),
  AuthorizeSelfOrAdmin,
  carrito.confirmarCarrito
);
