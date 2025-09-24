import {
  searchYouTube,
  getPlaylistItems,
  getVideoDetails,
} from "../dist/main.mjs";
// import { searchYouTube, getPlaylistItems, getVideoDetails } from "ytsearch.js";

(async function testESM() {
  try {
    const query = "fejo official channel";
    console.log("=== ESM Video Search Test ===");
    const res = await searchYouTube(query, {
      type: "any",
      limit: 43,
    });
    console.log("=== First Page === metadata:", res.metadata);
    console.log("------------------------------------------------------------");
    console.log("Playlists:", res.playlists.length);
    // console.log("------------------------------------------------------------");
    // res.playlists.forEach((v, i) => console.log(i + 1, v.title, v.url));
    console.log("------------------------------------------------------------");
    console.log("Videos:", res.videos.length);
    // console.log("------------------------------------------------------------");
    // res.videos.forEach((v, i) => console.log(i + 1, v.title, v.url));
    console.log("------------------------------------------------------------");
    console.log("Channels:", res.channels.length);
    console.log("------------------------------------------------------------");
    // res.channels.forEach((v, i) => console.log(i + 1, v.title, v.url));
    /*console.log("------------------------------------------------------------");
    console.log("Movies:", res.movies.length);
    console.log("------------------------------------------------------------");
    res.movies.forEach((v, i) => console.log(i + 1, v.title, v.url));
    console.log("------------------------------------------------------------");
    console.log("Lives:", res.lives.length);
    console.log("------------------------------------------------------------");
    res.lives.forEach((v, i) => console.log(i + 1, v.title, v.url));*/
    for (let i = 0; i < 5; i++) {
      if (res.metadata.hasNextPage) {
        const nextPage = await res.nextPage();
        if (!nextPage) break;
        console.log("=== Next Page === metadata:", res.metadata);
        console.log(
          "------------------------------------------------------------"
        );
        console.log("Playlists:", nextPage.playlists.length);
        // console.log(
        //   "------------------------------------------------------------"
        // );
        // nextPage.playlists.forEach((v, i) =>
        //   console.log(i + 1, v.title, v.url)
        // );
        console.log(
          "------------------------------------------------------------"
        );
        console.log("Videos:", nextPage.videos.length);
        // console.log(
        //   "------------------------------------------------------------"
        // );
        // nextPage.videos.forEach((v, i) =>
        //   console.log(i + 1, v.title, v.url)
        // );
        console.log(
          "------------------------------------------------------------"
        );
        console.log("Channels:", nextPage.channels.length);
        console.log(
          "------------------------------------------------------------"
        );
        // nextPage.channels.forEach((v, i) => console.log(i + 1, v.title, v.url));
        /*console.log(
          "------------------------------------------------------------"
        );
        console.log("Movies:", nextPage.movies.length);
        console.log(
          "------------------------------------------------------------"
        );
        nextPage.movies.forEach((v, i) => console.log(i + 1, v.title, v.url));
        console.log(
          "------------------------------------------------------------"
        );
        console.log("Lives:", nextPage.lives.length);
        console.log(
          "------------------------------------------------------------"
        );
        nextPage.lives.forEach((v, i) => console.log(i + 1, v.title, v.url));*/
      }
    }
    /*
    console.log("\n=== ESM Channel Search Test ===");
    const channels = await searchYouTube(query, {
      type: "channel",
      sort: "relevance",
      limit: 2,
    });
    channels.forEach((c, i) => console.log(i + 1, c.title, c.url));

    console.log("\n=== ESM Playlist Search Test ===");
    const playlists = await searchYouTube(query, {
      type: "playlist",
      sort: "view_count",
      limit: 2,
    });
    playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));

    console.log("\n=== ESM Playlist Pagination Test ===");
    const playlist = await getPlaylistItems(
      "PL6fhs6TSspZt_s0zL26NmFir5ATCF8w7G"
    );
    console.log("Playlist Info:", playlist.playlist);

    let page = playlist;
    let pageNum = 1;
    do {
      console.log(`\n--- Page ${pageNum} Videos ---`);
      page.videos.forEach((v) =>
        console.log(`${v.index}. ${v.title} (${v.url})`)
      );
      page = page.hasNextPage ? await page.nextPage() : null;
      pageNum++;
    } while (page);

    console.log("\n=== ESM Video Details Test ===");
    const videoDetails = await getVideoDetails("jfKfPfyJRdk");
    console.log(
      `${videoDetails.title} | ${videoDetails.viewsShort} Views | ${videoDetails.likesShort} Likes`
    );
    console.log("All pages fetched successfully.");*/
  } catch (err) {
    console.error("ESM Test Error:", err);
  }
})();
