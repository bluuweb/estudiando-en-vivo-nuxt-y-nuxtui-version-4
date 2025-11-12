// server/api/user/account.delete.ts
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const { accountId } = await readBody(event);
  const session = await getUserSession(event);

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          accessToken: true,
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

  const accountToDelete = user.accounts.find((acc) => acc.id === accountId);

  if (!accountToDelete) {
    throw createError({
      statusCode: 404,
      statusMessage: "Account not found",
    });
  }

  // Revocar acceso según el proveedor
  if (accountToDelete.provider === "github" && accountToDelete.accessToken) {
    try {
      await revokeGitHubToken(accountToDelete.accessToken);
    } catch (error) {
      console.error("Error revoking GitHub access:", error);
    }
  }

  // Eliminar cuenta de la BD
  await prisma.account.delete({
    where: {
      id: accountId,
      userId: user.id,
    },
  });

  return { message: "Account unlinked successfully" };
});

// Revoca el token de acceso de ese usuario ante GitHub
async function revokeGitHubToken(accessToken: string) {
  const config = useRuntimeConfig();
  const clientId = config.oauth.github.clientId;
  const clientSecret = config.oauth.github.clientSecret;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    // Método correcto: DELETE con el token en la URL
    const response = await $fetch(
      `https://api.github.com/applications/${clientId}/token`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: { access_token: accessToken },
      }
    );

    console.log({ response });

    return response;
  } catch (error: any) {
    console.error("GitHub API Error:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.data,
    });
    throw error;
  }
}
