import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("catalog persistence contracts", () => {
  it("returns a list for a public catalog query", async () => {
    const result = await appRouter.createCaller(createContext()).catalog.list({
      query: "توسان",
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects an empty lead query before writing", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.leads.create({ query: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("protects recent leads behind the admin procedure", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.leads.recent({ limit: 5 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
