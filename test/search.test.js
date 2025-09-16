const { searchYouTube } = require("../dist/main.js");

describe("searchYouTube() API", () => {
  const query = "lofi hip hop";

  it("should fetch videos with default sort", async () => {
    const results = await searchYouTube(query, { type: "video", limit: 3 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => expect(r.type).toBe("video"));
  });

  it("should fetch channels", async () => {
    const results = await searchYouTube(query, { type: "channel", limit: 2 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => expect(r.type).toBe("channel"));
  });

  it("should fetch playlists", async () => {
    const results = await searchYouTube(query, { type: "playlist", limit: 2 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => expect(r.type).toBe("playlist"));
  });

  it("should support all sort options", async () => {
    const sorts = ["relevance", "upload_date", "view_count", "rating"];
    for (const sort of sorts) {
      const results = await searchYouTube(query, {
        type: "video",
        sort,
        limit: 1,
      });
      expect(results[0]).toHaveProperty("title");
    }
  });

  it("should throw error for empty query", async () => {
    await expect(searchYouTube("", { type: "video" })).rejects.toThrow(
      "Invalid search query"
    );
  });

  it("should throw error for invalid type", async () => {
    await expect(searchYouTube(query, { type: "invalidType" })).rejects.toThrow(
      "Invalid type option"
    );
  });

  it("should throw error for invalid sort", async () => {
    await expect(
      searchYouTube(query, { type: "video", sort: "invalidSort" })
    ).rejects.toThrow("Invalid sort option");
  });
});
