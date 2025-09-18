const { getVideoDetails } = require("../dist/main.js");

describe("getVideoDetails() API", () => {
  jest.setTimeout(20000); // YouTube calls can take time

  it("should fetch real details for a known video", async () => {
    const videoID = "dQw4w9WgXcQ"; // Rick Astley
    const details = await getVideoDetails(videoID);

    // Basic structure checks
    expect(details).toHaveProperty("id", videoID);
    expect(details).toHaveProperty("title");
    expect(details).toHaveProperty("description");
    expect(details).toHaveProperty("duration");
    expect(details).toHaveProperty("views");
    expect(details).toHaveProperty("uploadDate");
    expect(details).toHaveProperty("thumbnail.url");
    expect(details).toHaveProperty("channel.id");
    expect(details).toHaveProperty("channel.name");
    expect(details).toHaveProperty("watchUrl");

    // A few expectations on actual content (loosely matched)
    expect(details.title).toMatch(/Never Gonna Give You Up/i);
    expect(details.channel.name).toMatch(/Rick Astley/i);
    expect(details.watchUrl).toBe(`https://www.youtube.com/watch?v=${videoID}`);
  });
});
