const router = require("express").Router();
const registro = require("../controllers/registro.controller");

// POST: api/registro - Registro público de usuario
router.post("/", registro.registrarUsuario);

module.exports = router;
