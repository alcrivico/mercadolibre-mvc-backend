const request = require("supertest");
const app = require("../index");
const { usuario, rol, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const { randomUUID } = require('crypto'); 

let token;

describe("📦 AUTH ROUTES", () => {
  const testUser = {
    email: "testuser@example.com",
    password: "Test123!",
    nombre: "Test User",
    rol: "Usuario",
  };

  beforeAll(async () => {
    const [userRole] = await rol.findOrCreate({
      where: { nombre: testUser.rol },
    });

    console.log("👉 userRole:", userRole?.toJSON());

try {
  await usuario.create({
    id:randomUUID(),
    email: testUser.email,
    nombre: testUser.nombre,
    passwordhash: await bcrypt.hash(testUser.password, 10),
    rolid: userRole.id // Asegúrate de incluir esto
  });
} catch (error) {
  console.error("Error al crear usuario:", error);
  throw error;
}
  });

  afterAll(async () => {
    await usuario.destroy({ where: { email: testUser.email } });
    await sequelize.close(); // 👈 IMPORTANTE: cerrar la conexión
  });

  describe("POST /api/auth", () => {
    it("✅ login válido", async () => {
      const res = await request(app).post("/api/auth").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("jwt");
      token = res.body.jwt;
    });

    it("❌ login inválido", async () => {
      const res = await request(app).post("/api/auth").send({
        email: testUser.email,
        password: "incorrecto",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/auth/tiempo", () => {
    it("✅ con token válido y tiempo exacto", async () => {
      const res = await request(app)
        .get("/api/auth/tiempo")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("❌ sin token", async () => {
      const res = await request(app).get("/api/auth/tiempo");
      expect(res.statusCode).toBe(401);
    });
  });
});
