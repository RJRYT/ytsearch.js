const { getVideoDetails, YtSearchError } = require("../dist/main.js");

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
    expect(details).toHaveProperty("url");

    // A few expectations on actual content (loosely matched)
    expect(details.title).toMatch(/Never Gonna Give You Up/i);
    expect(details.channel.name).toMatch(/Rick Astley/i);
    expect(details.url).toBe(`https://www.youtube.com/watch?v=${videoID}`);
  });

  it("should throw YOUTUBE_ERROR for a private video", async () => {
    const privateVideoID = "qvO4z0LzW8E"; 
    await expect(getVideoDetails(privateVideoID)).rejects.toThrow(
      YtSearchError
    );
    await expect(getVideoDetails(privateVideoID)).rejects.toMatchObject({
      code: "YOUTUBE_ERROR",
    });
  });

  it("should throw YOUTUBE_ERROR for an invalid video ID", async () => {
    const invalidVideoID = "invalid12345";
    await expect(getVideoDetails(invalidVideoID)).rejects.toThrow(
      YtSearchError
    );
    await expect(getVideoDetails(invalidVideoID)).rejects.toMatchObject({
      code: "YOUTUBE_ERROR",
    });
  });

  it("should throw INVALID_VIDEO for an empty video ID", async () => {
    await expect(getVideoDetails("")).rejects.toThrow(YtSearchError);
    await expect(getVideoDetails("")).rejects.toMatchObject({
      code: "INVALID_VIDEO",
    });
  });
});
