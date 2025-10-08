import z from "zod";

export const loginSchema = z.object({
  email: z.email("Email no valido"),
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),
});

export type LoginSchemaType = z.output<typeof loginSchema>;
