import { loginSchema } from "#shared/zod/login.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
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

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: email.split("@")[0],
    },
  });

  console.log("Usuario creado correctamente");

  await setUserSession(event, {
    user: {
      name: email.split("@")[0],
      email,
    },
  });

  return {};
});
