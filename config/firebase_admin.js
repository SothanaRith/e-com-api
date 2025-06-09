const admin = require('firebase-admin');
const serviceAccount = require("./firebase-adminsdk-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (token, title, body) => {
    const message = {
        notification: {
            title,
            body
        },
        token: token,  // This should be the device's FCM token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
        return { success: true, response };
    } catch (error) {
        console.error("Error sending notification:", error);
        return { success: false, error };
    }
};

// Example route to send a notification
const express = require('express');
const router = express.Router();

router.post("/send-notification", async (req, res) => {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
        return res.status(400).json({ message: "Token, title, and body are required" });
    }

    const response = await sendNotification(token, title, body);
    if (response.success) {
        res.status(200).json({ message: "Notification sent successfully" });
    } else {
        res.status(500).json({ message: "Error sending notification", error: response.error });
    }
});

module.exports = router;
