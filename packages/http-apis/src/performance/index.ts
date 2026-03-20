import type { oas31 } from "openapi3-ts";
import { createDocument } from "zod-openapi";
import { z } from "zod/v4";
import { errorResponse } from "../utils";

const invalidExpiresMessage = {
  message:
    "If the expires property exists it cannot have a negative expiration time",
};

export const generateAuthTokenRequestBody = z.object({
  clientId: z.string(),
  clientSecret: z.string().meta({
    examples: ["17bd3fbcda124f7292445d3ab1c1c417"],
  }),
  brandingId: z.string().optional().meta({
    description:
      "The identifier of the branding to use. If not provided, the default client branding will be used.",
  }),
  expires: z.coerce.number().min(0, invalidExpiresMessage).nullable().meta({
    description: "The UTC timestamp at which this token will expire",
  }),
  session: z.string().meta({
    description: `A unique reference for a session to scope this signature to. 
    For instance the session ref may be derived from a user id such that multiple tokens can access the same session.
    Or a different session ref may be issued for the same nodeRefs to sidestep any existing caches.`,
    examples: ["session-1"],
  }),
  nodes: z
    .array(z.string())
    .optional()
    .meta({
      description:
        "A list of references to nodes that this user has access to. If not provided, nodes will not be included in the generated token.",
      examples: ["node-1", "node-2"],
      items: {
        type: "string",
        examples: ["node-1"],
      },
    }),
});

export const generateAuthTokenResponse = z.object({
  token: z.string().meta({
    description: "Authorisation token",
  }),
});

export const SELECTABLE_FONTS_ENUM = z.enum([
  "Inter",
  "Open Sans",
  "Roboto",
  "Poppins",
  "Brown Regular",
  "Whitney Medium",
]);

