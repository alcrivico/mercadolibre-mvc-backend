const { rol } = require("../models");

let self = {};

// GET: api/roles
self.getAll = async function (req, res) {
  try {
    let data = await rol.findAll({
      attributes: ["id", "nombre"],
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los roles",
    });
  }
};

module.exports = self;
