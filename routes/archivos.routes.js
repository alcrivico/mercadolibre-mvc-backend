const router = require("express").Router();
const archivos = require("../controllers/archivos.controller");
const Authorize = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// GET: api/archivos - List all files (Admin only)
router.get("/", Authorize("Administrador"), archivos.getAll);

// GET: api/archivos/5 - Download file (Public access)
router.get("/:id", archivos.get);

// GET: api/archivos/5/detalle - Get file metadata (Admin only)
router.get("/:id/detalle", Authorize("Administrador"), archivos.getDetalle);

// POST: api/archivos - Upload new file (Admin only)
router.post(
  "/",
  upload.single("file"),
  Authorize("Administrador"),
  archivos.create
);

// PUT: api/archivos/5 - Update file (Admin only)
router.put(
  "/:id",
  upload.single("file"),
  Authorize("Administrador"),
  archivos.update
);

// DELETE: api/archivos/5 - Delete file (Admin only)
router.delete("/:id", Authorize("Administrador"), archivos.delete);

module.exports = router;
