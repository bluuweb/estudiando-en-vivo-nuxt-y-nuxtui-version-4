import { loginSchema } from "#shared/zod/login.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("ERROR: User not found");
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

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
