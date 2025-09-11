module.exports = {
  BaseUrl: "https://www.youtube.com",
  WatchUrl: "https://www.youtube.com/watch?v=",
  SearchUrl: "https://www.youtube.com/results",
  PlaylistUrl: "https://www.youtube.com/playlist?list=",

  TypeFilters: {
    video: "EgIQAQ==",
    channel: "EgIQAg==",
    playlist: "EgIQAw==",
  },

  ContentObjectKey: {
    video: "videoRenderer",
    channel: "channelRenderer",
    playlist: "lockupViewModel",
  },

  DefaultOptions: {
    type: "video", // 'video', 'channel', 'playlist'
    sort: "relevance", // 'relevance', 'upload_date', 'view_count', 'rating'
    limit: 20, // number of results to return
  },

  ExpectedTypes: ["video", "channel", "playlist"],
  ExpectedSorts: ["relevance", "upload_date", "view_count", "rating"],
};
