import { loginSchema } from "#shared/zod/login.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const config = useRuntimeConfig();

  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log("ERROR: User exists");
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userDB = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: email.split("@")[0],
      accounts: {
        create: {
          provider: "email",
          providerAccountId: email,
        },
      },
    },
  });

  console.log("Usuario creado correctamente");

  // await setUserSession(event, {
  //   user: {
  //     name: email.split("@")[0],
  //     email,
  //   },
  // });

  // enviar correo electrónico con enlace y token para verificar la cuenta

  // const token = jwt.sign({ userId: userDB.id }, config.secretJwtKey, {
  //   expiresIn: "1d",
  // });

  const token = generateJwt({
    userId: userDB.id,
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

  return {
    message:
      "User registered successfully. Please check your email to verify your account.",
  };
});
