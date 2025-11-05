import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event);

  const config = useRuntimeConfig();

  try {
    // Verificar y decodificar el token JWT
    const decoded: any = jwt.verify(token as string, config.secretJwtKey);

    const userId = decoded.userId;

    // Actualizar el usuario en la base de datos para marcar el correo como verificado en la tabla account del provider "email"
    await prisma.account.updateMany({
      where: {
        userId: userId,
        provider: "email",
      },
      data: {
        emailVerified: true,
      },
    });

    return {};
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired token",
    });
  }
});
