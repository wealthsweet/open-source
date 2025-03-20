import type { oas31 } from "openapi3-ts";
import { z } from "zod";
import { createDocument } from "zod-openapi";
import "zod-openapi/extend";
import { errorResponse } from "../utils";

const invalidExpiresMessage = {
  message:
    "If the expires property exists it cannot have a negative expiration time",
};

export const generateAuthTokenRequestBody = z.object({
  clientId: z.string(),
  clientSecret: z.string().openapi({
    example: "17bd3fbcda124f7292445d3ab1c1c417",
  }),
  brandingId: z.string().optional().openapi({
    description:
      "The identifier of the branding to use. If not provided, the default client branding will be used.",
  }),
  expires: z.coerce.number().min(0, invalidExpiresMessage).nullable().openapi({
    description: "The UTC timestamp at which this token will expire",
  }),
  session: z.string().openapi({
    description: `A unique reference for a session to scope this signature to. 
    For instance the session ref may be derived from a user id such that multiple tokens can access the same session.
    Or a different session ref may be issued for the same nodeRefs to sidestep any existing caches.`,
    example: "session-1",
  }),
  nodes: z
    .array(z.string())
    .optional()
    .openapi({
      description:
        "A list of references to nodes that this user has access to. If not provided, nodes will not be included in the generated token.",
      example: ["node-1", "node-2"],
      items: {
        type: "string",
        example: ["node-1"],
      },
    }),
});

export const generateAuthTokenResponse = z.object({
  token: z.string().openapi({
    description: "Authorisation token",
  }),
});

export const embedRequestParams = z.object({
  token: z.string().openapi({
    description: "The access token for this embedded context",
    example: "pk_test_TOKEN",
  }),
  from: z.string().date().optional().openapi({
    description: "The date to report performance calcs from",
    example: "2020-01-01",
  }),
  to: z.string().date().optional().openapi({
    description: "The date to report performance calcs to",
    example: "2021-01-01",
  }),
  currencyIsoCode: z.string().min(3).max(3).optional().openapi({
    description: "The currency iso code to report performance in",
    example: "GBP",
  }),
  investorExtRefs: z
    .array(z.string())
    .optional()
    .openapi({
      description: "A list of investor references to calculate performance for",
      example: ["inv-1", "inv-2"],
      items: {
        type: "string",
        example: ["inv-1"],
      },
    }),
  investorAccountExtRefs: z
    .array(z.string())
    .optional()
    .openapi({
      description:
        "A list of investor account references to calculate performance for",
      example: ["inv-acc-1", "inv-acc-2"],
      items: {
        type: "string",
        example: ["inv-acc-1"],
      },
    }),
});

export const serviceHealth = z.object({
  health: z.enum(["Healthy", "Unhealthy"]).openapi({
    description: "The health of the service",
  }),
  message: z.string().optional().openapi({
    description: "A message relating to the health of a service",
  }),
  error: z.string().optional().openapi({
    description: "The error associated with with an unhealthy service",
  }),
});

export const serviceHealthResponse = z.object({
  api: serviceHealth,
  database: serviceHealth,
  pubStorage: serviceHealth,
  azure: serviceHealth.openapi({ deprecated: true }),
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
    },
  });
}
