"use strict";
const bcrypt = require("bcrypt");
const crypto = require("crypto");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const AdminRolUUID = crypto.randomUUID();
    const UsuarioRolUUID = crypto.randomUUID();

    await queryInterface.bulkInsert("rol", [
      {
        id: AdminRolUUID,
        nombre: "Administrador",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: UsuarioRolUUID,
        nombre: "Usuario",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const patitoUUID = crypto.randomUUID();

    await queryInterface.bulkInsert("usuario", [
      {
        id: crypto.randomUUID(),
        email: "gvera@uv.mx",
        passwordhash: await bcrypt.hash("patito", 10),
        nombre: "Guillermo Vera",
        rolid: AdminRolUUID,
        protegido: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: patitoUUID,
        email: "patito@uv.mx",
        passwordhash: await bcrypt.hash("patito", 10),
        nombre: "Usuario patito",
        rolid: UsuarioRolUUID,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("pedido", [
      {
        usuarioid: patitoUUID,
        fecha: new Date(),
        estado: "carrito",
        total: 0,
        direccionEnvio: "Sin dirección",
        metodoPago: "Sin método",
        esCarrito: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("pedido", null, {});
    await queryInterface.bulkDelete("usuario", null, {});
    await queryInterface.bulkDelete("rol", null, {});
  },
};
