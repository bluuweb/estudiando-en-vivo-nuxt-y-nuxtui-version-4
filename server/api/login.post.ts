import { loginSchema } from "#shared/zod/login.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // TODO: Implementar lógica de cuentas vinculadas

  if (!user) {
    console.log("ERROR: User not found");
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  if (!user.emailVerified) {
    const token = generateJwt({
      userId: user.id,
      secretKey: config.secretJwtKey,
      expiresIn: 60 * 60 * 24, // 1 día en segundos
    });

    const transporter = createTransporter({
      host: config.nodemailer.smtpHost,
      port: Number(config.nodemailer.smtpPort),
      user: config.nodemailer.auth.smtpUser,
      pass: config.nodemailer.auth.smtpPass,
    });

    const urlVerify = `${config.public.appUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: 'Support" <support@mi-app.com>',
      to: email,
      subject: "Verifica tu cuenta",
      html: `<p>Hola ${email.split("@")[0]},</p>
           <p>Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
           <p>
           <a href="${urlVerify}">Verificar cuenta</a>
           </p>`,
    };

    await transporter.sendMail(mailOptions);

    throw createError({
      statusCode: 401,
      statusMessage: "Email not verified, verification email sent",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);

  if (!isPasswordValid) {
    console.log("ERROR: Invalid password");
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid password",
    });
  }

  console.log("Login successful");

  await setUserSession(event, {
    user: {
      name: user.name || email.split("@")[0],
      email,
    },
  });

  return {};
});
