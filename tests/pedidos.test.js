const request = require("supertest");
const app = require("../index");
const db = require("../models");
const jwt = require("jsonwebtoken");

// Simulación de tokens
const adminToken = jwt.sign({ rol: "Administrador", id: 1 }, process.env.JWT_SECRET);
const userToken = jwt.sign({ rol: "Usuario", id: 2 }, process.env.JWT_SECRET);

// Simular un email de usuario existente en la BD
const testEmail = "usuario_test@correo.com";

let createdPedidoId;

beforeAll(async () => {
  // Asegurar que el usuario existe
  await db.usuario.findOrCreate({
    where: { email: testEmail },
    defaults: {
      nombre: "Test User",
      password: "123456",
      rol: "Usuario",
    },
  });
});

afterAll(async () => {
  if (createdPedidoId) {
    await db.pedido.destroy({ where: { id: createdPedidoId } });
  }
  await db.sequelize.close();
});

// describe("📦 PEDIDOS ROUTES", () => {
//   it("✅ POST /api/pedidos - Crear pedido (Usuario)", async () => {
//     const res = await request(app)
//       .post("/api/pedidos")
//       .set("Authorization", `Bearer ${userToken}`)
//       .send({
//         email: testEmail,
//         estado: "pendiente",
//         total: 200,
//         direccionEnvio: "Av. Siempre Viva 742",
//         metodoPago: "Tarjeta",
//       });

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.data).toHaveProperty("id");
//     expect(res.body.data).toHaveProperty("estado", "pendiente");

//     createdPedidoId = res.body.data.id;
//   });

//   it("✅ GET /api/pedidos - Listar pedidos (Admin)", async () => {
//     const res = await request(app)
//       .get("/api/pedidos")
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   it("✅ GET /api/pedidos/:id - Obtener pedido por ID (Admin)", async () => {
//     const res = await request(app)
//       .get(`/api/pedidos/${createdPedidoId}`)
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty("id", createdPedidoId);
//   });

//   it("✅ PUT /api/pedidos/:id - Actualizar estado (Admin)", async () => {
//     const res = await request(app)
//       .put(`/api/pedidos/${createdPedidoId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ estado: "enviado" });

//     expect(res.statusCode).toBe(204);
//   });

//   it("❌ PUT /api/pedidos/:id - Estado inválido (Admin)", async () => {
//     const res = await request(app)
//       .put(`/api/pedidos/${createdPedidoId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ estado: "no_valido" });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toMatch(/estado debe ser uno de los siguientes/i);
//   });

//   it("❌ PUT /api/pedidos/:id - Intentar actualizar a carrito (Admin)", async () => {
//     const res = await request(app)
//       .put(`/api/pedidos/${createdPedidoId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ estado: "pendiente", esCarrito: true });

//     expect(res.statusCode).toBe(400);
//     expect(res.body.error).toMatch(/no se puede actualizar un pedido a carrito/i);
//   });

//   it("✅ DELETE /api/pedidos/:id - Eliminar pedido (Admin)", async () => {
//     const res = await request(app)
//       .delete(`/api/pedidos/${createdPedidoId}`)
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(204);
//   });

//   it("❌ DELETE /api/pedidos/:id - Pedido no encontrado", async () => {
//     const res = await request(app)
//       .delete(`/api/pedidos/999999`)
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(404);
//   });
// });

