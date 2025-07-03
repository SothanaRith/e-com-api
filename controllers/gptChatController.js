const { successResponse, failResponse } = require("../utils/baseResponse");
const OpenAI = require("openai");

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

exports.clearChatHistory = async (req, res) => {
    try {
        history = []; // Reset history
        return res.status(200).json(successResponse("Chat history cleared"));
    } catch (error) {
        console.error("❌ Clear history error:", error);
        return res.status(500).json(failResponse("Failed to clear chat history", error.message));
    }
};
