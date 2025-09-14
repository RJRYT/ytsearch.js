# ytsearch.js

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

> 🔎 A simple and lightweight **YouTube search wrapper for Node.js**. Fetch YouTube **videos, channels, and playlists** without using the official API.

---

## 🚀 Installation

This package is available via [npm](https://www.npmjs.com/):

```bash
npm install ytsearch.js
```

Requires **Node.js v14+** (ESM supported).

---

## 📦 Usage

### CommonJS

```js
const { SearchYt } = require("ytsearch.js");

(async () => {
  const results = await SearchYt("Black Panther", { type: "video", limit: 5 });
  results.forEach((item) => console.log(item.type, item.title));
})();
```

### ES Modules

```js
import { SearchYt } from "ytsearch.js";

const results = await SearchYt("Black Panther", { type: "channel", limit: 3 });
results.forEach((item) => console.log(item.type, item.title));
```

---

## 📑 API

### Function

```ts
SearchYt(query: string, options?: {
  type?: "video" | "channel" | "playlist",
  sort?: "relevance" | "upload_date" | "view_count" | "rating",
  limit?: number
}): Promise<Array<Result>>
```

### Result Types

#### Video Object

```js
[
  {
    type: "video",
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    thumbnail: {
      url: 'https://i.ytimg.com/vi/XXXXX',
      width: 360,
      height: 202
    },
    viewCount: 1692378655,
    shortViewCount: "1.7B",
    duration: "3:34",
    seconds: 214,
    author: {
      name: "Rick Astley",
      url: "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
      verified: true
    },
    watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    publishedAt: "15 years ago"
  },
  ...
]
```

#### Channel Object

```js
[
  {
    type: "channel",
    id: "zjskdfj-nxs",
    title: "Rick Roll",
    thumbnail: {
      url: 'https://i.ytimg.com/vi/XXXXX',
      width: 360,
      height: 202
    },
    description: "rick roll...",
    subscriberCount: "3.2M",
    url: 'https://www.youtube.com/channel/XYZ',
    verified: true,
    isArtist: false
  },
  ...
]
```

#### Playlist Object

```js
[
  {
    type: "playlist",
    contentType: "vedio",
    id: "esxdrctfvygbhunj",
    title: "Rick Roll Mix",
    thumbnail: {
      url: 'https://i.ytimg.com/vi/XXXXX',
      width: 360,
      height: 202
    },
    videoCount: 50,
    author: {
      name: "Rick Roll",
      url: 'https://www.youtube.com/channel/XYZ',
      verified: true,
      isArtist: false
    },
    url: "https://www.youtube.com/playlist?list=XYZ123"
  },
  ...
]
```

---

## 📖 Examples

### Fetch videos

```js
const results = await SearchYt("lofi hip hop", { type: "video", limit: 3 });
```

### Fetch channels

```js
const channels = await SearchYt("lofi", { type: "channel", limit: 2 });
```

### Fetch playlists

```js
const playlists = await SearchYt("lofi study", { type: "playlist", limit: 2 });
```

### Sort by upload date

```js
const latest = await SearchYt("technology", {
  type: "video",
  sort: "upload_date",
  limit: 5,
});
```

---

## 📜 Playlist Pagination API

You can fetch playlist details and videos, with support for pagination.

```js
import { GetPlaylistVideos } from "ytsearch.js";

const playlist = await GetPlaylistVideos("PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY");

console.log(playlist.playlist); // Playlist info

// First page
playlist.videos.forEach((v) => console.log(v.title));

let page = playlist;
while (page.hasNextPage) {
  page = await page.nextPage();
  if (!page) break;
  page.videos.forEach((v) => console.log(v.title));
}
```

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
