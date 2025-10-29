import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event);

  const config = useRuntimeConfig();

  try {
    // Verificar y decodificar el token JWT
    const decoded: any = jwt.verify(token as string, config.secretJwtKey);

    const userId = decoded.userId;

    // Actualizar el usuario en la base de datos para marcar el correo como verificado
    await prisma.user.update({
      where: { id: userId },
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
