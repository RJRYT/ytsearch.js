# ytsearch.js

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

> 🔎 A simple and lightweight **YouTube search wrapper for Node.js**. Fetch YouTube video results without using the official API.

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
const ytsearch = require("ytsearch.js");

(async () => {
  const results = await ytsearch("Black Panther");
  results.slice(0, 5).forEach(video => {
    console.log(video.title, video.shortViewCount);
  });
})();
```

### ES Modules

```js
import ytsearch from "ytsearch.js";

const results = await ytsearch("Black Panther");
results.slice(0, 5).forEach(video => {
  console.log(video.title, video.shortViewCount);
});
```

### Example Output

```
Marvel Studios Black Panther - Official Trailer  50.5M
Wakanda Battle - I'm Not Dead Scene              19.9M
Hiding in the Shadows | The Real Black Panther   4.2M
Meet The K2 Black Panther – Best Tank            13K
Black Panther - Car Chase Scene (4K UHD)         428.8K
```

---

## 📑 API

`ytsearch(query: string): Promise<Array<Video>>`

### Video Object

Each search result returns:

```js
{
  type: "video",
  id: "dQw4w9WgXcQ",
  title: "Rick Astley - Never Gonna Give You Up",
  thumbnail: {
    url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg",
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
}
```
---

## 📖 Examples

Check the [`examples/`](./examples) folder for more usage demos, including filtering, pagination, and working with metadata.

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push branch (`git push origin feature/awesome`)
5. Create a Pull Request 🚀

---

## 📜 License

MIT © 2025 \[ytsearch.js contributors]

---

[npm-downloads-image]: https://badgen.net/npm/dm/ytsearch.js
[npm-downloads-url]: https://npmcharts.com/compare/ytsearch.js?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/ytsearch.js
[npm-install-size-url]: https://packagephobia.com/result?p=ytsearch.js
[npm-url]: https://npmjs.org/package/ytsearch.js
[npm-version-image]: https://badgen.net/npm/v/ytsearch.js
