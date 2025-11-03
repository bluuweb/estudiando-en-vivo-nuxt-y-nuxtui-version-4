export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const clientId = config.oauth.github.clientId;
  const redirectUri = `${config.public.appUrl}/api/auth/github-callback`;
  // const clientSecret = config.oauth.github.clientSecret;

  const state = Math.random().toString(36).substring(2);

  // Guardamos el "state" en una cookie
  setCookie(event, "oauth_github_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 300, // 5 minutos
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=read:user user:email&state=${state}`;

  return sendRedirect(event, githubAuthUrl);
});
