import {
  fetchResultDataFromYT,
  fetchPlayListDataFromYT,
  fetchVideoDataFromYT,
} from "./fetch";
import { YtSearchError } from "./utils/errors";
import {
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
} from "./utils/constants";
import type {
  SearchOptions,
  SearchResult,
  RawResult,
  RawPlaylistResult,
  PlaylistDetailsResult,
  RawVideoDetails,
  VideoDetailsResult,
  RawSearchResult,
  VideoResult,
  ChannelResult,
  PlaylistResult,
  SearchType,
  SearchResultBuffer,
  SearchResultIndex,
  SearchResultMeta,
  PlaylistMetadata,
} from "./types";
import {
  FormatChannelObject,
  FormatPlayListInfoObject,
  FormatPlaylistObject,
  FormatPlaylistVedioObject,
  FormatVedioObject,
  FormatVideoObject,
  fetchPlaylistNextChunk,
  fetchSearchNextChunk,
} from "./helper";

/**
 * Searches YouTube for videos, channels, playlists, movies, or live streams and formats the results.
 *
 * @param query - The search query string (e.g. `"JavaScript tutorial"`).
 * @param options - Optional search options:
 * - `type` {"any" | "video" | "channel" | "playlist" | "movie" | "live"} - The type of content to search for.
 * - `sort` {string} - Sorting option (must be one of `ExpectedSorts`).
 * - `limit` {number} - Maximum number of results to return (between 10 and 50).
 * Defaults are taken from `DefaultOptions`.
 *
 * @returns {Promise<SearchResult>}
 * Resolves to a paginated result object containing extracted and normalized results:
 * - `videos`: Array of video results.
 * - `channels`: Array of channel results.
 * - `playlists`: Array of playlist results.
 * - `movies`: Array of movie results.
 * - `lives`: Array of live stream results.
 * - `metadata`: Metadata about the search (e.g., estimated results, pagination info).
 * - `nextPage`: A function to fetch the next page of results, or `null` if no more pages are available.
 *
 * @throws {YtSearchError}
 * - If `query` is not a non-empty string.
 * - If `options.type` is not one of `"any" | "video" | "channel" | "playlist" | "movie" | "live"`.
 * - If `options.sort` is not a valid sorting option.
 * - If `options.limit` is outside the allowed range (10-50).
 */
