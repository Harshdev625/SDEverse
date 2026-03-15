import { extractMentions, formatMentions } from "../../../utils/mentionUtils";

describe("mentionUtils", () => {
  it("formats @mentions into profile links", () => {
    const text = "Hello @harshdev and @sde_verse";
    const formatted = formatMentions(text);

    expect(formatted).toContain('href="/profile/harshdev"');
    expect(formatted).toContain('href="/profile/sde_verse"');
  });

  it("extracts all mentions without @", () => {
    const text = "Thanks @alice and @bob_123 for help";
    const mentions = extractMentions(text);

    expect(mentions).toEqual(["alice", "bob_123"]);
  });

  it("handles empty input safely", () => {
    expect(formatMentions("")).toBe("");
    expect(extractMentions("")).toEqual([]);
  });
});
