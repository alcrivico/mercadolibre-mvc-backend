const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const Authorize = require("../middlewares/auth.middleware");

// POST: api/auth - User login (Public)
router.post("/", auth.login);

// GET: api/auth/tiempo - Check token remaining time (Authenticated users)
router.get(
  "/tiempo",
  Authorize("Usuario,Administrador"), // Requires valid token
  auth.tiempo
);

module.exports = router;
