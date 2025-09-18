import { ExpectedSorts, ExpectedTypes } from "../utils/constants";

/**
 * Raw YouTube Search Result Type (before extraction)
 */
export type RawSearchResult = Record<string, unknown>;

/**
 * Expected extracted playlist items result
 */
export interface SearchPlaylistResponse {
  apiToken: string;
  clientVersion: string;
  continueToken: string | null;
  playlistInfo?: object | null;
  videos: RawSearchResult[];
};

/**
 * playlist search response types
 */
export type SearchPlaylistType = SearchPlaylistResponse;

/**
 * Allowed search types
 */
export type SearchType = (typeof ExpectedTypes)[number];

/**
 * Allowed sort types
 */
export type SortType = (typeof ExpectedSorts)[number];

/**
 * Options for searching YouTube
 */
export interface SearchOptions {
  type?: SearchType;
  sort?: SortType;
  limit?: number;
}

/**
 * Thumbnail object
 */
export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

/**
 * Author object
 */
export interface Author {
  name: string;
  url: string;
  logo?: string;
  verified?: boolean;
  isArtist?: boolean;
}

/**
 * Expected extracted vedio result
 */
export interface VideoResult {
  type: "video";
  id: string;
  title: string;
  image: string;
  thumbnail: Thumbnail;
  viewCount: number;
  shortViewCount: string;
  duration: string;
  seconds: number;
  author: Author | null;
  watchUrl: string;
  publishedAt: string;
}

/**
 * Expected extracted channel result
 */
export interface ChannelResult {
  type: "channel";
  id: string;
  title: string;
  image: string;
  thumbnail: Thumbnail;
  description: string;
  subscriberCount: string;
  url: string;
  verified: boolean;
  isArtist: boolean;
}

/**
 * Expected extracted playlist result
 */
export interface PlaylistResult {
  type: "playlist";
  contentType: string;
  id: string;
  title: string;
  image: string;
  thumbnail: Thumbnail;
  videoCount: number;
  author: Author | null;
  url: string;
}

/**
 * Extracted search result which can be a video, channel, or playlist
 */
export type SearchResult = VideoResult | ChannelResult | PlaylistResult;

/**
 * Playlist info header object from YouTube
 */
export interface PlaylistInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: Thumbnail;
  image: string;
  author: Author;
  videoCount: string;
  viewsCount: string;
  expectedPages: number;
}

/**
 * Extracted playlist video item
 */
export interface PlaylistVideo {
  type: "video";
  id: string;
  index: string;
  title: string;
  image: string;
  thumbnail: Thumbnail;
  views: string;
  duration: string;
  seconds: number;
  author: Author | null;
  watchUrl: string;
  publishedAt: string;
}

/**
 * Playlist page result with pagination support
 */
export interface PlaylistPage {
  playlist: PlaylistInfo;
  videos: PlaylistVideo[];
  hasNextPage: boolean;
  nextPage: () => Promise<PlaylistPage | null>;
}

/**
 * Parsed and simplified video details (human-friendly)
 */
export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  viewsShort: string;
  uploadDate: string;
  thumbnail: Thumbnail;
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
  watchUrl: string;
  allowRatings: boolean;
}

/**
 * Raw video details returned directly from YouTube API response
 */
export interface VideoRawDetails {
  videoDetails: Record<string, any>;
  microFormat: Record<string, any>;
  videoPrimaryInfo: Record<string, any>;
  videoSecondaryInfo: Record<string, any>;
}
