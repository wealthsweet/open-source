import z from "zod/v4";
import { optionalBrandingOverridesSchema } from "./performance";

export * from "./performance";

export type BrandingOverrides = z.infer<typeof optionalBrandingOverridesSchema>;
