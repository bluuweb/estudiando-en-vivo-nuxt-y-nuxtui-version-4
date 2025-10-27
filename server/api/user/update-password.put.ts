import { passwordSchema } from "#shared/zod/password.schema";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { current, new: newPassword } = await readValidatedBody(
    event,
    passwordSchema.parse
  );

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  const isCurrentPasswordValid = await bcrypt.compare(current, user.password);

  if (!isCurrentPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Current password is incorrect",
    });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedNewPassword },
  });

  return {};
});
