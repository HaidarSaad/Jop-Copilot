import { beforeEach, describe, expect, it } from "vitest";
import { storage } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns safe default values when nothing was saved", () => {
    expect(storage.getApiKey()).toBe("");
    expect(storage.getProvider()).toBe("groq");
    expect(storage.getOldCv()).toBe("");
    expect(storage.getDarkMode()).toBe(false);
  });

  it("saves and restores user data", () => {
    storage.setApiKey("test-key");
    storage.setOldCv("Candidate CV");
    storage.setDarkMode(true);

    expect(storage.getApiKey()).toBe("test-key");
    expect(storage.getOldCv()).toBe("Candidate CV");
    expect(storage.getDarkMode()).toBe(true);
  });

  it("persists values through the browser storage API", () => {
    storage.setProvider("anything");
    storage.setApiKey("gemini-key");

    expect(localStorage.getItem("jc_provider")).toBe(JSON.stringify("groq"));
    expect(localStorage.getItem("jc_api_key")).toBe(JSON.stringify("gemini-key"));
  });

  it("uses Groq when a provider is invalid", () => {
    storage.setProvider("invalid-provider");

    expect(storage.getProvider()).toBe("groq");
  });

  it("clears every stored value", () => {
    storage.setUpdatedCv("Updated CV");
    storage.setJobDescription("Job description");
    storage.setLanguage("en");
    localStorage.setItem("jc_rag_state_v1", JSON.stringify({ signature: "sig", updatedAt: Date.now(), chunks: [] }));
    storage.clearAll();

    expect(storage.getUpdatedCv()).toBe("");
    expect(storage.getJobDescription()).toBe("");
    expect(storage.getLanguage()).toBe("ar");
    expect(localStorage.getItem("jc_rag_state_v1")).toBeNull();
  });
});
