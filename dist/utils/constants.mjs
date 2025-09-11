export const BaseUrl = "https://www.youtube.com";
export const WatchUrl = "https://www.youtube.com/watch?v=";
export const SearchUrl = "https://www.youtube.com/results";
export const PlaylistUrl = "https://www.youtube.com/playlist?list=";

export const TypeFilters = {
  video: "EgIQAQ==",
  channel: "EgIQAg==",
  playlist: "EgIQAw==",
};

export const ContentObjectKey = {
  video: "videoRenderer",
  channel: "channelRenderer",
  playlist: "lockupViewModel",
};

export const DefaultOptions = {
  type: "video", // 'video', 'channel', 'playlist'
  sort: "relevance", // 'relevance', 'upload_date', 'view_count', 'rating'
  limit: 20, // number of results to return
};

export const ExpectedTypes = ["video", "channel", "playlist"];
export const ExpectedSorts = [
  "relevance",
  "upload_date",
  "view_count",
  "rating",
];
