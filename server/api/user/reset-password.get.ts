import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);

  const config = useRuntimeConfig();

  try {
    // Verificar y decodificar el token JWT
    jwt.verify(token as string, config.secretJwtKey);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired token",
    });
  }
});
