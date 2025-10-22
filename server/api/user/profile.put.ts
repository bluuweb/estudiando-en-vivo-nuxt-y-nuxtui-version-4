import { ProfileSchema } from "#shared/zod/profile.schema";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { username } = await readValidatedBody(event, ProfileSchema.parse);

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: { name: username },
    select: {
      name: true,
      email: true,
    },
  });

  await setUserSession(event, {
    user: {
      ...session.user,
      name: updatedUser.name,
    },
  });

  return {};
});
