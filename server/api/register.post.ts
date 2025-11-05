import { loginSchema } from "#shared/zod/login.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const config = useRuntimeConfig();

  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  // Preguntar si el user tiene el email verificado en la tabla account del provider "email"
  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "email",
        providerAccountId: email,
      },
    },
  });

  if (account && account.emailVerified) {
    throw createError({
      statusCode: 400,
      statusMessage: "Esta cuenta ya existe, no se puede volver a registrar.",
    });
  }

  if (user) {
    // Si existe la cuenta, crear account vinculada (provider: "email")
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "email",
          providerAccountId: email,
        },
      },
      update: {},
      create: {
        userId: user.id,
        provider: "email",
        providerAccountId: email,
        emailVerified: false,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (user) {
    // TODO: Actualizar password del modelo User 🔴🔴🔴 esto revisar que no me gusta mucho
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
  } else {
    user = await prisma.user.create({
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
  }

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

  return {
    message:
      "User registered successfully. Please check your email to verify your account.",
  };
});
