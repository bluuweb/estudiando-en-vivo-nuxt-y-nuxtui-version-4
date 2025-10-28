import { forgotPasswordSchema } from "#shared/zod/forgot-password.schema";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const { email } = await readValidatedBody(event, forgotPasswordSchema.parse);

  const config = useRuntimeConfig();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // throw createError({ statusCode: 404, statusMessage: "User not found" });
    // Por seguridad, no revelar si el email existe o no
    console.log({ error: "no existe el usuario" });
    return { message: "If this email exists, you will receive a reset link." };
  }

  try {
    console.log({
      jwtSecret: config.secretJwtKey,
      host: config.nodemailer.smtpHost,
      port: config.nodemailer.smtpPort,
      user: config.nodemailer.auth.smtpUser,
      pass: config.nodemailer.auth.smtpPass,
    });

    // Generar un token JWT para restablecer la contraseña
    const token = jwt.sign({ userId: user.id }, config.secretJwtKey, {
      expiresIn: "15m",
    });

    // URL de reset
    const resetUrl = `${config.public.appUrl}/auth/change-password?token=${token}`;
    // Enviar el email de restablecimiento de contraseña

    const transporter = nodemailer.createTransport({
      host: config.nodemailer.smtpHost,
      port: Number(config.nodemailer.smtpPort),
      auth: {
        user: config.nodemailer.auth.smtpUser,
        pass: config.nodemailer.auth.smtpPass,
      },
    });

    await transporter.sendMail({
      from: '"Support" <support@example.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
    });

    return { message: "If this email exists, you will receive a reset link." };
  } catch (error) {
    console.log({
      error: "Error al enviar el email de restablecimiento de contraseña",
      details: error,
    });
    throw createError({
      statusCode: 500,
      statusMessage: "Error sending reset email",
    });
  }
});
