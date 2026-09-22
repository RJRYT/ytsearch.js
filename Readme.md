# ytsearch.js — YouTube Search & Playlist Scraper for Node.js

> **ytsearch.js** is a TypeScript and Node.js library for searching YouTube videos, channels, playlists, movies, and live streams. It also provides video details and paginated playlist data without requiring the official YouTube Data API.

Built for developers who need a YouTube search library, playlist scraper, video metadata scraper, or YouTube Data API alternative for Node.js and TypeScript.

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM License][npm-license]][npm-url]
[![NPM Release Date][npm-last-update]][npm-url]
[![NPM Type Definitions][npm-ts-support]][npm-url]
[![Run Jest Tests][github-actions-test-image]][github-actions-test-url]
[![Node.js Package][github-actions-npm-publish-image]][github-actions-npm-publish-url]

---

## 🚀 Installation

```bash
npm install ytsearch.js
```

Requires **Node.js v14+** (ESM supported).

---

## Features

- Search YouTube videos, channels, playlists, movies, and live streams
- Fetch YouTube playlist items with pagination
- Get detailed YouTube video metadata
- Use TypeScript types with CommonJS and ESM support
- Search YouTube without an official YouTube Data API key
- Control result limits and sorting
---

## 📦 Usage

### CommonJS

```js
const { searchYouTube } = require("ytsearch.js");

(async () => {
  const results = await searchYouTube("Black Panther", {
    type: "video",
    limit: 10,
  });
  results.videos.forEach((item) => console.log(item.type, item.title));
})();
```

### ES Modules

```js
import { searchYouTube } from "ytsearch.js";

const results = await searchYouTube("Black Panther", {
  type: "channel",
  limit: 10,
});
results.channels.forEach((item) => console.log(item.type, item.title));
```

---

## 📚 Documentation

Full API documentation, usage examples, TypeScript types, and error handling are available in the [ytsearch.js GitHub Wiki](https://github.com/RJRYT/ytsearch.js/wiki).

---

## 🖥️ Command-Line Interface

Need to use YouTube search directly from your terminal?

Check out [ytsearch-cli](https://www.npmjs.com/package/ytsearch-cli), the command-line interface powered by ytsearch.js.

---

## 📑 API

### YouTube Search API — `searchYouTube`

```ts
searchYouTube(query: string, options?: SearchOptions): Promise<SearchResult>;
```

#### Search Options

```ts
interface SearchOptions {
  type?: "video" | "channel" | "playlist" | "movie" | "live" | "any";
  sort?: "relevance" | "upload_date" | "view_count" | "rating";
  limit?: number; // 10–50 (default: 20)
}
```

#### Result

```ts
interface SearchResult {
  videos: VideoResult[];
  channels: ChannelResult[];
  playlists: PlaylistResult[];
  movies: VideoResult[];
  lives: VideoResult[];
  metadata: SearchMetadata;
  nextPage: () => Promise<SearchResult | null>;
}
```

- If `type` is **specific** (`video`, `channel`, etc.), only that array will be filled.
- If `type` is **any**, results include `videos`, `channels`, and `playlists`. (`movies` and `lives` are grouped under `videos`).

> ✅ Page size is limited to **10–50** to prevent excessive YouTube requests. Requests are buffered intelligently — YouTube is queried only when needed.

---

### Get YouTube Playlist Items — `getPlaylistItems`

Fetch a playlist with **videos and pagination support**.

```ts
getPlaylistItems(playlistId: string, options?: PlaylistOptions): Promise<PlaylistDetailsResult>;
```

#### Playlist Options

```ts
interface PlaylistOptions {
  limit?: number; // 10–100 (default: 50)
}
```

#### PlaylistDetailsResult Object

```ts
interface PlaylistDetailsResult {
  playlist: PlaylistInfo;
  videos: PlaylistVideo[];
  metadata: PlaylistMetadata;
  nextPage: () => Promise<PlaylistDetailsResult | null>;
}
```

Metadata includes YouTube page tracking, user page size, and total video count.

---

### Get YouTube Video Details — `getVideoDetails`

Fetch detailed metadata for a specific video by **video ID**.

```ts
getVideoDetails(videoID: string): Promise<VideoDetailsResult>;
```

---

## FAQ

### Does ytsearch.js require a YouTube Data API key?

No. ytsearch.js fetches publicly available YouTube page data and does not require an official YouTube Data API key.

### Can I fetch videos from a YouTube playlist?

Yes. Use `getPlaylistItems()` to retrieve playlist metadata and videos. Large playlists support pagination through `nextPage()`.

### Does ytsearch.js support TypeScript?

Yes. The package includes TypeScript declarations and supports both CommonJS and ESM imports.

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push branch (`git push origin feature/awesome`)
5. Create a Pull Request 🚀

---

## 📜 License

MIT © 2026 RJRYT

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
