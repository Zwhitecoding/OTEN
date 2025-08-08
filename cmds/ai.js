const axios = require("axios");

module.exports = {
    name: "ai",
    usePrefix: false,
    usage: "ai <your question>",
    version: "1.5",
    admin: false,
    cooldown: 2,

    execute: async ({ api, event, args }) => {
        try {
            const { threadID } = event;
            const prompt = args.join(" ");
            if (!prompt) return api.sendMessage("❗ Please provide a question.", threadID);

            const apiKey = "98ae3ba8618aa25ed731ad3da9d9b2d0d22cbe520584829ff176c9ce3ebceb61";
            const apiUrl = `https://haji-mix-api.gleeze.com/api/liner?ask=${encodeURIComponent(prompt)}&mode=general&deepsearch=false&stream=false&api_key=${apiKey}`;

            const loadingMsg = await api.sendMessage("🧠 Thinking...", threadID);

            const response = await axios.get(apiUrl);
            const reply = response?.data?.answer?.llm_response;

            if (!reply) {
                return api.sendMessage("⚠️ No response received from AI.", threadID, loadingMsg.messageID);
            }

            return api.sendMessage(`🤖 **AI Response**\n━━━━━━━━━━━━━━━━\n${reply}\n━━━━━━━━━━━━━━━━`, threadID, loadingMsg.messageID);
        } catch (error) {
            console.error("❌ AI Error:", error.message);
            return api.sendMessage("❌ Error while contacting the AI API.", event.threadID);
        }
    }
};
