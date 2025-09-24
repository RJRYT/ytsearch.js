# ytsearch.js

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM License][npm-license]][npm-url]
[![NPM Release Date][npm-last-update]][npm-url]
[![NPM Type Definitions][npm-ts-support]][npm-url]
[![Run Jest Tests][github-actions-test-image]][github-actions-test-url]
[![Node.js Package][github-actions-npm-publish-image]][github-actions-npm-publish-url]

> 🔎 A simple and lightweight **YouTube search wrapper for Node.js**. Fetch YouTube **videos, channels, playlists, movies, and live streams** without using the official API. Includes **playlist pagination support** with a clean developer-friendly API.

---

## 🚀 Installation

```bash
npm install ytsearch.js
```

Requires **Node.js v14+** (ESM supported).

---

## 📦 Usage

### CommonJS

```js
const { searchYouTube } = require("ytsearch.js");

(async () => {
  const results = await searchYouTube("Black Panther", { type: "video", limit: 5 });
  results.forEach((item) => console.log(item.type, item.title));
})();
```

### ES Modules

```js
import { searchYouTube } from "ytsearch.js";

const results = await searchYouTube("Black Panther", { type: "channel", limit: 3 });
results.forEach((item) => console.log(item.type, item.title));
```

---

## 📑 API

### `searchYouTube`

```ts
searchYouTube(query: string, options?: SearchOptions): Promise<SearchResult[]>;
```

#### Options

```ts
interface SearchOptions {
  type?: "video" | "channel" | "playlist" | "movie" | "live";
  sort?: "relevance" | "upload_date" | "view_count" | "rating";
  limit?: number;
}
```

#### Return Types

##### Video Object | Movie Object | Live Object

```json
{
  "type": "video",
  "id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "image": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "thumbnail": { "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "width": 360, "height": 202 },
  "viewCount": 1692378655,
  "shortViewCount": "1.7B",
  "duration": "3:34",
  "seconds": 214,
  "author": {
    "name": "Rick Astley",
    "url": "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
    "verified": true,
    "isArtist": false,
  },
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "publishedAt": "15 years ago",
  "isLive": false,
}
```

##### Channel Object

```json
{
  "type": "channel",
  "id": "UC1234567890",
  "title": "Rick Roll Channel",
  "image": "https://yt3.ggpht.com/ytc/AMLnZu-XXXXX=s176-c-k-c0x00ffffff-no-rj",
  "thumbnail": { "url": "https://yt3.ggpht.com/ytc/AMLnZu-XXXXX=s176-c-k-c0x00ffffff-no-rj", "width": 360, "height": 202 },
  "description": "All about Rick Rolls.",
  "subscriberCount": "3.2M",
  "url": "https://www.youtube.com/channel/UC1234567890",
  "verified": true,
  "isArtist": false
}
```

##### Playlist Object

```json
{
  "type": "playlist",
  "contentType": "video",
  "id": "PL1234567890",
  "title": "Rick Roll Mix",
  "image": "https://i.ytimg.com/vi/XXXXX/hqdefault.jpg",
  "thumbnail": { "url": "https://i.ytimg.com/vi/XXXXX/hqdefault.jpg", "width": 360, "height": 202 },
  "videoCount": 50,
  "author": {
    "name": "Rick Roll",
    "url": "https://www.youtube.com/channel/UC1234567890",
    "verified": true,
    "isArtist": false
  },
  "url": "https://www.youtube.com/playlist?list=PL1234567890"
}
```

---

### `getPlaylistItems`

Fetch a playlist with **videos and pagination support**.

```ts
getPlaylistItems(playlistId: string): Promise<PlaylistDetailsResult>;
```

#### PlaylistDetailsResult Object

```ts
interface PlaylistDetailsResult {
  playlist: PlaylistInfo;
  videos: PlaylistVideo[];
  hasNextPage: boolean;
  nextPage: () => Promise<PlaylistDetailsResult | null>;
}
```

#### PlaylistInfo

```json
{
  "id": "PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY",
  "title": "Lo-fi Hip Hop Mix",
  "description": "Best lo-fi hip hop tracks for study and relaxation.",
  "thumbnail": { "url": "https://i.ytimg.com/vi/XXXXX/hqdefault.jpg", "width": 360, "height": 202 },
  "image": "https://i.ytimg.com/vi/XXXXX/hqdefault.jpg",
  "author": {
    "name": "LoFi Girl",
    "url": "https://www.youtube.com/c/LofiGirl",
    "verified": true,
    "isArtist": false
  },
  "videoCount": "450",
  "viewsCount": "10M",
  "expectedPages": 5
}
```

#### PlaylistVideo

```json
{
  "type": "video",
  "id": "abc123",
  "index": "1",
  "title": "Lo-fi Chill Beat",
  "image": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  "thumbnail": { "url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg", "width": 360, "height": 202 },
  "views": "2.3M",
  "duration": "2:14",
  "seconds": 134,
  "author": { "name": "LoFi Artist", "url": "https://www.youtube.com/c/LoFiArtist" },
  "url": "https://www.youtube.com/watch?v=abc123",
  "publishedAt": "2 years ago"
}
```

---

### `getVideoDetails`

Fetch detailed metadata for a specific video by **video ID**.

```ts
getVideoDetails(videoID: string): Promise<VideoDetailsResult>;
```

