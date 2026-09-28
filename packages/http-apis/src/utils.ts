import { z } from "zod/v4";

export const errorResponse = z.object({
  message: z.string(),
  error: z
    .union([z.string(), z.record(z.string(), z.array(z.string()))])
    .optional()
    .meta({
      description:
        "Details of the error. Validation failures return an object mapping each invalid field to its error messages.",
      examples: [{ session: ["Invalid input: expected string"] }],
    }),
});
