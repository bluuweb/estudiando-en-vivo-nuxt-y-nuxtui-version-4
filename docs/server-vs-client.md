# Cómo funcionan las páginas en Nuxt

En Nuxt, las páginas pueden ejecutarse tanto en el servidor como en el cliente, dependiendo del modo de renderizado que uses. Te explico los conceptos clave:

## Renderizado Universal (por defecto)

Por defecto, Nuxt usa [renderizado universal](https://nuxt.com/docs/3.x/guide/concepts/rendering#universal-rendering), donde:

**En el servidor:**

- Se ejecuta el código JavaScript/Vue para generar HTML completo
- Se inicializan las variables reactivas (como `ref()`)
- Se ejecutan composables de datos como `useFetch`

**En el cliente:**

- El navegador recibe el HTML ya renderizado
- Vue "hidrata" el HTML, reconectando la interactividad
- El código se ejecuta nuevamente para habilitar eventos y reactividad
- Los event handlers (como `@click`) solo funcionan en el cliente

Ejemplo del comportamiento:

```typescript
<script setup lang="ts">
const counter = ref(0) // se ejecuta en servidor y cliente

const handleClick = () => {
  counter.value++ // solo se ejecuta en el cliente
}
</script>
```

## Páginas 100% cliente

**Sí, puedes crear páginas completamente del lado del cliente** de dos formas:

1. **Página específica cliente-only:** Añade el sufijo `.client.vue` a tu archivo de página según la [documentación de páginas client-only](https://nuxt.com/docs/3.x/guide/directory-structure/pages#client-only-pages)

2. **Toda la aplicación en modo SPA:** Configura `ssr: false` en tu `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  ssr: false,
});
```

## Componentes y métodos específicos

Para ejecutar código solo en el cliente:

- **Componentes:** Usa el sufijo `.client.vue` o envuelve con [`<ClientOnly>`](https://nuxt.com/docs/3.x/api/components/client-only)
- **Fetching:** Usa la opción `server: false` en `useFetch`:

```typescript
const { status, data: comments } = useFetch("/api/comments", {
  lazy: true,
  server: false, // solo se ejecuta en el cliente
});
```

## ¿Dónde se ejecuta useFetch?

[`useFetch` se ejecuta en ambos lados](https://nuxt.com/docs/3.x/getting-started/data-fetching) (servidor y cliente) por defecto, pero de manera inteligente:

- **En el servidor:** Hace la petición y guarda los datos en el "payload"
- **En el cliente:** Reutiliza los datos del payload sin hacer otra petición

Esto evita la doble carga de datos. Si usaras `$fetch` directamente sin `useFetch`, [los datos se cargarían dos veces](https://nuxt.com/docs/3.x/api/utils/dollarfetch):

```typescript
// ❌ Datos se cargan dos veces (servidor y cliente)
const dataTwice = await $fetch("/api/item");

// ✅ Datos se cargan una vez y se transfieren al cliente
const { data } = await useFetch("/api/item");
```

## Conexión a base de datos

**Sí, puedes conectarte a una base de datos**, pero **solo desde el servidor**. Debes hacerlo en:

- **API routes** (`server/api/`)
- **Server middleware** (`server/middleware/`)

Nunca expongas credenciales de base de datos en el código del cliente. Usa las [rutas API internas](https://nuxt.com/docs/3.x/api/utils/dollarfetch) de Nuxt para manejar la lógica de base de datos de forma segura en el servidor.
