const ClaimTypes = require("../config/claimtypes");

const AuthorizeSelfOrAdmin = (req, res, next) => {
  const userEmail = req.decodedToken[ClaimTypes.Name];
  const userRole = req.decodedToken[ClaimTypes.Role];
  const paramEmail = req.params.email;

  if (userRole === "Administrador" || userEmail === paramEmail) {
    return next();
  }

  return res.status(403).json({ error: "Acceso denegado" });
};

module.exports = AuthorizeSelfOrAdmin;
