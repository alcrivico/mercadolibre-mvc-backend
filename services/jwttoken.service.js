const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const ClaimTypes = require("../config/claimtypes");

const GeneraToken = (email, nombre, rol) => {
  // Utilizamos los nombres de Claims estandar
  const token = jwt.sign(
    {
      [ClaimTypes.Name]: email,
      [ClaimTypes.GivenName]: nombre,
      [ClaimTypes.Role]: rol,
      iss: "ServidorFeiJMT",
      aud: "ClientesFeiJMT",
    },
    jwtSecret,
    {
      expiresIn: "20m", // 20 minutos
    }
  );
  return token;
};

const TiempoRestanteToken = (req) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return null;

    // Obtiene el token de la solicitud
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    // Verifica el token
    const decodedToken = jwt.verify(token, jwtSecret);

    // Calcula el tiempo restante
    const time = decodedToken.exp - new Date().getTime() / 1000;
    const minutos = Math.floor(time / 60);
    const segundos = Math.floor(time - minutos * 60);

    return (
      "00:" +
      minutos.toString().padStart(2, "0") +
      ":" +
      segundos.toString().padStart(2, "0")
    );
  } catch (error) {
    return null;
  }
};

module.exports = { GeneraToken, TiempoRestanteToken };
