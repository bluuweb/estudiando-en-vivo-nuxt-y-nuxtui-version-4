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
      headers: {
        Accept: "application/json",
      },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    }
  );

  const accessToken = tokenResponse.access_token;

  // Obtener los datos del usuario
  const user = await $fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  // Obtener el email del usuario
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

  // Aquí puedes manejar el inicio de sesión o registro del usuario en tu sistema
  // Usando los datos obtenidos de GitHub (user y primaryEmail)

  // Por ejemplo, podrías crear una sesión para el usuario:
  await setUserSession(event, {
    user: {
      name: (user as any).name || primaryEmail.email.split("@")[0],
      email: primaryEmail.email,
    },
  });

  // Redirigir al usuario a la página principal o a donde desees
  return sendRedirect(event, "/admin/dashboard");
});
