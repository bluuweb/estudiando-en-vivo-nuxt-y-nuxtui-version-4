# Nuxt Auth Utils

## ¿Qué es nuxt-auth-utils?

**nuxt-auth-utils** es un módulo para Nuxt que facilita la gestión de autenticación y sesiones de usuario, tanto en el cliente como en el servidor. Utiliza cookies seguras y cifradas para almacenar la sesión, por lo que no necesitas una base de datos solo para manejar sesiones. Además, provee utilidades y composables para saber si un usuario está autenticado y proteger rutas fácilmente [Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication).

## Ejemplo básico de implementación: login, logout y ruta protegida

### 1. Instalación

```bash
npx nuxt module add auth-utils
```

Esto agrega el módulo a tu proyecto y lo configura automáticamente.

### 2. Configura la clave de cifrado en `.env`

```env
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters
```

### 3. Ruta de login (API)

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
    await setUserSession(event, {
      user: { name: "John Doe" },
    });
    return {};
  }
  throw createError({ statusCode: 401, message: "Bad credentials" });
});
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

### 4. Página de login

Crea `app/pages/login.vue`:

```vue
<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const credentials = reactive({ email: "", password: "" });

async function login() {
  try {
    await $fetch("/api/login", { method: "POST", body: credentials });
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

### 5. Middleware para proteger rutas

Crea `app/middleware/authenticated.ts`:

```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
```

[Protect App Routes](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#protect-app-routes)

### 6. Página protegida (por ejemplo, Home)

```vue
<script setup lang="ts">
definePageMeta({ middleware: ["authenticated"] });

const { user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/login");
}
</script>

<template>
  <div>
    <h1>Welcome {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
```

[Home Page](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#home-page)

---

**Resumen:**

- Usas `useUserSession()` para saber si el usuario está autenticado.
- El login se hace llamando a la API y refrescando la sesión.
- El logout se hace con `clearSession()`.
- Proteges rutas usando middleware y `definePageMeta`.

¡Así puedes tener autenticación básica y rutas protegidas en Nuxt de forma sencilla!