#### VideoDetailsResult Object

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
  "description": "The official video for...",
  "duration": "3:33",
  "views": 1694616581,
  "viewsShort": "1.7B",
  "uploadDate": "October 25, 2009",
  "thumbnail": {
    "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "width": 480,
    "height": 360
  },
  "channel": {
    "id": "UCuAXFkgsw1L7xaCfnd5JJOw",
    "name": "Rick Astley",
    "url": "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
    "avatar": "https://yt3.ggpht.com/ytc/avatar.jpg",
    "subscribers": "5.3M",
    "verified": true,
    "isArtist": true
  },
  "likes": 18549001,
  "likesShort": "18.5M",
  "isLive": false,
  "isPrivate": false,
  "isUnlisted": false,
  "category": "Music",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "allowRatings": true
}
```

---

## 📖 Examples

### Fetch videos

```js
const results = await searchYouTube("lofi hip hop", { type: "video", limit: 3 });
```

### Fetch channels

```js
const channels = await searchYouTube("lofi", { type: "channel", limit: 2 });
```

### Fetch movies

```js
const movies = await searchYouTube("Marvel", { type: "movie", limit: 2 });
```

### Fetch live streams

```js
const lives = await searchYouTube("lofi live", { type: "live", limit: 1 });
```

### Fetch playlists

```js
const playlists = await searchYouTube("lofi study", { type: "playlist", limit: 2 });
```

### Sort by upload date

```js
const latest = await searchYouTube("technology", {
  type: "video",
  sort: "upload_date",
  limit: 5,
});
```

### Paginate a playlist

```js
import { getPlaylistItems } from "ytsearch.js";

const playlist = await getPlaylistItems("PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY");

console.log(playlist.playlist.title); // Playlist info

// First page
playlist.videos.forEach((v) => console.log(v.title));

let page = playlist;
while (page.hasNextPage) {
  page = await page.nextPage();
  if (!page) break;
  page.videos.forEach((v) => console.log(v.title));
}
```

### get video details by id

```js
import { getVideoDetails } from "ytsearch.js";

const details = await getVideoDetails("dQw4w9WgXcQ");

console.log(details.title);
console.log(details.channel.name);
console.log(details.viewsShort);
```

---

## ⚠️ Error Handling

All errors in `ytsearch.js` are standardized using the custom `YtSearchError` class. This makes it easy to differentiate error types programmatically.

### Example

<details>
<summary>Click to view example code</summary>

```js
import { searchYouTube } from "ytsearch.js";

searchYouTube("invalid query", { type: "video" })
  .then((results) => {
    console.log(results);
  })
  .catch((err) => {
    if (err.name === "YtSearchError") {
      console.error("Error Code:", err.code);
      console.error("Message:", err.message);
      console.error("Metadata:", err.metadata);
    } else {
      // Unexpected runtime error
      console.error("Unexpected error:", err);
    }
  });
```

</details>

### Error Codes

<details>
<summary>Click to view all possible error codes</summary>

```ts
export type YtSearchErrorCode =
  | "INVALID_QUERY"         // Search query is empty or invalid
  | "INVALID_TYPE"          // Invalid search type option
  | "INVALID_SORT"          // Invalid sort option
  | "INVALID_LIMIT"         // Invalid Limit Range
  | "PARSE_ERROR"           // Failed to parse YouTube data
  | "NO_RESULTS"            // No results found for the query
  | "RATE_LIMIT"            // YouTube rate-limited the request
  | "YOUTUBE_ERROR"         // General YouTube API/page error
  | "YOUTUBE_UNAVAILABLE"   // YouTube service is unavailable
  | "NETWORK_UNAVAILABLE"   // Network error (Axios)
  | "INVALID_PLAYLIST"      // Playlist ID is invalid
  | "NO_PLAYLIST_RESULTS"   // No videos found in playlist
  | "INVALID_VIDEO"         // Video ID is invalid
  | "UNKNOWN";              // Fallback for unclassified errors
```

</details>

### Metadata

Every `YtSearchError` may include a `metadata` object (like the request URL, params, or body) to assist debugging.

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push branch (`git push origin feature/awesome`)
5. Create a Pull Request 🚀

---

## 📜 License

MIT © 2025 RJRYT

---

[npm-downloads-image]: https://badgen.net/npm/dm/ytsearch.js
[npm-downloads-url]: https://npmcharts.com/compare/ytsearch.js?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/ytsearch.js
[npm-install-size-url]: https://packagephobia.com/result?p=ytsearch.js
[npm-url]: https://npmjs.org/package/ytsearch.js
[npm-version-image]: https://badgen.net/npm/v/ytsearch.js
[npm-license]: https://img.shields.io/npm/l/ytsearch.js
[npm-last-update]: https://img.shields.io/npm/last-update/ytsearch.js/latest?label=NPM%20Release%20Date
[npm-ts-support]: https://img.shields.io/npm/types/ytsearch.js
[github-actions-test-image]: https://github.com/RJRYT/ytsearch.js/actions/workflows/test.yml/badge.svg?branch=main
[github-actions-test-url]: https://github.com/RJRYT/ytsearch.js/actions/workflows/test.yml
[github-actions-npm-publish-image]: https://github.com/RJRYT/ytsearch.js/actions/workflows/npm-publish.yml/badge.svg
[github-actions-npm-publish-url]: https://github.com/RJRYT/ytsearch.js/actions/workflows/npm-publish.yml
