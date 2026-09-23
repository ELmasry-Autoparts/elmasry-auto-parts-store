import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createLead, createWpcResearchRecord, listCatalogProducts, listRecentLeads, listWpcResearchRecords } from "./db";
import { buildMockWpcResult, createResearchId, normalizeOem, normalizeVin } from "@shared/wpcResearch";

const catalogFilters = z.object({
  query: z.string().trim().max(120).optional(),
  model: z.string().trim().max(96).optional(),
  category: z.string().trim().max(96).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.input(catalogFilters).query(({ input }) => listCatalogProducts(input)),
  }),
  leads: router({
    create: publicProcedure
      .input(z.object({
        query: z.string().trim().min(1).max(2000),
        mode: z.enum(["text", "code", "image", "vehicle"]).default("text"),
        productId: z.number().int().positive().optional(),
        name: z.string().trim().max(160).optional(),
        phone: z.string().trim().max(32).optional(),
        vin: z.string().trim().max(64).optional(),
        source: z.string().trim().max(48).default("storefront"),
      }))
      .mutation(({ ctx, input }) => createLead({ ...input, userId: ctx.user?.id ?? null })),
    recent: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional()).query(({ input }) => listRecentLeads(input?.limit)),
  }),
  admin: router({
    health: protectedProcedure.query(({ ctx }) => ({ ok: true, userId: ctx.user.id })),
    wpc: router({
      list: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional()).query(({ input }) => listWpcResearchRecords(input?.limit)),
      createResearch: adminProcedure
        .input(z.object({
          queryType: z.enum(["OEM", "VIN", "VEHICLE", "OEM_VEHICLE", "BATCH_OEM"]),
          originalQuery: z.string().trim().min(1).max(4000),
          vin: z.string().trim().max(64).optional(),
          vehicle: z.object({ brand: z.string().max(48).optional(), model: z.string().max(96).optional(), generation: z.string().max(96).optional(), year: z.string().max(24).optional(), engine: z.string().max(96).optional(), trim: z.string().max(96).optional(), market: z.string().max(96).optional() }).optional(),
          notes: z.string().trim().max(2000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const normalizedQuery = input.queryType === "OEM" || input.queryType === "OEM_VEHICLE"
            ? normalizeOem(input.originalQuery).normalizedOem
            : input.queryType === "VIN" ? normalizeVin(input.originalQuery) : input.originalQuery.trim();
          const result = buildMockWpcResult({ ...input, normalizedQuery });
          const researchId = createResearchId(new Date(), Math.floor(Date.now() % 1_000_000));
          return createWpcResearchRecord({
            researchId,
            queryType: input.queryType,
            originalQuery: input.originalQuery,
            normalizedQuery,
            vinRedacted: result.vinRedacted,
            status: result.status,
            confidence: result.confidence,
            source: result.source,
            sourceUrl: result.sourceUrl,
            resultJson: JSON.stringify(result),
            evidenceJson: JSON.stringify(result.evidence),
            notesJson: JSON.stringify([...(result.notes ?? []), ...(input.notes ? [input.notes] : [])]),
            createdBy: ctx.user.id,
          });
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
