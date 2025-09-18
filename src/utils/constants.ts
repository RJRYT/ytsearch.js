export const BaseUrl = "https://www.youtube.com" as const;
export const WatchUrl = `${BaseUrl}/watch?v=` as const;
export const SearchUrl = `${BaseUrl}/results` as const;
export const PlaylistUrl = `${BaseUrl}/playlist?list=` as const;
export const PlayListApiUrl = `${BaseUrl}/youtubei/v1/browse?key=` as const;
export const DefaultImageName = "/hqdefault.jpg" as const;
export const ImageBaseUrl = "https://i.ytimg.com/vi/" as const;
export const UserAgent =
  "Mozilla/5.0 (Windows NT 10.0; rv:140.0) Gecko/20100101 Firefox/140.0" as const;

export const TypeFilters = {
  video: "EgIQAQ==",
  channel: "EgIQAg==",
  playlist: "EgIQAw==",
} as const;

export const SortFilters = {
  video: {
    relevance: "CAASAhAB",
    upload_date: "CAISAhAB",
    view_count: "CAMSAhAB",
    rating: "CAESAhAB",
  },
  channel: {
    relevance: "CAASAhAC",
    upload_date: "CAISAhAC",
    view_count: "CAMSAhAC",
    rating: "CAESAhAC",
  },
  playlist: {
    relevance: "CAASAhAD",
    upload_date: "CAISAhAD",
    view_count: "CAMSAhAD",
    rating: "CAESAhAD",
  },
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
