export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        name: user.name || user.email?.split("@")[0],
        email: user.email!,
      },
    });

    const { user: userSession } = await requireUserSession(event);
    // const session = await getUserSession(event);
    console.log({ userSession });

    console.log("♥️ entró a github");
    // return sendRedirect(event, "/");
    return;
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
