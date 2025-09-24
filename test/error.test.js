const { searchYouTube, getPlaylistItems } = require("../dist/main.js");

describe("Edge Cases / Error Handling", () => {
  it("should throw error for empty search query", async () => {
    await expect(searchYouTube("", { type: "video" })).rejects.toThrow();
  });

  it("should throw error for invalid playlist ID", async () => {
    await expect(getPlaylistItems("INVALID_ID")).rejects.toThrow();
  });

  it("should handle missing video author gracefully", async () => {
    const results = await searchYouTube("Rick Astley", {
      type: "video",
    });
    const video = results.videos.find((v) => v.type === "video");
    expect(video.author).not.toBeUndefined();
  });
});
