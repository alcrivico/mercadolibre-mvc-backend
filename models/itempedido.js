"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class itempedido extends Model {
    static associate(models) {
      itempedido.belongsTo(models.pedido, {
        foreignKey: "pedidoid",
      });
      itempedido.belongsTo(models.producto, {
        foreignKey: "productoid",
      });
    }
  }

  itempedido.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pedidoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "itempedido",
    }
  );

  return itempedido;
};
