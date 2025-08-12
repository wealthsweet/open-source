import { z } from "zod/v4";

export const errorResponse = z.object({
  message: z.string(),
  error: z.string(),
});
