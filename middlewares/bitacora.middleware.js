const requestIP = require("request-ip");
const ClaimTypes = require("../config/claimtypes");
const { bitacora } = require("../models");

const bitacoralogger = (req, res, next) => {
  // Obtiene la IP de la petición
  const ip = requestIP.getClientIp(req);
  let email = "invitado";

  req.bitacora = async (accion, id) => {
    if (req.decodedToken) {
      // Obtiene el email de usuario
      email = req.decodedToken[ClaimTypes.Name];
    }

    // Guarda la operación en la bitácora
    try {
      await bitacora.create({
        accion: accion,
        elementoid: id,
        ip: ip,
        usuario: email,
        fecha: new Date(),
      });
    } catch (error) {
      console.error("Error al registrar en bitácora:", error);
    }
  };

  next();
};

module.exports = bitacoralogger;
