# ytsearch.js

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM License][npm-license]][npm-url]
[![NPM Release Date][npm-last-update]][npm-url]
[![NPM Type Definitions][npm-ts-support]][npm-url]
[![Run Jest Tests][github-actions-test-image]][github-actions-test-url]
[![Node.js Package][github-actions-npm-publish-image]][github-actions-npm-publish-url]

> 🔎 A powerful yet lightweight **YouTube search wrapper for Node.js**. Fetch **videos, channels, playlists, movies, and live streams** effortlessly **without using the official API**. Supports **advanced playlist pagination with customizable user page limits**, detailed **video metadata fetching**, **sortable search results**, and **comprehensive error handling** — all via a **clean, developer-friendly API**.

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
  const results = await searchYouTube("Black Panther", {
    type: "video",
    limit: 5,
  });
  results.videos.forEach((item) => console.log(item.type, item.title));
})();
```

### ES Modules

```js
import { searchYouTube } from "ytsearch.js";

const results = await searchYouTube("Black Panther", {
  type: "channel",
  limit: 3,
});
results.channels.forEach((item) => console.log(item.type, item.title));
```

---

## 📑 Documentation

Full API documentation, examples, and error handling are available on the [GitHub Wiki](https://github.com/RJRYT/ytsearch.js/wiki).

---

## 📑 API

### `searchYouTube`

```ts
searchYouTube(query: string, options?: SearchOptions): Promise<SearchResult>;
```

#### Options

```ts
interface SearchOptions {
  type?: "video" | "channel" | "playlist" | "movie" | "live";
  sort?: "relevance" | "upload_date" | "view_count" | "rating";
  limit?: number;
}
```

> See Examples [Here](https://github.com/RJRYT/ytsearch.js/wiki/Examples)

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

> See Examples [Here](https://github.com/RJRYT/ytsearch.js/wiki/Examples)

---

### `getVideoDetails`

Fetch detailed metadata for a specific video by **video ID**.

```ts
getVideoDetails(videoID: string): Promise<VideoDetailsResult>;
```

> See Examples [Here](https://github.com/RJRYT/ytsearch.js/wiki/Examples)

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
