## 1. Instalación de nuxt-auth-utils

Ejecuta en tu terminal:

```bash
npx nuxt module add auth-utils
```

Esto agregará el módulo a la sección `modules` de tu `nuxt.config.ts` automáticamente.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 2. Configuración de la clave de cifrado de cookies

Agrega la variable de entorno en tu archivo `.env`:

```
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters
```

Esta clave es usada para cifrar las cookies de sesión.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 3. Crear la ruta de login en el servidor

Crea el archivo `server/api/login.post.ts`:

```ts
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  if (email === "[email protected]" && password === "iamtheadmin") {
    // Establece la sesión del usuario en la cookie
    await setUserSession(event, {
      user: {
        name: "John Doe",
      },
    });
    return {};
  }
  throw createError({
    statusCode: 401,
    message: "Bad credentials",
  });
});
```

Asegúrate de instalar la dependencia `zod`:

```bash
npm i zod
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 4. Crear la página de login

Crea el archivo `app/pages/login.vue`:

```vue
<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const credentials = reactive({
  email: "",
  password: "",
});
async function login() {
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials,
    });
    // Refresca la sesión y redirige al home
    await refreshSession();
    await navigateTo("/");
  } catch {
    alert("Bad credentials");
  }
}
</script>

<template>
  <form @submit.prevent="login">
    <input
      v-model="credentials.email"
      type="email"
      placeholder="Email"
    />
    <input
      v-model="credentials.password"
      type="password"
      placeholder="Password"
    />
    <button type="submit">Login</button>
  </form>
</template>
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 5. Proteger rutas con middleware

Crea el archivo `app/middleware/authenticated.ts`:

```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
```

[Protect App Routes](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#protect-app-routes)

---

## 6. Crear una página protegida (dashboard)

Crea el archivo `app/pages/dashboard.vue`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
});
const { user, clear: clearSession } = useUserSession();
async function logout() {
  await clearSession();
  await navigateTo("/login");
}
</script>

<template>
  <div>
    <h1>Bienvenido {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
```

[Home Page](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#home-page)

---

## 7. ¿Utiliza JWT?

**nuxt-auth-utils** NO utiliza JWT por defecto. Utiliza cookies selladas y cifradas para almacenar la sesión del usuario en el servidor, lo que simplifica la gestión y aumenta la seguridad en aplicaciones full-stack con Nuxt.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

### Resumen

- Instala y configura nuxt-auth-utils.
- Crea la API de login y la página de login.
- Protege rutas con middleware.
- No necesitas JWT, ya que la sesión se maneja con cookies cifradas automáticamente.

Si necesitas más detalles sobre personalización o integración con bases de datos, revisa la [receta oficial](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication).
