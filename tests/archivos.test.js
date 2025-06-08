const request = require("supertest");
const path = require("path");
const app = require("../index");
const { archivo, rol, usuario } = require("../models");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

let token;
let uploadedId; // Mover fuera del scope del test para usarlo en afterAll

const testUser = {
  email: "admin@example.com",
  password: "Admin123!",
  nombre: "Admin User",
  rol: "Administrador",
};

describe("📁 ARCHIVOS ROUTES", () => {
  beforeAll(async () => {
    const [adminRole] = await rol.findOrCreate({ where: { nombre: testUser.rol } });

    await usuario.create({
      id: randomUUID(),
      email: testUser.email,
      nombre: testUser.nombre,
      passwordhash: await bcrypt.hash(testUser.password, 10),
      rolid: adminRole.id,
    });

    const loginRes = await request(app).post("/api/auth").send({
      email: testUser.email,
      password: testUser.password,
    });

    token = loginRes.body.jwt;
  });

  afterAll(async () => {
    await usuario.destroy({ where: { email: testUser.email } });

    if (uploadedId) {
      await archivo.destroy({ where: { id: uploadedId } });
    }
  });

it("✅ POST /api/archivos - subir archivo", async () => {
  const res = await request(app)
    .post("/api/archivos")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", path.join(__dirname, "fixtures", "sample.pdf"));

  console.log("Upload response:", res.statusCode, res.body); // 👈 importante

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("id");
  uploadedId = res.body.id;
});

  it("✅ GET /api/archivos - obtener lista", async () => {
    const res = await request(app)
      .get("/api/archivos")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("✅ GET /api/archivos/:id/detalle - metadata", async () => {
    const res = await request(app)
      .get(`/api/archivos/${uploadedId}/detalle`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("✅ GET /api/archivos/:id - descargar archivo", async () => {
    const res = await request(app)
      .get(`/api/archivos/${uploadedId}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/pdf/);
  });

  it("✅ DELETE /api/archivos/:id - eliminar archivo", async () => {
    const res = await request(app)
      .delete(`/api/archivos/${uploadedId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