const searchYouTube = async (
  query: string,
  options: SearchOptions = DefaultOptions
): Promise<SearchResult> => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    throw new YtSearchError(
      "INVALID_QUERY",
      "Invalid search query. Must be a non-empty string.",
      {
        query,
      }
    );
  }

  options = { ...DefaultOptions, ...options };

  if (!ExpectedTypes.includes(options.type!)) {
    throw new YtSearchError(
      "INVALID_TYPE",
      `Invalid type option. Expected one of: ${ExpectedTypes.join(", ")}`,
      {
        options,
      }
    );
  }
  if (!ExpectedSorts.includes(options.sort!)) {
    throw new YtSearchError(
      "INVALID_SORT",
      `Invalid sort option.  Expected one of: ${ExpectedSorts.join(", ")}`,
      {
        options,
      }
    );
  }
  if (
    typeof options.limit !== "number" ||
    isNaN(options.limit) ||
    options.limit < 10 ||
    options.limit > 50
  ) {
    throw new YtSearchError(
      "INVALID_LIMIT",
      "Invalid limit option. It must be a number between 10 and 50.",
      { options }
    );
  }

  const userLimit: number = Math.max(10, Math.min(options.limit ?? 20, 50));
  const ytPageSize: number = 20; // YouTube gives ~20 items per chunk

  // Initial fetch
  const fetchResponse: RawSearchResult = await fetchResultDataFromYT(
    query,
    options
  );

  // Buffers
  const buffer: SearchResultBuffer = {
    videos: [],
    channels: [],
    playlists: [],
    movies: [],
    lives: [],
  };
  // Index trackers
  const lastIndex: SearchResultIndex = {
    videos: 0,
    channels: 0,
    playlists: 0,
    movies: 0,
    lives: 0,
  };

  let continuationToken = fetchResponse.continueToken;
  const metadata: SearchResultMeta = {
    estimatedPages: Math.ceil(fetchResponse.estimatedResults / ytPageSize), // Rough estimate
    estimatedResults: fetchResponse.estimatedResults, // From YT
    hasNextPage: !!continuationToken, // If YT provided a continuation token
    ytPage: 1, // To track YT pages fetched
    ytPageSize, // YT page size (usually ~20)
    userPage: 0, // To track user page for pagination
    userPageSize: userLimit, // User requested page size
    searchType: options.type!, // Search type
    sortType: options.sort!, // Sort type
    query, // Original search query
    resultRange: [0, 0], // To track result range
  };

  // Parser + filler
  const parseResults = (items: RawResult[], type: SearchType) => {
    if (["video", "movie", "live"].includes(type)) {
      return items
        .filter((i) => i.videoRenderer)
        .map((i) => FormatVedioObject(i.videoRenderer));
    }
    if (type === "channel") {
      return items
        .filter((i) => i.channelRenderer)
        .map((i) => FormatChannelObject(i.channelRenderer));
    }
    if (type === "playlist") {
      return items
        .filter((i) => i.lockupViewModel)
        .map((i) => FormatPlaylistObject(i.lockupViewModel));
    }
    return [];
  };
  const fillBuffer = (items: RawResult[]) => {
    if (options.type === "any" || options.type === "video")
      buffer.videos.push(...(parseResults(items, "video") as VideoResult[]));

    if (options.type === "any" || options.type === "channel")
      buffer.channels.push(
        ...(parseResults(items, "channel") as ChannelResult[])
      );

    if (options.type === "any" || options.type === "playlist")
      buffer.playlists.push(
        ...(parseResults(items, "playlist") as PlaylistResult[])
      );

    if (options.type === "movie")
      buffer.movies.push(...(parseResults(items, "movie") as VideoResult[]));

    if (options.type === "live")
      buffer.lives.push(...(parseResults(items, "live") as VideoResult[]));
  };
  fillBuffer(fetchResponse.result);

  const fetchNextYTPage = async () => {
    if (!continuationToken) return;
    const nextData = await fetchSearchNextChunk(
      fetchResponse.apiToken,
      continuationToken,
      fetchResponse.clientVersion
    );
    if (nextData) {
      metadata.ytPage++;
      fillBuffer(nextData.result);
      continuationToken = nextData.continueToken;
    }
  };

  const buildPage = async (): Promise<SearchResult> => {
    let videos: VideoResult[] = [];
    let channels: ChannelResult[] = [];
    let playlists: PlaylistResult[] = [];
    let movies: VideoResult[] = [];
    let lives: VideoResult[] = [];

    if (options.type === "any") {
      videos = buffer.videos.slice(lastIndex["videos"]);
      channels = buffer.channels.slice(lastIndex["channels"]);
      playlists = buffer.playlists.slice(lastIndex["playlists"]);

      while (
        videos.length + channels.length + playlists.length < userLimit &&
        continuationToken
      ) {
        await fetchNextYTPage();
        videos = buffer.videos.slice(lastIndex["videos"]);
        channels = buffer.channels.slice(lastIndex["channels"]);
        playlists = buffer.playlists.slice(lastIndex["playlists"]);
      }

      let _prevTotal =
        lastIndex["videos"] + lastIndex["channels"] + lastIndex["playlists"];

      lastIndex["videos"] += videos.length;
      lastIndex["channels"] += channels.length;
      lastIndex["playlists"] += playlists.length;

      let _currTotal =
        lastIndex["videos"] + lastIndex["channels"] + lastIndex["playlists"];

      metadata.resultRange = [_prevTotal, _currTotal];
    } else {
      const targetBuffer = buffer[
        (options.type + "s") as keyof typeof buffer
      ] as any[];
      while (
        targetBuffer.length < (metadata.userPage + 1) * userLimit &&
        continuationToken
      ) {
        await fetchNextYTPage();
      }
      const picked = targetBuffer.slice(
        metadata.userPage * userLimit,
        userLimit + metadata.userPage * userLimit
      );
      if (options.type === "video") videos = picked;
      if (options.type === "channel") channels = picked;
      if (options.type === "playlist") playlists = picked;
      if (options.type === "movie") movies = picked;
      if (options.type === "live") lives = picked;

      lastIndex[(options.type + "s") as keyof typeof lastIndex] +=
        picked.length;

      metadata.resultRange = [
        metadata.userPage * userLimit,
        userLimit + metadata.userPage * userLimit,
      ];
    }

    metadata.userPage++;
    metadata.hasNextPage = !!continuationToken;

    return {
      videos,
      channels,
      playlists,
      movies,
      lives,
      metadata,
      nextPage: async () => {
        if (!continuationToken) return null;
        return buildPage();
      },
    };
  };

  return buildPage();
};

