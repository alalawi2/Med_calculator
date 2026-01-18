import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createFeedback, getAllFeedback } from "./db";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  feedback: router({
    submit: publicProcedure
      .input(
        z.object({
          calculatorName: z.string(),
          rating: z.number().min(1).max(5),
          feedbackText: z.string().optional(),
          userEmail: z.string().email().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Save to database
        await createFeedback({
          calculatorName: input.calculatorName,
          rating: input.rating,
          feedbackText: input.feedbackText || null,
          userEmail: input.userEmail || null,
        });

        // Notify owner
        const notificationContent = `
Calculator: ${input.calculatorName}
Rating: ${input.rating}/5 stars
${input.feedbackText ? `Feedback: ${input.feedbackText}` : ""}
${input.userEmail ? `Email: ${input.userEmail}` : "Anonymous"}
        `;

        await notifyOwner({
          title: `New Feedback: ${input.calculatorName}`,
          content: notificationContent,
        });

        return { success: true };
      }),
    list: publicProcedure.query(async () => {
      return await getAllFeedback();
    }),
  }),
});

export type AppRouter = typeof appRouter;
