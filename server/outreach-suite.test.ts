import { describe, expect, it } from "vitest";
import {
  abExperiments,
  accountHealth,
  adapterConfigs,
  apiClients,
  automationJobs,
  learningEvents,
  messageTemplates,
  notificationRules,
  proxyRoutes,
  securityStatement,
  workspaceConfig,
} from "../drizzle/schema";

describe("outreach suite foundation", () => {
  it("exposes the configurable operations surfaces", () => {
    expect(workspaceConfig).toBeDefined();
    expect(adapterConfigs).toBeDefined();
    expect(automationJobs).toBeDefined();
    expect(accountHealth).toBeDefined();
    expect(messageTemplates).toBeDefined();
    expect(abExperiments).toBeDefined();
    expect(notificationRules).toBeDefined();
    expect(apiClients).toBeDefined();
    expect(proxyRoutes).toBeDefined();
    expect(learningEvents).toBeDefined();
  });

  it("keeps security controls explicit", () => {
    expect(securityStatement).toContain("No hidden backdoors");
    expect(securityStatement).toContain("audit logged");
  });
});
