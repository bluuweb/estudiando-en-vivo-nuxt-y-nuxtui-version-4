import { loginSchema } from "#shared/zod/login.schema";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const {
    secretJwtKey,
    public: { baseApi },
  } = useRuntimeConfig();

  const body = await readBody(event);

  const { success, data } = loginSchema.safeParse(body);

  if (!success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const token = jwt.sign({ email: data.email, baseApi }, secretJwtKey, {
    expiresIn: "1h",
  });

  setCookie(event, "jwt_chat", token, {
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    httpOnly: true, // No accesible desde JS del cliente
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict", // Más permisivo en dev si lo necesitas
    path: "/",
  });

  // setCookie(event, "public_email", data.email, {
  //   secure: process.env.NODE_ENV === "production",
  //   httpOnly: false,
  //   // sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
  //   // path: "/",
  // });

  // TODO: Enviar el token en las peticiones al backend para validar
  // TODO: Crear rutas protegidas
  // TODO: Ver si vamos a trabajar con roles
  // TODO: Token y refresh token
  // TODO: Sesiones con h3 utilizando useSession
  // TODO: nuxt-auth-utils

  return {
    message: "Login successful",
    user: {
      email: data.email,
    },
  };
});
