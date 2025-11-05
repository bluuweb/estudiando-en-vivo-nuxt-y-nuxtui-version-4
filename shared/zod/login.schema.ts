import z from "zod";

export const loginSchema = z.object({
  email: z.email("Email no valido"),
  password: z
    .string("La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),
  // Ejemplo de contraseña robusta
  // password: z
  //   .string()
  //   .min(8, "La contraseña debe tener al menos 8 caracteres")
  //   .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  //   .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  //   .regex(/[0-9]/, "La contraseña debe contener al menos un número")
  //   .regex(
  //     /[\W_]/,
  //     "La contraseña debe contener al menos un carácter especial"
  //   ),
});

export type LoginSchemaType = z.output<typeof loginSchema>;
