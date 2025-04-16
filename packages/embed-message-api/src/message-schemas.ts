import { z } from "zod";

const commonFieldsSchema = z.object({
  messageTime: z.number(),
  message: z.string().optional(),
});

type CommonEmbedMessageFields = { messageTime: number; message?: string };

const initialisingSchema = z
  .object({
    type: z.literal("INITIALISING"),
  })
  .merge(commonFieldsSchema);

export type InitialisingEmbedMessage = {
  type: "INITIALISING";
} & CommonEmbedMessageFields;

const initialisingDoneSchema = z
  .object({
    type: z.literal("INITIALISING_DONE"),
  })
  .merge(commonFieldsSchema);
export type InitialisingDoneEmbedMessage = {
  type: "INITIALISING_DONE";
} & CommonEmbedMessageFields;

const renderingSchema = z
  .object({
    type: z.literal("RENDERING"),
  })
  .merge(commonFieldsSchema);
export type RenderingEmbedMessage = {
  type: "RENDERING";
} & CommonEmbedMessageFields;

const renderingDoneSchema = z
  .object({
    type: z.literal("RENDERING_DONE"),
  })
  .merge(commonFieldsSchema);
export type RenderingDoneEmbedMessage = {
  type: "RENDERING_DONE";
} & CommonEmbedMessageFields;

const userEventSchema = z
  .object({
    type: z.literal("USER_EVENT"),
    userEventTime: z.number().nullable(),
  })
  .merge(commonFieldsSchema);

export type UserEventEmbedMessage = {
  type: "USER_EVENT";
  userEventTime: number | null;
} & CommonEmbedMessageFields;

const userIdleSchema = z
  .object({
    type: z.literal("USER_IDLE"),
    lastActiveTime: z.number().nullable(),
  })
  .merge(commonFieldsSchema);
export type UserIdleEmbedMessage = {
  type: "USER_IDLE";
  lastActiveTime: number | null;
} & CommonEmbedMessageFields;

const errorSchema = z
  .object({
    type: z.literal("ERROR"),
    errorDigest: z.string().optional(),
  })
  .merge(commonFieldsSchema);
export type ErrorEmbedMessage = {
  type: "ERROR";
  errorDigest?: string;
} & CommonEmbedMessageFields;

export const embedMessageSchema = z.discriminatedUnion("type", [
  initialisingSchema,
  initialisingDoneSchema,
  renderingSchema,
  renderingDoneSchema,
  userEventSchema,
  userIdleSchema,
  errorSchema,
]);

export type EmbedMessage =
  | InitialisingEmbedMessage
  | InitialisingDoneEmbedMessage
  | RenderingEmbedMessage
  | RenderingDoneEmbedMessage
  | UserEventEmbedMessage
  | UserIdleEmbedMessage
  | ErrorEmbedMessage;
