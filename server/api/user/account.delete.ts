import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  // leer el body con la cuenta a eliminar
  const { accountId } = await readBody(event);

  const session = await getUserSession(event);

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Averiguar si el usuario tiene más de una cuenta vinculada
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      accounts: {
        select: {
          id: true,
          provider: true,
        },
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  if (user.accounts.length <= 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete account with only one linked provider",
    });
  }

  // Eliminar account de forma definitiva (TODO: hacer un soft delete)
  await prisma.account.delete({
    where: {
      id: accountId,
      user: {
        email: session.user.email,
      },
    },
  });

  return { message: "Account unlinked successfully" };
});
