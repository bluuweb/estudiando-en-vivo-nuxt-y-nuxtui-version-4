import jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { token, newPassword } = await readBody(event);

  const config = useRuntimeConfig();

  try {
    // Verificar y decodificar el token JWT
    const decoded: any = jwt.verify(token as string, config.secretJwtKey);

    const userId = decoded.userId;

    // Validar la newPassword con Zod
    const { changePasswordSchema } = await import(
      "#shared/zod/change-password.schema"
    );
    const parsedData = changePasswordSchema.parse({ password: newPassword });

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    // Actualizar la contraseña del usuario en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired token",
    });
  }
});
