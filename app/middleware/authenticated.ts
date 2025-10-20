export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  console.log({ loggedIn: loggedIn.value });

  if (loggedIn.value && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/admin/dashboard");
  }

  // Solo redirige a /login si NO está autenticado y NO está ya en /login o /register
  if (!loggedIn.value && to.path !== "/login" && to.path !== "/register") {
    return navigateTo("/login");
  }
});
