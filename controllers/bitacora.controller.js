const { bitacora } = require("../models");

let self = {};

// GET: api/bitacora
self.getAll = async function (req, res, next) {
  try {
    const data = await bitacora.findAll({
      attributes: [
        ["id", "bitacoraId"],
        "accion",
        "elementoid",
        "ip",
        "usuario",
        "fecha",
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los registros de bitácora",
    });
  }
};

module.exports = self;
