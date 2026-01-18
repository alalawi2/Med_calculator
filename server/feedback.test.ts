import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as notification from "./_core/notification";

// Mock the database and notification functions
vi.mock("./db", () => ({
  createFeedback: vi.fn(),
  getAllFeedback: vi.fn(),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("feedback.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully submits feedback with all fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.createFeedback).mockResolvedValue(undefined as any);
    vi.mocked(notification.notifyOwner).mockResolvedValue(true);

    const result = await caller.feedback.submit({
      calculatorName: "qSOFA Score",
      rating: 5,
      feedbackText: "Great calculator!",
      userEmail: "test@example.com",
    });

    expect(result).toEqual({ success: true });
    expect(db.createFeedback).toHaveBeenCalledWith({
      calculatorName: "qSOFA Score",
      rating: 5,
      feedbackText: "Great calculator!",
      userEmail: "test@example.com",
    });
    expect(notification.notifyOwner).toHaveBeenCalledWith({
      title: "New Feedback: qSOFA Score",
      content: expect.stringContaining("qSOFA Score"),
    });
  });

  it("successfully submits feedback with only required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.createFeedback).mockResolvedValue(undefined as any);
    vi.mocked(notification.notifyOwner).mockResolvedValue(true);

    const result = await caller.feedback.submit({
      calculatorName: "APACHE II",
      rating: 4,
    });

    expect(result).toEqual({ success: true });
    expect(db.createFeedback).toHaveBeenCalledWith({
      calculatorName: "APACHE II",
      rating: 4,
      feedbackText: null,
      userEmail: null,
    });
  });

  it("rejects invalid rating (too low)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.feedback.submit({
        calculatorName: "qSOFA Score",
        rating: 0,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid rating (too high)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.feedback.submit({
        calculatorName: "qSOFA Score",
        rating: 6,
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.feedback.submit({
        calculatorName: "qSOFA Score",
        rating: 5,
        userEmail: "invalid-email",
      })
    ).rejects.toThrow();
  });
});

describe("feedback.list", () => {
  it("returns all feedback from database", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const mockFeedback = [
      {
        id: 1,
        calculatorName: "qSOFA Score",
        rating: 5,
        feedbackText: "Great!",
        userEmail: "test@example.com",
        createdAt: new Date(),
      },
      {
        id: 2,
        calculatorName: "APACHE II",
        rating: 4,
        feedbackText: null,
        userEmail: null,
        createdAt: new Date(),
      },
    ];

    vi.mocked(db.getAllFeedback).mockResolvedValue(mockFeedback);

    const result = await caller.feedback.list();

    expect(result).toEqual(mockFeedback);
    expect(db.getAllFeedback).toHaveBeenCalled();
  });

  it("returns empty array when no feedback exists", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getAllFeedback).mockResolvedValue([]);

    const result = await caller.feedback.list();

    expect(result).toEqual([]);
  });
});
