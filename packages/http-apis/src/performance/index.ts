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
  from: z.string().date().optional().openapi({
    description: "The start date for calculating performance",
    example: "2020-01-01",
  }),
  to: z.string().date().optional().openapi({
    description: "The end date for calculating performance",
    example: "2021-01-01",
  }),
  currencyIsoCode: z.string().min(3).max(3).optional().openapi({
    description: "The currency ISO code to report performance in",
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

export const portfolioSummaryRequestParams = z.object({
  from: z.string().date().optional().openapi({
    description: "The start date for calculating the portfolio summary",
    example: "2020-01-01",
  }), // TODO: Should these be optional?
  to: z.string().date().optional().openapi({
    description: "The end date for calculating the portfolio summary",
    example: "2021-01-01",
  }), // TODO: Should these be optional?
  currencyIsoCode: z.string().min(3).max(3).optional().openapi({
    description: "The currency ISO code to report performance in",
    example: "GBP",
  }),
  // TODO: Parameters for calculating a specific portfolio summary.. portfolioId/investorIds/investorAccountids? Token?
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
  azure: serviceHealth,
});

// TODO: For all opf these, what is optional?
export const portfolioSummaryHoldingAllocation = z.object({
  assetTypes: z
    .string()
    .array()
    .openapi({ description: "A list of asset type classifications" }), // TODO: List of AssetType objects?
  regions: z.string().array().openapi({
    description: "A list of geographical regions represented in the portfolio",
  }), // TODO: List of Region objects?
  sectors: z.string().array().openapi({
    description: "A list of industry sectors represented in the portfolio",
  }), // TODO: List of Sector objects?
  fixedIncomeClass: z
    .string()
    .openapi({ description: "The classification of fixed income assets" }), // TODO: Correct type?
  creditRatings: z.string().array().openapi({
    description:
      "A list of credit ratings for the portfolio's fixed income assets",
  }), // TODO: Correct type?
});

export const portfolioSummarySinceInception = z.object({
  paidIn: z
    .number()
    .openapi({ description: "The total amount contributed since inception" }),
  withdrawals: z
    .number()
    .openapi({ description: "The total amount withdrawn since inception" }),
  capitalGainLoss: z.number().openapi({
    description: "The net capital gains or losses incurred since inception",
  }),
  interestIncomeReceived: z.number().openapi({
    description: "The total interest or income received since inception",
  }), // TODO: interestIncomeReceived or incomeReceived or interestReceived?
  currentValuation: z
    .number()
    .openapi({ description: "The current valuation as of now" }),
  return: z
    .number()
    .openapi({ description: "The total return achieved since inception" }),
  annualisedReturn: z.number().openapi({
    description:
      "The annualised return based on the entire duration since inception",
  }),
  volatility: z
    .number()
    .openapi({ description: "The volatility measurement since inception" }),
  maxDrawdown: z
    .number()
    .openapi({ description: "The maximum observed drawdown since inception" }),
});

export const portfolioSummaryForPeriod = z.object({
  initialValuation: z.number().openapi({
    description: "The starting valuation at the beginning of the period",
  }),
  paidIn: z
    .number()
    .openapi({ description: "The total amount contributed during the period" }),
  withdrawals: z
    .number()
    .openapi({ description: "The total amount withdrawn during the period" }),
  capitalGainLoss: z.number().openapi({
    description: "The net capital gains or losses incurred during the period",
  }),
  interestIncomeReceived: z.number().openapi({
    description: "The total interest or income received during the period",
  }),
  outgoingValuation: z
    .number()
    .openapi({ description: "The valuation at the end of the period" }),
  valuation: z.number().openapi({
    description: "The net valuation for the period, accounting for all changes",
  }), // TODO: Is this the same as outgoingValuation above?
  annualised: z.number().openapi({
    description: "The annualised valuation based on the period's data",
  }),
  volatility: z
    .number()
    .openapi({ description: "The volatility measurement for the period" }),
  maxDrawdown: z.number().openapi({
    description: "The maximum observed drawdown during the period",
  }),
});

export const portfolioSummaryHoldingInstrument = z.object({
  name: z
    .string()
    .openapi({ description: "The name of the financial instrument" }),
  cost: z
    .number()
    .openapi({ description: "The cost or purchase price of the instrument" }),
  category: z
    .string()
    .openapi({ description: "The category or type of the instrument" }), // TODO: Category object?
  weight: z.number().openapi({
    description: "The weight percentage of the instrument in the portfolio",
  }),
  value: z
    .number()
    .openapi({ description: "The current market value of the instrument" }),
  unrealisedGainLoss: z
    .number()
    .openapi({ description: "The unrealised gain or loss for the instrument" }),
  allocations: z.array(portfolioSummaryHoldingAllocation).openapi({
    description: "The allocation of the instrument within the portfolio",
  }),
});

export const portfolioSummaryHolding = z.object({
  modelName: z.string().openapi({ description: "The name of the model" }),
  modelCost: z
    .number()
    .openapi({ description: "The cost associated to the model" }),
  instruments: z.array(portfolioSummaryHoldingInstrument).openapi({
    description: "The list of instruments associated with the model",
  }),
});

export const portfolioSummary = z.object({
  owners: z
    .string()
    .array()
    .openapi({ description: "A list of owners associated with the portfolio" }), // TODO: List of Owner objects?
  wrapperType: z
    .string()
    .openapi({ description: "The type of investment wrapper" }),
  provider: z.string().openapi({
    description: "The name of the provider offering the portfolio", // TODO: Provider object?
  }),
  providerCost: z.number().openapi({
    description: "The cost charged by the provider for managing the portfolio",
  }),
  nickname: z
    .string()
    .openapi({ description: "A nickname or alias for the portfolio" }),
  planNumber: z
    .string()
    .openapi({ description: "A unique identifier for the portfolio plan" }),
  inceptionDate: z
    .string()
    .date()
    .openapi({ description: "The date when the portfolio was initiated" }),
  regularMonthlyPremiumsWithdrawals: z.number().openapi({
    description: "The amount of regular monthly premiums or withdrawals",
  }), // TODO: regularMonthlyPremiumsWithdrawals or regularMonthlyPremiums or regularMonthlyWithdrawals?
  holdings: z
    .array(portfolioSummaryHolding)
    .openapi({ description: "A list of holdings within the portfolio" }),
  sinceInception: portfolioSummarySinceInception.openapi({
    description: "Performance of the portfolio since its inception",
  }),
  forPeriod: portfolioSummaryForPeriod.openapi({
    description: "Performance of the portfolio for a specific period",
  }),
});

export function createPerformanceSwaggerFile(): oas31.OpenAPIObject {
  return createDocument({
    openapi: "3.1.0",
    info: {
      version: "0.1.0",
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
      {
        name: "summary",
        description: "Operations based around portfolio summaries",
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
      "/api/v1/portfolio-summary": {
        get: {
          tags: ["summary"],
          summary: "Retrieve the portfolio summary",
          operationId: "getPortfolioSummary",
          requestParams: {
            query: portfolioSummaryRequestParams,
          },
          responses: {
            "200": {
              description: "Successfully retrieved the portfolio summary",
              content: {
                "application/json": { schema: portfolioSummary },
              },
            },
            "400": {
              description: "Request failed to validate",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
            "401": {
              description: "Failed to authenticate",
              content: {
                "application/json": { schema: errorResponse },
              },
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": { schema: errorResponse },
              },
            }, // TODO: Is this possible?
            "500": {
              description: "Internal server error",
              content: {
                "application/json": { schema: errorResponse },
              },
            }, // TODO: Should we be including 500 responses in our swagger - ideally we (the developers) should always handle this but it may happen
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
