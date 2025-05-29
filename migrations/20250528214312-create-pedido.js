"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pedido", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      usuarioid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM(
          "pendiente",
          "procesando",
          "enviado",
          "entregado",
          "cancelado",
          "carrito"
        ),
        allowNull: false,
        defaultValue: "pendiente",
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      direccionEnvio: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      metodoPago: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      esCarrito: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint("pedido", {
      fields: ["usuarioid"],
      type: "unique",
      name: "unico_carrito_por_usuario",
      where: {
        esCarrito: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pedido");
  },
};
