const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports.config = {
  name: "ai2",
  version: "5.0",
  role: 0,
  hasPrefix: true,
  credits: "vex_kshitiz",
  description: "Chat with GPT, process images, and more.",
  usages: "gpt [command] [args]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const command = args[0].toLowerCase();
  const query = args.slice(1).join(" ").trim();

  try {
    switch (command) {
      case 'draw':
        await drawImage(api, threadID, messageID, query);
        break;

      case 'send':
        await kshitiz(api, event, args.slice(1), api.sendMessage);
        break;

      case 'sing':
        await lado(api, event, args.slice(1), api.sendMessage);
        break;

      case 'describe':
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
          const photoUrl = event.messageReply.attachments[0].url;
          const description = await describeImage(query, photoUrl);
          api.sendMessage(`Description: ${description}`, threadID, messageID);
        } else {
          api.sendMessage("Please reply to a message with an image for description.", threadID, messageID);
        }
        break;

      default:
        const response = await b(query, senderID);
        api.sendMessage(response, threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, threadID, messageID);
  }
};

async function lado(api, event, args, sendMessage) {
  try {
    const songName = args.join(" ");
    const searchResults = await yts(songName);

    if (!searchResults.videos.length) {
      sendMessage("No song found for the given query.", event.threadID, event.messageID);
      return;
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioonly" });
    const fileName = `music.mp3`; 
    const filePath = path.join(__dirname, "tmp", fileName);

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('end', () => {
      const audioStream = fs.createReadStream(filePath);
      sendMessage({ body: "Download complete!", attachment: audioStream }, event.threadID, event.messageID);
    });
  } catch (error) {
    sendMessage("Sorry, an error occurred while processing your request.", event.threadID, event.messageID);
  }
}

async function kshitiz(api, event, args, sendMessage) {
  try {
    const query = args.join(" ");
    const searchResults = await yts(query);

    if (!searchResults.videos.length) {
      sendMessage("No videos found for the given query.", event.threadID, event.messageID);
      return;
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioandvideo" }); 
    const fileName = `music.mp4`;
    const filePath = path.join(__dirname, "tmp", fileName);

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('end', () => {
      const videoStream = fs.createReadStream(filePath);
      sendMessage({ body: "Download complete!", attachment: videoStream }, event.threadID, event.messageID);
    });
  } catch (error) {
    sendMessage("Sorry, an error occurred while processing your request.", event.threadID, event.messageID);
  }
}

async function b(query, senderID) {
  try {
    const response = await axios.get(`https://gpt-four.vercel.app/gpt?prompt=${encodeURIComponent(query)}&uid=${senderID}`);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function i(prompt) {
  try {
    const response = await axios.get(`https://dall-e-tau-steel.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}`);
    return response.data.response;
  } catch (error) {
    throw error;
  }
}

async function describeImage(prompt, photoUrl) {
  try {
    const url = `https://sandipbaruwal.onrender.com/gemini2?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(photoUrl)}`;
    const response = await axios.get(url);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function drawImage(api, threadID, messageID, prompt) {
  try {
    const imageUrl = await i(prompt);

    const filePath = path.join(__dirname, 'cache', `image_${Date.now()}.png`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    }).then(() => {
      api.sendMessage({
        body: "Generated image:",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));
    });
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, threadID, messageID);
  }
}
