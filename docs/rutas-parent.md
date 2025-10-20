En Nuxt 3 (y Nuxt 4), si tienes la estructura:

```
/pages/
  setting.vue
  setting/
    index.vue
```

El archivo `setting.vue` **no** se considera un layout, sino que actúa como un "wrapper" o componente padre para las rutas anidadas bajo `/setting`. Es decir, cuando accedes a `/setting`, se renderiza `setting/index.vue` dentro de `setting.vue` usando `<NuxtPage />` (o en Nuxt 2, `<NuxtChild />`). Esto es parte del sistema de rutas anidadas de Nuxt, no del sistema de layouts globales.

**Diferencia con la carpeta `layouts/`:**

- Los archivos en `/layouts/` (por ejemplo, `layouts/default.vue`, `layouts/custom.vue`) son layouts globales que puedes aplicar a cualquier página usando `definePageMeta({ layout: 'custom' })` o el componente `<NuxtLayout>`.
- Un archivo como `pages/setting.vue` es un "route wrapper" específico para la ruta `/setting` y sus hijos, no un layout global reutilizable. Su función es envolver solo las páginas hijas de esa ruta.

**Novedad reciente:**  
En versiones recientes de Nuxt, se ha introducido la convención de usar `@layout.vue` dentro de carpetas de páginas para actuar explícitamente como wrapper de rutas anidadas, reemplazando el uso de `parent.vue` para mayor claridad. Si existe `pages/setting/@layout.vue`, este archivo será el wrapper para todas las rutas hijas de `/setting` y debe usar `<NuxtPage />` para renderizarlas [ver detalles en el PR oficial](https://github.com/nuxt/nuxt/pull/33074).

**Resumen:**

- `pages/setting.vue` es un wrapper de rutas anidadas, **no** un layout global.
- Los layouts globales van en la carpeta `/layouts/` y se aplican a través de la propiedad `layout`.
- Para wrappers explícitos de rutas anidadas, puedes usar `@layout.vue` en la carpeta correspondiente.

Referencia: [Nested layouts PR](https://github.com/nuxt/nuxt/pull/33074)
