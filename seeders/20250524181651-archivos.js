"use strict";
const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];

    const now = new Date();

    const archivos = files
      .filter((file) => fs.statSync(path.join(uploadsDir, file)).isFile())
      .sort((a, b) => a.localeCompare(b)) // Ordena alfabéticamente por nombre
      .map((file) => {
        const filePath = path.join(uploadsDir, file);
        const mime =
          require("mime-types").lookup(filePath) || "application/octet-stream";
        const size = fs.statSync(filePath).size;

        return {
          mime,
          nombre: file,
          size,
          indb: false,
          datos: null,
          createdAt: now,
          updatedAt: now,
        };
      });

    if (archivos.length > 0) {
      await queryInterface.bulkInsert("archivo", archivos);
    }
  },

  async down(queryInterface, Sequelize) {
    // Elimina solo los archivos insertados por esta seed
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    if (files.length > 0) {
      await queryInterface.bulkDelete("archivo", {
        nombre: files,
      });
    }
  },
};
