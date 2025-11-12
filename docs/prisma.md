# 1. Modifica tu schema.prisma (agregar campo avatar)

# 2. Crear y aplicar la migración

npx prisma migrate dev --name add_avatar_to_user

# 3. Regenerar el cliente (se hace automáticamente con migrate dev, pero puedes ejecutarlo manualmente)

npx prisma generate

## Reset de db osea perder todos los datos

```sh
npx prisma migrate reset
```

## Si no te interesan las migraciones todavía y solo quieres que la base de datos quede igual al schema:

```sh
npx prisma db push --force-reset
```
