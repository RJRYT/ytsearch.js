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
import { searchYouTube, getPlaylistItems, getVideoDetails } from "ytsearch.js";

// CommonJS
const { searchYouTube, getPlaylistItems, getVideoDetails } = require("ytsearch.js");
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

Fetch video details:

```js
const video = await getVideoDetails("dQw4w9WgXcQ");
console.log(video.title, video.author.name);
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

### 5️⃣ Get Video Details

* **File:** `examples/video-details.js`
* **Description:** Demonstrates fetching details of a single video by ID.
* **Features:**

  * Fetch full video metadata (title, id, duration, view count, author, published date, etc.)
  * Access thumbnails and watch URL

### 6️⃣ Search Movies

* **File:** `examples/search-movie.js`
* **Description:** Demonstrates searching for YouTube movies.
* **Features:**

  * Fetch movie details (title, id, description, duration, author)
  * Limit results
  * Access watch URL

### 7️⃣ Search Live Streams

* **File:** `examples/search-live.js`
* **Description:** Demonstrates searching for live streams.
* **Features:**

  * Fetch live stream details (title, id, author, concurrent viewers, isLive)
  * Limit results
  * Access watch URL

---

## ⚡ Developer Notes

* **searchYouTube** supports `type`, `sort` and `limit` options.
* **getPlaylistItems** provides a developer-friendly pagination API.
* **getVideoDetails** fetches detailed metadata for a specific video by ID.
* All functions return **strictly typed** objects:

  * `VideoResult`
  * `ChannelResult`
  * `PlaylistResult`
  * `PlaylistPage` (for paginated playlist videos)
  * `VideoDetails`

Refer to the respective example files for detailed implementation and testing of all features.
