const { searchYouTube } = require("../dist/main.js");

describe("searchYouTube() API", () => {
  const query = "lofi hip hop";

  it("should fetch videos with default sort", async () => {
    const search = await searchYouTube(query, { type: "video", limit: 10 });
    expect(search.videos.length).toBeGreaterThan(0);
    search.videos.forEach((r) => expect(r.type).toBe("video"));
  });

  it("should fetch channels", async () => {
    const search = await searchYouTube(query, { type: "channel", limit: 10 });
    expect(search.channels.length).toBeGreaterThan(0);
    search.channels.forEach((r) => expect(r.type).toBe("channel"));
  });

  it("should fetch playlists", async () => {
    const search = await searchYouTube(query, { type: "playlist", limit: 10 });
    expect(search.playlists.length).toBeGreaterThan(0);
    search.playlists.forEach((r) => expect(r.type).toBe("playlist"));
  });

  it("should support all sort options", async () => {
    const sorts = ["relevance", "upload_date", "view_count", "rating"];
    for (const sort of sorts) {
      const search = await searchYouTube(query, {
        type: "video",
        sort,
        limit: 10,
      });
      expect(search.videos[0]).toHaveProperty("title");
    }
  });

  it("should paginate results correctly", async () => {
    const search = await searchYouTube(query, { type: "video", limit: 10 });
    expect(search.videos.length).toBe(10);

    // Fetch next page
    const nextBatch = await search.nextPage();
    expect(nextBatch.videos.length).toBeGreaterThan(0);
    expect(nextBatch.videos[0]).toHaveProperty("title");
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

  it("should throw error for invalid limit", async () => {
    await expect(
      searchYouTube(query, { type: "video", limit: 51 })
    ).rejects.toThrow("Invalid limit option");
  });
});
