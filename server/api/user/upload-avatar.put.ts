import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import prisma from "~~/lib/prisma";

const UPLOAD_DIR = "public/uploads/avatars";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Schema de validación con Zod
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "El archivo está vacío")
  .refine(
    (file) => file.size <= MAX_SIZE,
    `El archivo debe ser menor a ${MAX_SIZE / 1024 / 1024}MB`
  )
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      ),
    "Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)"
  )
  .refine((file) => {
    const ext = path.extname(file.name).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
  }, "Extensión de archivo no válida");

export default eventHandler(async (event) => {
  try {
    const session = await getUserSession(event);

    if (!session?.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const formData = await readFormData(event);
    const file = formData.get("avatar");

    // Validar con Zod
    const validatedFile = fileSchema.parse(file);

    // Obtener el usuario actual para verificar si tiene avatar previo
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { avatar: true },
    });

    console.log({ currentUser });

    // Si existe un avatar previo, eliminar el archivo físico
    if (currentUser?.avatar) {
      const oldFileName = path.basename(currentUser.avatar);
      const oldFilePath = path.join(process.cwd(), UPLOAD_DIR, oldFileName);

      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.warn("No se pudo eliminar el avatar anterior:", error);
      }
    }

    // Generar nombre único para el nuevo archivo
    const fileExtension = path.extname(validatedFile.name);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    // Crear directorio si no existe
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
    await fs.mkdir(uploadPath, { recursive: true });

    // Guardar el archivo
    const filePath = path.join(uploadPath, fileName);
    const arrayBuffer = await validatedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // URL pública del avatar
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Actualizar la base de datos con la nueva URL
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: avatarUrl },
    });

    return {
      success: true,
      url: avatarUrl,
      fileName,
    };
  } catch (error: any) {
    console.log({ error: error });

    // Errores de Zod
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Error al subir el archivo",
    });
  }
});
