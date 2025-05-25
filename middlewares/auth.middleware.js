const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const ClaimTypes = require("../config/claimtypes");
const { GeneraToken } = require("../services/jwttoken.service"); // Fixed function name

const Authorize = (rol) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      const error = new Error("Acceso denegado");
      error.statusCode = 401;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(error);
      }

      // Obtiene el token de la solicitud
      const token = authHeader.split(" ")[1];
      // Verifica el token
      const decodedToken = jwt.verify(token, jwtSecret);

      // Verifica si el rol está autorizado
      if (rol.split(",").indexOf(decodedToken[ClaimTypes.Role]) === -1) {
        return next(error);
      }

      // Si tiene acceso, se permite continuar
      req.decodedToken = decodedToken;

      // Renovar token si quedan menos de 5 minutos
      const minutosRestantes =
        (decodedToken.exp - new Date().getTime() / 1000) / 60;
      if (minutosRestantes < 5) {
        const nuevoToken = GeneraToken(
          // Fixed function name
          decodedToken[ClaimTypes.Name],
          decodedToken[ClaimTypes.GivenName],
          decodedToken[ClaimTypes.Role]
        );
        res.header("Set-Authorization", nuevoToken);
      }

      // Continua con el método
      next();
    } catch (error) {
      error.statusCode = 401;
      next(error);
    }
  };
};

module.exports = Authorize;
