# Protección de APIs en Nuxt

Sí, puedes proteger tus APIs para que no sean públicamente accesibles. Aquí te explico las estrategias principales:

## 1. Server Middleware para validación

Puedes crear [server middleware](https://nuxt.com/docs/3.x/guide/directory-structure/server#server-middleware) que se ejecute en cada petición para validar el origen:

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  // Validar headers, tokens, etc.
  event.context.auth = { user: 123 };
});
```

## 2. Protección con autenticación

La forma más robusta es [proteger las rutas API con autenticación](https://nuxt.com/docs/3.x/guide/recipes/sessions-and-authentication#protect-api-routes). Usando `nuxt-auth-utils`, puedes requerir sesiones válidas:

```typescript
// server/api/user/stats.get.ts
export default defineEventHandler(async (event) => {
  // Asegura que el usuario esté autenticado
  // Lanza un error 401 si no hay sesión válida
  const { user } = await requireUserSession(event);

  // Tu lógica protegida aquí
  return {};
});
```

## 3. Runtime Config para secrets

Usa [runtime config](https://nuxt.com/docs/3.x/guide/going-further/runtime-config) para manejar tokens y secrets de forma segura:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Solo accesible en el servidor
    apiSecret: "123",
    public: {
      apiBase: "/api",
    },
  },
});
```

Luego valida en tu API:

```typescript
// server/api/test.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // Valida el token de autorización
  const result = await $fetch(`/test`, {
    headers: {
      Authorization: `Bearer ${config.apiSecret}`,
    },
  });
  return result;
});
```

## Importante sobre APIs públicas

Ten en cuenta que **cualquier API expuesta en `/api/*` es técnicamente accesible públicamente** si alguien conoce la URL. La verdadera protección viene de:

1. **Autenticación/autorización** - Validar que el usuario tiene permisos
2. **Validación de origen** - Verificar headers, tokens, etc.
3. **Rate limiting** - Limitar peticiones por IP/usuario

Si necesitas una API completamente privada, considera usar un [backend separado](https://stackoverflow.com/questions/78080730) (como Laravel) y que Nuxt solo actúe como proxy autenticado.
