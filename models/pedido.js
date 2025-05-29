"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class pedido extends Model {
    static associate(models) {
      pedido.belongsTo(models.usuario, {
        foreignKey: "usuarioid",
      });
    }
  }

  pedido.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM(
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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      direccionEnvio: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      metodoPago: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      esCarrito: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "pedido",
    }
  );

  return pedido;
};
