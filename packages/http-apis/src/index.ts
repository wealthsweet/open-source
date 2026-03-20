import z from "zod/v4";
import { optionalBrandingConfigSchema } from "./performance";

export * from "./performance";

export type BrandingConfiguration = z.infer<
  typeof optionalBrandingConfigSchema
>;
