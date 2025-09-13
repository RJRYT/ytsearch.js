import { ExpectedSorts, ExpectedTypes } from "../utils/constants";

/**
 * Raw YouTube Search Result Type (before extraction)
 */
export type RawSearchResult = Record<string, unknown>;

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
  author: {
    name: string;
    url: string;
    verified: boolean;
  } | null;
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
  author: {
    name: string;
    url: string;
    verified: boolean;
    isArtist: boolean;
  } | null;
  url: string;
}

/**
 * Extracted item which can be a video, channel, or playlist
 */
export type ExtractedItem = VideoResult | ChannelResult | PlaylistResult;
