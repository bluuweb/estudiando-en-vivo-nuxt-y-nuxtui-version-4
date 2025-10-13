import { loginSchema } from "#shared/zod/login.schema";

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  if (email === "zephir@bluu.com" && password === "123123") {
    await setUserSession(event, {
      user: {
        name: "zephir",
        email: "zephir@bluu.com",
      },
    });
    return {};
  }

  throw createError({
    statusCode: 401,
    message: "Bad credentials",
  });
});
