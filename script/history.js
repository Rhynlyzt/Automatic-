const axios = require('axios');

module.exports.config = {
  name: "history",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  credits: "kshitiz",
  description: "search and know about history",
  usages: "history [search_query]",
  cooldowns: 10,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return api.sendMessage("Please provide a search query (e.g., history Vietnam War).", threadID, messageID);
  }

  try {
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`);

    if (response.data.title && response.data.extract) {
      const title = response.data.title;
      const extract = response.data.extract;

      api.sendMessage(`Information about "${title}":\n${extract}`, threadID, messageID);
    } else {
      api.sendMessage(`No information found for "${searchQuery}".`, threadID, messageID);
    }
  } catch (error) {
    console.error("Error fetching historical information:", error);
    api.sendMessage("An error occurred while fetching historical information.", threadID, messageID);
  }
};
