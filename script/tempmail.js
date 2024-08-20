const { TempMail } = require("1secmail-api");

module.exports.config = {
  name: "tempmail",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  credits: "Developer",
  description: "Generate temporary email and auto-fetch inbox.",
  usages: "[tempmail]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const reply = (msg) => api.sendMessage(msg, event.threadID, event.messageID);
  
  const generateRandomId = () => {
    const length = 6;
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
      randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomId;
  };

  try {
    // Generate temporary email
    const mail = new TempMail(generateRandomId());

    // Auto fetch
    mail.autoFetch();

    if (mail) reply(" Your generated email 📩: " + mail.address);

    // Fetch function
    const fetch = async () => {
      try {
        const mails = await mail.getMail();
        if (!mails[0]) return;

        const b = mails[0];
        const msg = `📬 You have a message!\n\nFrom: ${b.from}\n\nSubject: ${b.subject}\n\nMessage: ${b.textBody}\nDate: ${b.date}`;
        reply(msg + `\n\nOnce the email and message are received, they will be automatically deleted.`);
        
        await mail.deleteMail();
      } catch (err) {
        reply("Error fetching email: " + err.message);
      }
    };

    // Auto fetch every 3 seconds
    fetch();
    setInterval(fetch, 3 * 1000);

  } catch (err) {
    console.log(err);
    return reply(err.message);
  }
};