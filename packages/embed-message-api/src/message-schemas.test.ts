import { describe, expect, it } from "vitest";
import { embedMessageSchema } from "./message-schemas";

describe("embedMessageSchema", () => {
  const baseFields = { messageTime: Date.now() };

  describe("INITIALISING", () => {
    it("parses a valid INITIALISING message", () => {
      const msg = { type: "INITIALISING", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("INITIALISING");
      }
    });

    it("accepts optional message field", () => {
      const msg = {
        type: "INITIALISING",
        ...baseFields,
        message: "starting up",
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });
  });

  describe("INITIALISING_DONE", () => {
    it("parses a valid INITIALISING_DONE message", () => {
      const msg = { type: "INITIALISING_DONE", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("INITIALISING_DONE");
      }
    });
  });

  describe("RENDERING", () => {
    it("parses a valid RENDERING message", () => {
      const msg = { type: "RENDERING", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("RENDERING");
      }
    });
  });

  describe("RENDERING_DONE", () => {
    it("parses a valid RENDERING_DONE message", () => {
      const msg = { type: "RENDERING_DONE", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("RENDERING_DONE");
      }
    });
  });

  describe("USER_EVENT", () => {
    it("parses a valid USER_EVENT message with userEventTime", () => {
      const msg = {
        type: "USER_EVENT",
        ...baseFields,
        userEventTime: Date.now(),
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("USER_EVENT");
        expect(result.data).toHaveProperty("userEventTime");
      }
    });

    it("accepts null userEventTime", () => {
      const msg = {
        type: "USER_EVENT",
        ...baseFields,
        userEventTime: null,
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    it("rejects USER_EVENT without userEventTime", () => {
      const msg = { type: "USER_EVENT", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });
  });

  describe("USER_IDLE", () => {
    it("parses a valid USER_IDLE message", () => {
      const msg = {
        type: "USER_IDLE",
        ...baseFields,
        lastActiveTime: Date.now() - 60000,
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("USER_IDLE");
        expect(result.data).toHaveProperty("lastActiveTime");
      }
    });

    it("accepts null lastActiveTime", () => {
      const msg = {
        type: "USER_IDLE",
        ...baseFields,
        lastActiveTime: null,
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
    });

    it("rejects USER_IDLE without lastActiveTime", () => {
      const msg = { type: "USER_IDLE", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });
  });

  describe("ERROR", () => {
    it("parses a valid ERROR message", () => {
      const msg = { type: "ERROR", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("ERROR");
      }
    });

    it("accepts optional errorDigest", () => {
      const msg = {
        type: "ERROR",
        ...baseFields,
        errorDigest: "abc123",
      };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(true);
      if (result.success && result.data.type === "ERROR") {
        expect(result.data.errorDigest).toBe("abc123");
      }
    });
  });

  describe("invalid messages", () => {
    it("rejects unknown message types", () => {
      const msg = { type: "UNKNOWN_TYPE", ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    it("rejects messages without a type", () => {
      const msg = { ...baseFields };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    it("rejects messages without messageTime", () => {
      const msg = { type: "INITIALISING" };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    it("rejects non-numeric messageTime", () => {
      const msg = { type: "INITIALISING", messageTime: "not-a-number" };
      const result = embedMessageSchema.safeParse(msg);
      expect(result.success).toBe(false);
    });

    it("rejects completely empty objects", () => {
      const result = embedMessageSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects null", () => {
      const result = embedMessageSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("rejects strings", () => {
      const result = embedMessageSchema.safeParse("hello");
      expect(result.success).toBe(false);
    });
  });
});
