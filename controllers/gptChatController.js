const { successResponse, failResponse } = require("../utils/baseResponse");
const OpenAI = require("openai");
const axios = require('axios');
const qs = require('querystring');
// Init OpenAI
const openai = new OpenAI();

// Store chat history in memory
let history = [];

exports.chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json(failResponse("Message is required and must be a string"));
        }

        // Add user input to chat history
        history.push({ role: "user", content: message });

        // Call OpenAI API
        const response = await openai.responses.create({
            model: "gpt-3.5-turbo",
            input: history,
            store: true,
        });

        // Add assistant response(s) to chat history
        const botMessages = response.output.map((msg) => {
            delete msg.id; // Optional cleanup
            return msg;
        });
        history.push(...botMessages);

        // Return the last reply
        return res.status(200).json(successResponse("Reply from chatbot", response.output_text));
    } catch (error) {
        console.error("❌ ChatBot error:", error);
        return res.status(500).json(failResponse("Internal server error", error.message));
    }
};

// exports.clearChatHistory = async (req, res) => {
//     try {
//         history = []; // Reset history
//         return res.status(200).json(successResponse("Chat history cleared"));
//     } catch (error) {
//         console.error("❌ Clear history error:", error);
//         return res.status(500).json(failResponse("Failed to clear chat history", error.message));
//     }
// };

const userHistories = new Map();

exports.chatTuboWithBot = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message || typeof message !== "string") {
            return res.status(400).json(failResponse("User ID and valid message are required"));
        }

        // Use per-user memory
        let history = userHistories.get(userId) || [];
        history.push({ role: "user", content: message + "" });

        console.log(history)
        const chatPrompt = history.map(msg =>
            msg.role === "user" ? `User: ${msg.content}` : `Bot: ${msg.content.content}`
        ).join("\n");

        console.log(chatPrompt)
        const apiUrl = `http://195.179.229.119/gpt/api.php?${qs.stringify({
            prompt: chatPrompt,
            api_key: 'c1e65203fb778e6ef8d66fe47a556d67',
            model: 'gpt-3.5-turbo'
        })}`;

        const response = await axios.get(apiUrl);
        const reply = response.data;

        history.push({ role: "assistant", content: reply });

        // Save back
        userHistories.set(userId, history);

        return res.status(200).json(successResponse("Reply from chatbot", reply));
    } catch (error) {
        console.error("❌ ChatBot error:", error.message);
        return res.status(500).json(failResponse("Internal server error", error.message));
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json(failResponse("User ID is required"));
        }

        userHistories.delete(userId); // 🧹 Clear only this user's chat

        return res.status(200).json(successResponse("Chat history cleared for user"));
    } catch (error) {
        console.error("❌ Clear history error:", error);
        return res.status(500).json(failResponse("Failed to clear chat history", error.message));
    }
};