export const brandingColor = z.string().meta({
  description: "A color value to use in the embedded component",
  examples: ["#ffffff", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"],
});

export const optionalBrandingConfigSchema = z.object({
  balanceColor: brandingColor.optional(),
  timeWeightedPerformanceColor: brandingColor.optional(),
  moneyWeightedPerformanceColor: brandingColor.optional(),
  positiveCapitalMovementColor: brandingColor.optional(),
  negativeCapitalMovementColor: brandingColor.optional(),
  primaryColor: brandingColor.optional(),
  primaryForegroundColor: brandingColor.optional(),
  secondaryColor: brandingColor.optional(),
  secondaryForegroundColor: brandingColor.optional(),
  callToActionColor: brandingColor.optional(),
  callToActionForegroundColor: brandingColor.optional(),
  pdfBalanceColor: brandingColor.optional(),
  pdfTimeWeightedPerformanceColor: brandingColor.optional(),
  pdfMoneyWeightedPerformanceColor: brandingColor.optional(),
  pdfPositiveCapitalMovementColor: brandingColor.optional(),
  pdfNegativeCapitalMovementColor: brandingColor.optional(),
  pdfTextColor: brandingColor.optional(),
  pdfBannerColor: brandingColor.optional(),
  pdfPageColor: brandingColor.optional(),
  pdfBannerContrastColor: brandingColor.optional(),
  fontFamily: SELECTABLE_FONTS_ENUM.optional(),
  logoUrl: z.string().optional(),
});

export const embedRequestParams = z.object({
  token: z.string().meta({
    description: "The access token for this embedded context",
    examples: ["pk_test_TOKEN"],
  }),
  from: z.iso
    .date()
    .optional()
    .meta({
      description: "The date to report performance calcs from",
      examples: ["2020-01-01"],
    }),
  to: z.iso
    .date()
    .optional()
    .meta({
      description: "The date to report performance calcs to",
      examples: ["2021-01-01"],
    }),
  currencyIsoCode: z
    .string()
    .min(3)
    .max(3)
    .optional()
    .meta({
      description: "The currency iso code to report performance in",
      examples: ["GBP"],
    }),
  investorExtRefs: z
    .array(z.string())
    .optional()
    .meta({
      description: "A list of investor references to calculate performance for",
      examples: ["inv-1", "inv-2"],
      items: {
        type: "string",
        examples: ["inv-1"],
      },
    }),
  investorAccountExtRefs: z
    .array(z.string())
    .optional()
    .meta({
      description:
        "A list of investor account references to calculate performance for",
      examples: ["inv-acc-1", "inv-acc-2"],
      items: {
        type: "string",
        examples: ["inv-acc-1"],
      },
    }),
  brandingConfiguration: z
    .string()
    .optional()
    .meta({
      description:
        "A base64 encoded JSON string of the branding configuration object to customise the appearance of the embedded performance page",
      examples: ["eyJwcmltYXJ5Q29sb3IiOiIjRmZkMDAwIn0K"], // base64 encoded {"primaryColor":"#Ffd000"}
    }),
});

export const serviceHealth = z.object({
  health: z.enum(["Healthy", "Unhealthy"]).meta({
    description: "The health of the service",
  }),
  message: z.string().optional().meta({
    description: "A message relating to the health of a service",
  }),
  error: z.string().optional().meta({
    description: "The error associated with with an unhealthy service",
  }),
});

export const serviceHealthResponse = z.object({
  api: serviceHealth,
  database: serviceHealth,
  pubStorage: serviceHealth,
  azure: serviceHealth.meta({ deprecated: true }),
});

export function createPerformanceSwaggerFile(): oas31.OpenAPIObject {
  return createDocument({
    openapi: "3.1.0",
    info: {
      version: "1.1.0",
      title: "Wealthsweet Performance API",
      description:
        "This is the wealthsweet performance API based on the OpenAPI 3.1 specification",
    },
    tags: [
      {
        name: "embed",
        description: "Operations based around embedded components",
        externalDocs: {
          description: "Find out more",
          url: "http://docs.wealthsweet.com",
        },
      },
      {
        name: "health",
        description: "Operations based around application health",
        externalDocs: {
          description: "Find out more",
          url: "http://docs.wealthsweet.com",
        },
      },
      {
        name: "auth",
        description: "Operations based around authentication",
        externalDocs: {
          description: "Find out more",
          url: "http://docs.wealthsweet.com",
        },
      },
    ],
    paths: {
      "/api/auth/token": {
        post: {
          tags: ["auth"],
          summary: "Generates an authentication token",
          description:
            "Generates an authentication token that authenticates the user and authorises access to specified resources",
          operationId: "token",
          requestBody: {
            content: {
              "application/json": { schema: generateAuthTokenRequestBody },
            },
            required: true,
          },
          responses: {
            "200": {
              description: "Successful operation",
              content: {
                "application/json": { schema: generateAuthTokenResponse },
              },
            },
            "400": {
              description: "Request failed to validate",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
            "401": {
              description: "Invalid client ID or secret",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
            "500": {
              description: "Internal server error",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
          },
        },
      },
      "/api/health": {
        get: {
          tags: ["health"],
          summary: "Retrieves service health information",
          description:
            "Retrieves information relating to the health of application services",
          operationId: "health",
          responses: {
            "200": {
              description: "Successfully retrieved service health information",
              content: {
                "application/json": { schema: serviceHealthResponse },
              },
            },
            "503": {
              description: "Service(s) are currently unavailable",
              content: {
                "application/json": { schema: serviceHealthResponse },
              },
            },
          },
        },
      },
      "/embed/pages/performance": {
        get: {
          tags: ["embed"],
          summary: "Load the embedded performance page",
          operationId: "embedPagePerformance",
          requestParams: {
            query: embedRequestParams,
          },
          responses: {
            "200": {
              description: "The request authenticated and loaded successfully",
              content: {
                "text/html": { schema: z.string() },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        generateAuthTokenRequestBody,
        generateAuthTokenResponse,
        errorResponse,
        serviceHealth,
        serviceHealthResponse,
      },
      examples: {
        brandingConfigExample: {
          summary:
            "Example branding configuration. Note this is a base64 encoded JSON string with the following structure.",
          value: {
            balanceColor: "#00FF00",
            timeWeightedPerformanceColor: "rgb(0, 255, 0)",
            moneyWeightedPerformanceColor: "hsl(120, 100%, 50%)",
            positiveCapitalMovementColor: "#00FF00",
            negativeCapitalMovementColor: "#FF0000",
            primaryColor: "hsl(120, 100%, 50%)",
            primaryForegroundColor: "#000000",
            secondaryColor: "#FFFFFF",
            secondaryForegroundColor: "#000000",
            callToActionColor: "hsl(120, 100%, 50%)",
            callToActionForegroundColor: "#FFFFFF",
            pdfBalanceColor: "#012345",
            pdfTimeWeightedPerformanceColor: "#012345",
            pdfMoneyWeightedPerformanceColor: "#012345",
            pdfPositiveCapitalMovementColor: "#012345",
            pdfNegativeCapitalMovementColor: "#012345",
            pdfTextColor: "#012345",
            pdfBannerColor: "#012345",
            pdfPageColor: "#012345",
            pdfBannerContrastColor: "#012345",
            fontFamily: "Inter",
            logoUrl: "https://example.com/logo.png",
          },
        },
      },
    },
  });
}
