# ytsearch.js - Examples Guide

This document provides references to the example usage files for **ytsearch.js**.

## 🔹 Quick Start Cheat Sheet

Install the package:

```bash
npm install ytsearch.js
```

Import functions:

```js
// ESM
import { searchYouTube, getPlaylistItems } from "ytsearch.js";

// CommonJS
const { searchYouTube, getPlaylistItems } = require("ytsearch.js");
```

Perform a basic search:

```js
const results = await searchYouTube("lofi hip hop", { type: "video", limit: 5 });
results.forEach(r => console.log(r.title, r.type));
```

Fetch a playlist with pagination:

```js
const playlist = await getPlaylistItems("PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY");
console.log(playlist.playlist.title);
```

## 📌 Available Examples

### 1️⃣ Search Videos

* **File:** `examples/search-video.js`
* **Description:** Demonstrates searching for videos with optional sorting (`view_count`, `upload_date`, etc.) and limit.
* **Features:**

  * Search by query
  * Limit results
  * Sort results
  * Access video details (title, id, thumbnail, author, views, duration, watch URL)

### 2️⃣ Search Channels

* **File:** `examples/search-channel.js`
* **Description:** Demonstrates searching for channels.
* **Features:**

  * Fetch channel details (name, id, subscriber count, URL, verified, isArtist)
  * Limit results

### 3️⃣ Search Playlists

* **File:** `examples/search-playlist.js`
* **Description:** Demonstrates searching for playlists.
* **Features:**

  * Fetch playlist details (title, id, author, thumbnail, video count)
  * Limit results

### 4️⃣ Playlist Pagination

* **File:** `examples/playlist-pagination.js`
* **Description:** Demonstrates fetching a playlist and handling pagination to get all pages.
* **Features:**

  * Retrieve first page of playlist videos
  * Automatically fetch next pages using `nextPage()`
  * Access video details for each page
  * Calculate `expectedPages` from playlist video count

## ⚡ Developer Notes

* **searchYouTube** supports `type` (`video`, `channel`, `playlist`) and `sort` options.
* **getPlaylistItems** provides a developer-friendly pagination API.
* All functions return **strictly typed** objects:

  * `VideoResult`
  * `ChannelResult`
  * `PlaylistResult`
  * `PlaylistPage` (for paginated playlist videos)

Refer to the respective example files for detailed implementation and testing of all features.
