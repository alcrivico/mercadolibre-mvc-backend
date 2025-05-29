const router = require("express").Router();
const pedidos = require("../controllers/pedidos.controller");
const Authorize = require("../middlewares/auth.middleware");

// GET: api/pedidos - Listar todos los pedidos (Admin)
router.get("/", Authorize("Administrador"), pedidos.getAll);

// GET: api/pedidos/:id - Obtener un pedido por ID (Admin)
router.get("/:id", Authorize("Administrador"), pedidos.get);

// POST: api/pedidos - Crear un pedido o carrito (Admin y Usuario)
router.post("/", Authorize("Usuario,Administrador"), pedidos.create);

// PUT: api/pedidos/:id - Actualizar un pedido (Admin)
router.put("/:id", Authorize("Administrador"), pedidos.update);

// DELETE: api/pedidos/:id - Eliminar un pedido (Admin)
router.delete("/:id", Authorize("Administrador"), pedidos.delete);

module.exports = router;
