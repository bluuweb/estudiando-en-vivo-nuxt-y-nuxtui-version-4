import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address").trim(),
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
