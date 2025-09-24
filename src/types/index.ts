import { ExpectedSorts, ExpectedTypes } from "../utils/constants";

/* ============================================================================
 * 🔹 Common Types
 * These types are reused across multiple functions.
 * ============================================================================
 */

/**
 * Represents the raw YouTube API response (unstructured).
 */
export type RawResult = Record<string, any>;

/**
 * Allowed search types (derived from ExpectedTypes).
 * Example: "video", "channel", "playlist"
 */
export type SearchType = (typeof ExpectedTypes)[number];

/**
 * Allowed sort types (derived from ExpectedSorts).
 * Example: "relevance", "viewCount"
 */
export type SortType = (typeof ExpectedSorts)[number];

/**
 * Options for searching YouTube.
 */
export interface SearchOptions {
  type?: SearchType;
  sort?: SortType;
  limit?: number;
}

/**
 * Thumbnail object returned in YouTube results.
 */
export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

/**
 * Author / channel owner details.
 */
export interface Author {
  name: string;
  url: string;
  logo?: string;
  verified?: boolean;
  isArtist?: boolean;
}

/**
 * Common fields shared by all search result types.
 */
export interface BaseResult {
  id: string;
  title: string;
  image: string;
  thumbnail: Thumbnail;
  url: string;
}

/**
 * Extended base for results with authors (video/playlist).
 */
export interface BaseWithAuthor extends BaseResult {
  author: Author | null;
}

/* ============================================================================
 * 🔹 searchYouTube API
 * Returns search results for videos, channels, playlists, etc.
 * ============================================================================
 */

/**
 * Raw search response returned directly from YouTube.
 */
export interface RawSearchResult {
  apiToken: string;
  clientVersion: string;
  continueToken: string | null;
  result: RawResult[];
  estimatedResults: number;
}

/**
 * Expected extracted video result.
 */
export interface VideoResult extends BaseWithAuthor {
  type: "video";
  viewCount: number;
  shortViewCount: string;
  duration: string;
  seconds: number;
  publishedAt: string;
  isLive: boolean;
}

/**
 * Expected extracted channel result.
 */
export interface ChannelResult extends BaseResult {
  type: "channel";
  description: string;
  subscriberCount: string;
  verified: boolean;
  isArtist: boolean;
}

/**
 * Expected extracted playlist result.
 */
export interface PlaylistResult extends BaseWithAuthor {
  type: "playlist";
  contentType: string;
  videoCount: number;
}

/**
 * Metadata about the search results and pagination.
 */
export interface SearchResultMeta {
  estimatedPages: number;
  estimatedResults: number;
  hasNextPage: boolean;
  ytPage: number;
  ytPageSize: number;
  userPage: number;
  userPageSize: number;
  searchType: SearchType;
  sortType: SortType;
  query: string;
  resultRange: [number, number];
}

/**
 * Index to track how many results of each type have been fetched.
 */
export interface SearchResultIndex {
  videos: number;
  channels: number;
  playlists: number;
  movies: number;
  lives: number;
}

/**
 * Buffer to hold fetched results before final structuring.
 */
export interface SearchResultBuffer {
  videos: VideoResult[];
  channels: ChannelResult[];
  playlists: PlaylistResult[];
  movies: VideoResult[];
  lives: VideoResult[];
}

/**
 * Final structured search result with metadata and pagination.
 */
export interface SearchResult extends SearchResultBuffer {
  metadata: SearchResultMeta;
  nextPage: () => Promise<SearchResult | null>;
}

/* ============================================================================
 * 🔹 getPlaylistItems API
 * Returns playlist metadata and its videos.
 * ============================================================================
 */

/**
 * Raw playlist items result returned from YouTube.
 */
export interface RawPlaylistResult {
  apiToken: string;
  clientVersion: string;
  continueToken: string | null;
  playlistInfo?: RawResult | null;
  videos: RawResult[];
}

export interface PlaylistMetadata {
  ytPage: number;
  ytPageSize: number;
  userPage: number;
  userPageSize: number;
  hasNextPage: boolean;
  totalVideos: number;
  resultRange: [number, number];
  expectedPages: number;
}

/**
 * Playlist metadata extracted from YouTube.
 */
export interface PlaylistInfo extends BaseWithAuthor {
  description: string;
  videoCount: string;
  viewsCount: string;
}

/**
 * Extracted video item from a playlist.
 */
export interface PlaylistVideo extends BaseWithAuthor {
  type: "video";
  index: string;
  views: string;
  duration: string;
  seconds: number;
  publishedAt: string;
}

/**
 * Structured playlist details with pagination support.
 */
export interface PlaylistDetailsResult {
  playlist: PlaylistInfo;
  videos: PlaylistVideo[];
  metadata: PlaylistMetadata;
  nextPage: () => Promise<PlaylistDetailsResult | null>;
}

/* ============================================================================
 * 🔹 getVideoDetails API
 * Returns metadata for a single YouTube video.
 * ============================================================================
 */

/**
 * Raw video details returned directly from YouTube API response.
 */
export interface RawVideoDetails {
  videoDetails: RawResult;
  microFormat: RawResult;
  videoPrimaryInfo: RawResult;
  videoSecondaryInfo: RawResult;
}

/**
 * Parsed and simplified video details.
 */
export interface VideoDetailsResult extends BaseResult {
  description: string;
  duration: string;
  views: number;
  viewsShort: string;
  uploadDate: string;
  channel: {
    id: string;
    name: string;
    url: string;
    avatar: string;
    subscribers: string;
    verified: boolean;
    isArtist: boolean;
  };
  likes: number;
  likesShort: string;
  isLive: boolean;
  isPrivate: boolean;
  isUnlisted: boolean;
  category: string;
  allowRatings: boolean;
}
