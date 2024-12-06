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
  expires: z.coerce.number().min(0, invalidExpiresMessage).nullable().openapi({
    description: "The UTC timestamp at which this token will expire",
  }),
  session: z.string().openapi({
    description: `A unique reference for a session to scope this signature to. 
    For instance the session ref may be derived from a user id such that multiple tokens can access the same session.
    Or a different session ref may be issued for the same nodeRefs to sidestep any existing caches.`,
    example: "session-1",
  }),
  nodes: z.array(z.string()).openapi({
    description: "A list of references to nodes that this user has access to",
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
  from: z.string().date().optional().nullable().openapi({
    description: "The date to report performance calcs from",
    example: "2020-01-01",
  }),
  to: z.string().date().optional().nullable().openapi({
    description: "The date to report performance calcs to",
    example: "2021-01-01",
  }),
  currencyIsoCode: z.string().min(3).max(3).optional().nullable().openapi({
    description: "The currency iso code to report performance in",
    example: "GBP",
  }),
  investorExtRefs: z
    .array(z.string())
    .optional()
    .nullable()
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
    .nullable()
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

export function createPerformanceSwaggerFile(): oas31.OpenAPIObject {
  return createDocument({
    openapi: "3.1.0",
    info: {
      version: "0.1.0",
      title: "Wealthsweet Performance API",
      description:
        "This is the wealthsweet performance api based on the OpenAPI 3.1 specification.",
    },
    tags: [
      {
        name: "embed",
        description: "Operations around embedded components",
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
          summary: "Generates an auth token.",
          description:
            "Generates an auth token, that authenticates the user and authorises access to specified resources.",
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
              description: "Invalid client id of secret",
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
              description: "Internal Server Error",
              content: {
                "application/json": { schema: errorResponse },
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
      },
    },
  });
}
