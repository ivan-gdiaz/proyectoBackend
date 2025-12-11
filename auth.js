const { OAuth2Client } = require('google-auth-library');

require('dotenv').config();

// Asegúrate de usar el MISMO clientID que usas en el frontend
const client = new OAuth2Client(process.env.GOOGLE_CLIENTID);

const verifyGoogleToken = async (req, res, next) => {
    // 1. Obtener el token del header Authorization
    // El formato esperado es: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token después de "Bearer"

    try {
        // 2. Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENTID, 
        });

        const payload = ticket.getPayload();
        
        // 3. (Opcional) Guardar datos del usuario en la request para usarlos luego
        req.user = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
        };

        next(); // Continuar a la siguiente función/ruta
    } catch (error) {
        console.error("Error verificando token:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};

module.exports = verifyGoogleToken;