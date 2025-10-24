# 1. Modifica tu schema.prisma (agregar campo avatar)

# 2. Crear y aplicar la migración

npx prisma migrate dev --name add_avatar_to_user

# 3. Regenerar el cliente (se hace automáticamente con migrate dev, pero puedes ejecutarlo manualmente)

npx prisma generate
