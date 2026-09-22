const {
  searchYouTube,
  getPlaylistItems,
  getVideoDetails,
} = require("../dist/main.js");
// const { searchYouTube, getPlaylistItems, getVideoDetails } = require("ytsearch.js");

(async function testCJS() {
  try {
    const query = "lofi hip hop";
    console.log("\n=== CJS Video Search Test ===\n");
    const searchRes = await searchYouTube(query, {
      type: "video",
      sort: "view_count",
      limit: 30,
    });
    console.log("Metadata:", searchRes.metadata);
    console.log("Videos:", searchRes.videos.length);
    console.log("Channels:", searchRes.channels.length);
    console.log("Playlists:", searchRes.playlists.length);

    // Show first 3 videos
    searchRes.videos
      .slice(0, 3)
      .forEach((v, i) => console.log(`${i + 1}. ${v.title} (${v.url})`));

    console.log("First video details:", searchRes.videos[0] && {
      duration: searchRes.videos[0].duration,
      views: searchRes.videos[0].shortViewCount,
      publishedAt: searchRes.videos[0].publishedAt,
      thumbnail: searchRes.videos[0].thumbnail.url,
      channel: searchRes.videos[0].author?.name,
    });

    // Paginate
    if (searchRes.metadata.hasNextPage) {
      const nextPage = await searchRes.nextPage();
      console.log("\n=== Next Page ===\n");
      console.log("Videos:", nextPage.videos.length);
      console.log("Channels:", nextPage.channels.length);
      console.log("Playlists:", nextPage.playlists.length);
    }

    console.log("\n=== CJS Channel Search Test ===\n");
    const channels = await searchYouTube(query, {
      type: "channel",
      sort: "relevance",
      limit: 10,
    });
    channels.channels.forEach((c, i) => console.log(i + 1, c.title, c.url));

    console.log("\n=== CJS Mixed Search Test ===\n");
    const mixed = await searchYouTube(query, { type: "any", limit: 10 });
    console.log("Videos:", mixed.videos.length);
    console.log("Channels:", mixed.channels.length);
    console.log("Playlists:", mixed.playlists.length);

    console.log("\n=== CJS Default Search Options Test ===\n");
    const defaultSearch = await searchYouTube(query);
    console.log("Default options:", defaultSearch.metadata.searchType,
      defaultSearch.metadata.sortType, defaultSearch.metadata.userPageSize);

    console.log("\n=== CJS Remaining Video Sorts Test ===\n");
    for (const sort of ["upload_date", "rating"]) {
      const sorted = await searchYouTube(query, { type: "video", sort, limit: 10 });
      console.log(`${sort}:`, sorted.videos[0]?.title ?? "No results");
    }

    console.log("\n=== CJS Playlist Search Test ===\n");
    const playlists = await searchYouTube(query, {
      type: "playlist",
      sort: "view_count",
      limit: 10,
    });
    playlists.playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));

    console.log("\n=== CJS Movie Search Test ===\n");
    const movies = await searchYouTube("Marvel", { type: "movie", limit: 10 });
    movies.movies.forEach((m, i) => console.log(i + 1, m.title, m.duration, m.url));

    console.log("\n=== CJS Live Stream Search Test ===\n");
    const lives = await searchYouTube("lofi live", { type: "live", limit: 10 });
    lives.lives.forEach((live, i) => console.log(i + 1, live.title, live.isLive, live.url));

    console.log("\n=== CJS Playlist Pagination Test ===\n");
    const playlist = await getPlaylistItems(
      "PL6fhs6TSspZt_s0zL26NmFir5ATCF8w7G",
      { limit: 100 }
    );
    console.log("Playlist Info:", playlist.playlist);

    let page = playlist;
    let pageNum = 1;
    do {
      console.log(`\n--- Page ${pageNum} Videos ---\n`);
      page.videos.forEach((v) =>
        console.log(`${v.index}. ${v.title} (${v.url})`)
      );
      page = page.metadata.hasNextPage ? await page.nextPage() : null;
      pageNum++;
    } while (page);

    console.log("\n=== CJS Video Details Test ===\n");
    const videoDetails = await getVideoDetails("gz4dgq1Os1o");
    console.log(
      `${videoDetails.title} | ${videoDetails.viewsShort} Views | ${videoDetails.likesShort} Likes`
    );
    console.log("Video metadata:", {
      channel: videoDetails.channel.name,
      duration: videoDetails.duration,
      uploadDate: videoDetails.uploadDate,
      category: videoDetails.category,
      isLive: videoDetails.isLive,
      thumbnail: videoDetails.thumbnail.url,
    });

    console.log("\n=== CJS Validation Test ===\n");
    for (const [label, action] of [
      ["empty query", () => searchYouTube("", { type: "video" })],
      ["invalid search type", () => searchYouTube(query, { type: "invalidType" })],
      ["invalid sort", () => searchYouTube(query, { type: "video", sort: "invalidSort" })],
      ["invalid limit", () => searchYouTube(query, { type: "video", limit: 51 })],
      ["empty playlist ID", () => getPlaylistItems("")],
      ["empty video ID", () => getVideoDetails("")],
    ]) {
      try {
        await action();
      } catch (error) {
        console.log(`${label}:`, error.code, error.message);
      }
    }
    console.log("All pages fetched successfully.");
  } catch (err) {
    console.error("CJS Test Error:", err);
  }
})();
