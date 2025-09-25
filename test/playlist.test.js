const { getPlaylistItems } = require("../dist/main.js");

jest.setTimeout(20000);

describe("getPlaylistItems() API", () => {
  const playlistID1 = "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo"; //playlist with 960 videos
  const playlistID2 = "PLt7bG0K25iXj2h1eql20RZIPB_2CtK659"; //playlist with 60 videos

  it("should fetch first page playlist", async () => {
    const page = await getPlaylistItems(playlistID1);
    expect(page.playlist).toHaveProperty("title");
    expect(page.videos.length).toBeGreaterThan(0);
    expect(page.metadata.expectedPages).toBeGreaterThanOrEqual(1);
  });

  it("should fetch all pages using nextPage()", async () => {
    let page = await getPlaylistItems(playlistID1);
    const allVideos = [...page.videos];
    while (page.metadata.hasNextPage) {
      page = await page.nextPage();
      if (!page) break;
      allVideos.push(...page.videos);
    }
    expect(allVideos.length).toBeGreaterThanOrEqual(page.videos.length);
  });

  it("should return null for nextPage() when no more pages", async () => {
    const page = await getPlaylistItems(playlistID2, 100);
    while (page.metadata.hasNextPage) {
      page = await page.nextPage();
    }
    const next = await page.nextPage();
    expect(next).toBeNull();
  });

  it("should throw error for invalid playlist ID", async () => {
    await expect(getPlaylistItems("")).rejects.toThrow("Invalid playList ID");
  });
});
