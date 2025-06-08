const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

// Load environment variables first
dotenv.config();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:8081"],
  methods: "GET,PUT,POST,DELETE",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Swagger documentation
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Bitácora (logging) middleware
app.use(require("./middlewares/bitacora.middleware"));

// API routes
app.use("/api/categorias", require("./routes/categorias.routes"));
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/usuarios", require("./routes/usuarios.pedidos.routes"));
app.use("/api/usuarios", require("./routes/usuarios.carrito.routes"));
app.use("/api/roles", require("./routes/roles.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/archivos", require("./routes/archivos.routes"));
app.use("/api/bitacora", require("./routes/bitacora.routes"));
app.use("/api/pedidos", require("./routes/pedidos.routes"));
app.use("/api/registro", require("./routes/registro.routes"));

// Health check route
app.get("/*splat", (req, res) => {
  res.status(404).send("Recurso no encontrado");
});

// Error handling middleware (must be last)
const errorhandler = require("./middlewares/errorhandler.middleware");
app.use(errorhandler);

// Start server using JEST COnfig
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// Export the app for testing purposes
module.exports = app;