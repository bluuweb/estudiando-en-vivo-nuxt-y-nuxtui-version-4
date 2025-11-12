// server/api/auth/github-callback.get.ts
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;

  // Validar el state
  const savedState = getCookie(event, "oauth_github_state");
  if (!savedState || savedState !== state) {
    throw createError({ statusCode: 400, message: "Invalid state" });
  }

  const config = useRuntimeConfig();
  const clientId = config.oauth.github.clientId;
  const clientSecret = config.oauth.github.clientSecret;

  // Intercambiar el code por un access_token
  const tokenResponse = await $fetch<{ access_token: string }>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    }
  );

  const accessToken = tokenResponse.access_token;

  // Obtener datos del usuario
  const user = await $fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  // Obtener email
  const emails = await $fetch<
    Array<{ email: string; primary: boolean; verified: boolean }>
  >("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const primaryEmail = emails.find((email) => email.primary && email.verified);

  if (!primaryEmail) {
    throw createError({
      statusCode: 400,
      message: "No verified primary email found",
    });
  }

  // Buscar o crear usuario
  let userDB = await prisma.user.findUnique({
    where: { email: primaryEmail.email },
    include: { accounts: true },
  });

  if (!userDB) {
    // Crear nuevo usuario con cuenta GitHub
    userDB = await prisma.user.create({
      data: {
        email: primaryEmail.email,
        name: (user as any).name || primaryEmail.email.split("@")[0],
        accounts: {
          create: {
            provider: "github",
            providerAccountId: (user as any).id.toString(),
            emailVerified: primaryEmail.verified,
            accessToken, // Guardar el token
          },
        },
      },
      include: { accounts: true },
    });
  } else {
    // Verificar si ya tiene cuenta GitHub vinculada
    const existingGitHubAccount = userDB.accounts.find(
      (acc) => acc.provider === "github"
    );

    if (!existingGitHubAccount) {
      // Vincular cuenta GitHub
      await prisma.account.create({
        data: {
          userId: userDB.id,
          provider: "github",
          providerAccountId: (user as any).id.toString(),
          emailVerified: primaryEmail.verified,
          accessToken, // Guardar el token
        },
      });
    } else {
      // Actualizar token existente
      await prisma.account.update({
        where: { id: existingGitHubAccount.id },
        data: { accessToken },
      });
    }
  }

  await setUserSession(event, {
    user: {
      name: (user as any).name || primaryEmail.email.split("@")[0],
      email: primaryEmail.email,
    },
  });

  return sendRedirect(event, "/admin/dashboard");
});
