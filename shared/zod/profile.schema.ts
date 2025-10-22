import * as z from "zod";

export const ProfileSchema = z.object({
  username: z.string().trim().min(2).max(100).lowercase(),
});

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
