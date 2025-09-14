export const BaseUrl = "https://www.youtube.com" as const;
export const WatchUrl = `${BaseUrl}/watch?v=` as const;
export const SearchUrl = `${BaseUrl}/results` as const;
export const PlaylistUrl = `${BaseUrl}/playlist?list=` as const;
export const PlayListApiUrl = `${BaseUrl}/youtubei/v1/browse?key=` as const;
export const DefaultImageName = "/hqdefault.jpg" as const;
export const ImageBaseUrl = "https://i.ytimg.com/vi/" as const;

export const TypeFilters = {
  video: "EgIQAQ==",
  channel: "EgIQAg==",
  playlist: "EgIQAw==",
} as const;

export const ContentObjectKey = {
  video: "videoRenderer",
  channel: "channelRenderer",
  playlist: "lockupViewModel",
} as const;

export const DefaultOptions = {
  type: "video", // 'video', 'channel', 'playlist'
  sort: "relevance", // 'relevance', 'upload_date', 'view_count', 'rating'
  limit: 20, // number of results to return
} as const;

export const ExpectedTypes = ["video", "channel", "playlist"] as const;
export const ExpectedSorts = [
  "relevance",
  "upload_date",
  "view_count",
  "rating",
] as const;
