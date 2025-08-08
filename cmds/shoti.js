const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "shoti",
    usePrefix: false,
    usage: "shoti",
    version: "1.2",
    cooldown: 5,
    admin: false,

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const apiKey = "98ae3ba8618aa25ed731ad3da9d9b2d0d22cbe520584829ff176c9ce3ebceb61";
            const response = await axios.get(`https://haji-mix-api.gleeze.com/api/shoti?stream=true&api_key=${apiKey}`);

            console.log("📜 API Response:", response.data);

            if (!response.data || !response.data.url) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No video URL received from API.", threadID, messageID);
            }

            const videoUrl = response.data.url;
            const caption = response.data.caption || "No caption provided.";
            const author = response.data.author || "Unknown author";
            const tags = Array.isArray(response.data.tags) ? response.data.tags.join(", ") : "None";

            const filePath = path.join(__dirname, "shoti.mp4");

            // Download the video
            const writer = fs.createWriteStream(filePath);
            const videoResponse = await axios({
                url: videoUrl,
                method: "GET",
                responseType: "stream"
            });

            videoResponse.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                const msg = {
                    body:
                        `🎬 **Caption**: ${caption}\n` +
                        `👤 **Author**: ${author}\n` +
                        `🏷️ **Tags**: ${tags}`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending video:", err);
                        return api.sendMessage("⚠️ Failed to send video.", threadID);
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading video:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download video.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ Error fetching video:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, threadID, messageID);
        }
    },
};
