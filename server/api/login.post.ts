import { loginSchema } from "#shared/zod/login.schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { success, data } = loginSchema.safeParse(body);

  if (!success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  // Here you would typically check the user's credentials against a database
  // For demonstration purposes, we'll just log the data and return a success response
  console.log("Login attempt:", data);

  return {
    message: "Login successful",
    user: {
      email: data.email,
    },
  };
});