/**
 * Fetches a YouTube playlist (metadata + items) and provides paginated access.
 *
 * @param playListID - The playlist ID (e.g. `"PLBCF2DAC6FFB574DE"`).
 * @param limit - Optional user page size (10-100, default 50).
 *
 * @returns {Promise<PlaylistDetailsResult>}
 * The first page of the playlist results. Includes playlist info, video list,
 * metadata, and methods for pagination:
 *
 * ```ts
 * {
 *   playlist: PlaylistInfo;
 *   videos: PlaylistVideo[];
 *   metadata: PlaylistMetadata;
 *   nextPage: () => Promise<PlaylistDetailsResult | null>;
 * }
 * ```
 *
 * - `playlist`: Normalized playlist info.
 * - `videos`: Array of formatted video objects.
 * - `metadata`: Pagination and page info (ytPage, userPage, totalVideos, expectedPages, resultRange, etc.).
 * - `nextPage()`: Loads the next page, or returns `null` if no continuation exists.
 *
 * @throws {YtSearchError}
 * - If `playListID` is not a non-empty string.
 * - If `limit` is outside the allowed range (10-100).
 * - If the playlist fetch fails or YouTube returns an invalid response.
 */
const getPlaylistItems = async (
  playListID: string,
  limit?: number
): Promise<PlaylistDetailsResult> => {
  if (typeof playListID !== "string" || playListID.trim() === "") {
    throw new YtSearchError(
      "INVALID_PLAYLIST",
      "Invalid playList ID. It must be a non-empty string.",
      { playListID }
    );
  }

  const userLimit = limit ?? 50; // default user page size
  if (userLimit < 10 || userLimit > 100) {
    throw new YtSearchError(
      "INVALID_LIMIT",
      "Limit must be between 10 and 100",
      { userLimit }
    );
  }

  try {
    const fetchResponse: RawPlaylistResult = await fetchPlayListDataFromYT(
      playListID
    );

    // Buffers
    let buffer: RawResult[] = [...fetchResponse.videos];
    let continuation = fetchResponse.continueToken;

    // Metadata tracker
    const metadata: PlaylistMetadata = {
      ytPage: 1, // fetched from YT
      ytPageSize: 100, // YouTube chunk size
      userPage: 0, // user-facing pages
      userPageSize: userLimit,
      hasNextPage: !!continuation || buffer.length > 0,
      totalVideos: 0,
      resultRange: [0, 0],
      expectedPages: 0,
    };

    const buildPage = async (): Promise<PlaylistDetailsResult> => {
      // Fill buffer until we can satisfy the userLimit
      while (buffer.length < userLimit && continuation) {
        const responseData = await fetchPlaylistNextChunk(
          fetchResponse.apiToken,
          continuation,
          fetchResponse.clientVersion
        );
        buffer.push(...responseData.videos);
        continuation = responseData.continueToken;
        metadata.ytPage++;
      }

      const batch = buffer.splice(0, userLimit);
      const start = metadata.userPage * userLimit;
      const end = start + batch.length;

      metadata.userPage++;
      metadata.resultRange = [start, end];
      metadata.hasNextPage = buffer.length > 0 || !!continuation;

      const playlist = FormatPlayListInfoObject(
        fetchResponse.playlistInfo,
        playListID
      );
      metadata.totalVideos = parseInt(playlist.videoCount, 10) || 0;
      metadata.expectedPages = Math.ceil(metadata.totalVideos / userLimit);

      const videos = batch.map((vid) =>
        FormatPlaylistVedioObject(vid.playlistVideoRenderer)
      );

      return {
        playlist,
        videos,
        metadata,
        nextPage: async () => {
          if (!buffer.length && !continuation) return null;
          return buildPage();
        },
      };
    };

    return buildPage();
  } catch (error) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in getPlaylistItems: ${String(error)}`,
      {
        playListID,
        originalError: error,
      }
    );
  }
};

/**
 * Fetches and formats full video details from YouTube.
 *
 * @param videoID - YouTube video ID (must be a non-empty string)
 * @returns A normalized {@link VideoDetailsResult} object containing
 *          parsed metadata (title, duration, views, channel info, etc.)
 *
 * @throws {YtSearchError} If the video ID is invalid, parsing fails,
 *         or network errors occur.
 *
 * @example
 * ```ts
 * const details = await getVideoDetails("dQw4w9WgXcQ");
 * console.log(details);
 * // {
 * //   id: "dQw4w9WgXcQ",
 * //   title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
 * //   description: "The official video for...",
 * //   duration: "3:33",
 * //   views: 1694616581,
 * //   viewsShort: '1.7B',
 * //   uploadDate: "October 25, 2009",
 * //   thumbnail: {
 * //     url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
 * //     width: 480,
 * //     height: 360
 * //   },
 * //   channel: {
 * //     id: "UCuAXFkgsw1L7xaCfnd5JJOw",
 * //     name: "Rick Astley",
 * //     url: "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
 * //     avatar: "https://yt3.ggpht.com/ytc/avatar.jpg",
 * //     subscribers: "5.3M",
 * //     verified: true,
 * //     isArtist: true
 * //   },
 * //   likes: 18549001,
 * //   likesShort: '18.5M',
 * //   isLive: false,
 * //   isPrivate: false,
 * //   isUnlisted: false,
 * //   category: "Music",
 * //   url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 * //   allowRatings: true
 * // }
 * ```
 */
const getVideoDetails = async (
  videoID: string
): Promise<VideoDetailsResult> => {
  if (typeof videoID !== "string" || videoID.trim() === "") {
    throw new YtSearchError(
      "INVALID_VIDEO",
      "Invalid video ID. It must be a non-empty string.",
      { videoID }
    );
  }

  try {
    const fetchResponse: RawVideoDetails = await fetchVideoDataFromYT(videoID);
    return FormatVideoObject(fetchResponse, videoID);
  } catch (error) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in getVideoDetails: ${String(error)}`,
      {
        videoID,
        originalError: error,
      }
    );
  }
};

export default searchYouTube;

export {
  searchYouTube,
  getPlaylistItems,
  getVideoDetails,
  DefaultOptions,
  ExpectedTypes,
  ExpectedSorts,
  YtSearchError,
};

export type {
  SearchOptions,
  SearchType,
  SortType,
  VideoResult,
  ChannelResult,
  PlaylistResult,
  SearchResultMeta,
  SearchResult,
  PlaylistMetadata,
  PlaylistInfo,
  PlaylistVideo,
  PlaylistDetailsResult,
  VideoDetailsResult,
} from "./types";
