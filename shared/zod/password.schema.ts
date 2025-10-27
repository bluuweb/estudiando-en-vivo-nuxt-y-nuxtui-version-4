import z from "zod";

// const passwordSchema = z.string()
//   .min(8, { error: "Must be at least 8 characters" })
//   .refine((val) => /[A-Z]/.test(val), { error: "Must contain an uppercase letter" })
//   .refine((val) => /[0-9]/.test(val), { error: "Must contain a number" })
//   .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), { error: "Must contain a special character" });

// export const passwordSchema = z.object({
//   current: z
//     .string("Se necesito un string")
//     .trim()
//     .min(6, "Must be at least 6 characters"),
//   new: z
//     .string("Se necesito un string")
//     .trim()
//     .min(6, "Must be at least 6 characters"),
// });

export const passwordSchema = z
  .object({
    current: z
      .string("Se necesito un string")
      .trim()
      .min(6, "Must be at least 6 characters"),
    new: z
      .string("Se necesito un string")
      .trim()
      .min(6, "Must be at least 6 characters"),
  })
  .refine((data) => data.current !== data.new, {
    message: "La contraseña nueva debe ser diferente a la actual",
    path: ["new"],
  });

export type PasswordSchemaType = z.infer<typeof passwordSchema>;
