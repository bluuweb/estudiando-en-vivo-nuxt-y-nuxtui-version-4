## #app en Nuxt 4

En Nuxt, `#app` es un alias especial que apunta a los tipos y utilidades principales del núcleo de la aplicación Nuxt. Por ejemplo, cuando importas desde `#app`:

```ts
import type { NuxtError } from "#app";
```

estás trayendo tipos o funciones proporcionados por Nuxt para usarlos en tu proyecto, como el tipo `NuxtError` que se utiliza en la gestión de errores personalizados en `error.vue` [error.vue - Nuxt 4.x Docs](https://nuxt.com/docs/4.x/guide/directory-structure/app/error).

Este alias es parte de los alias internos que Nuxt genera automáticamente y que puedes usar en tu código para acceder a funcionalidades internas del framework sin preocuparte por la ruta física de los archivos [Nuxt Configuration - alias](https://nuxt.com/docs/4.x/api/nuxt-config#alias).

En resumen:  
**`#app` es un alias que te permite importar tipos y utilidades internas de Nuxt, como `NuxtError`, de forma sencilla y segura.**

## Alias en Nuxt 4 ~~

En Nuxt, los alias ~ y ~~ tienen significados distintos:

- ~ apunta al directorio de la aplicación fuente (srcDir), que en Nuxt 4 por defecto es app/.
- ~~ apunta a la raíz del proyecto (rootDir).

Por eso, si quieres importar algo desde la raíz del proyecto, debes usar ~~. Si solo usas ~, estarías refiriéndote al directorio app/ (o srcDir), no a la raíz. Por ejemplo, import prisma from "~~/lib/prisma" busca lib/prisma en la raíz del proyecto, mientras que import prisma from "~/lib/prisma" lo buscaría dentro de app/lib/prisma.

Esto está documentado en la configuración de Nuxt, donde se muestra que ~ y @ apuntan a srcDir, y ~~ y @@ a rootDir [Nuxt Configuration - alias](https://nuxt.com/docs/4.x/api/nuxt-config#alias).

Así que, para acceder a archivos en la raíz del proyecto, es correcto y necesario usar el doble ~~.

## Manejo de Errores en Nuxt 4

Para mostrar el mensaje de error personalizado enviado desde tu API usando `$fetch`, debes capturar la excepción que lanza `$fetch` cuando la respuesta tiene un código de error (por ejemplo, 400). El mensaje que envías en el campo `message` de `createError` no se propaga directamente al cliente, pero puedes usar el campo `statusMessage` o el campo `data` para enviar información personalizada que sí estará disponible en el error del lado del cliente.

Según la documentación oficial:

> En rutas API, se recomienda usar `createError` pasando un objeto con un `statusMessage` corto porque puede ser accedido en el cliente. De lo contrario, un `message` pasado a `createError` en una ruta API no se propagará al cliente. Alternativamente, puedes usar la propiedad `data` para pasar datos al cliente.  
> [createError - Nuxt 3.x Docs](https://nuxt.com/docs/3.x/api/utils/create-error)

**Ejemplo recomendado en tu API:**

```js
throw createError({
  statusCode: 400,
  statusMessage: "User already exists", // Usa statusMessage en vez de message
});
```

O si necesitas enviar más datos:

```js
throw createError({
  statusCode: 400,
  statusMessage: "Bad Request",
  data: { message: "User already exists" },
});
```

**En el cliente, captura el error así:**

```js
try {
  await $fetch("/api/register", {
    method: "POST",
    body: {
      email: payload.data.email,
      password: payload.data.password,
    },
  });
} catch (error) {
  // Si usaste statusMessage:
  console.log(error.statusMessage); // "User already exists"
  // Si usaste data:
  console.log(error.data?.message); // "User already exists"
}
```

**Resumen:**

- Usa `statusMessage` o `data` en el objeto de error en tu API.
- Captura el error en el cliente y accede a esos campos.

Referencia: [createError - Nuxt 3.x Docs](https://nuxt.com/docs/3.x/api/utils/create-error)

## Tipado del Error en Nuxt 4

Para tipar correctamente el error y acceder a la propiedad `statusMessage` sin que TypeScript marque error, puedes usar la interfaz `NuxtError` que Nuxt expone. Según la documentación, la interfaz incluye el campo `statusMessage`:

```ts
interface NuxtError<DataT = unknown> {
  statusCode: number;
  statusMessage: string;
  message: string;
  data?: DataT;
  error?: true;
}
```

[useError - Nuxt 3.x Docs](https://nuxt.com/docs/3.x/api/composables/use-error)

Por lo tanto, puedes hacer un type assertion al capturar el error:

```ts
import type { NuxtError } from "#app";

try {
  await $fetch("/api/register", {
    /* ... */
  });
} catch (err) {
  const error = err as NuxtError;
  console.log(error.statusMessage);
}
```

Esto le indica a TypeScript que el error tiene la forma de un `NuxtError`, permitiéndote acceder a `statusMessage` sin errores de tipado.

> Nota: Si usas un campo personalizado en `data`, puedes tipar el error como `NuxtError<{ message: string }>` para acceder a `error.data.message` de forma segura.

Referencia: [useError - Nuxt 3.x Docs](https://nuxt.com/docs/3.x/api/composables/use-error)
