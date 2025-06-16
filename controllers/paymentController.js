const paymentService = require('../services/paymentService');
const { exec } = require('child_process');
const qrcode = require('qrcode');
const axios = require('axios');
const Jimp = require('jimp');

const generateDeeplink = async (req, res) => {
    try {
        const { qrCode, appIconUrl, appName, appDeepLinkCallback } = req.body;

        // Call the service that generates the QR code and deeplink
        const result = await generateDeepLinkKHQR(qrCode, appIconUrl, appName, appDeepLinkCallback);

        // Return the deeplink result to the frontend
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Constants
const API_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';
const ACCESS_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMzM0NDUzY2M0ZWYzNDAyYiJ9LCJpYXQiOjE3NTAwNTAyODgsImV4cCI6MTc1NzgyNjI4OH0.ECXxWWzlS3pN9Jq_5GmZZXKKyvPbx1KSJIhhdeWKTo4';
const JS_FILE_PATH = '/Users/narith/School_CO4ES2_Y4/e-com-api/config/bandle.js';

// Run Node.js script to get QR and MD5 data
function runNodeScript() {
    return new Promise((resolve, reject) => {
        exec(`node ${JS_FILE_PATH}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error running Node.js script: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Check the transaction status by MD5
async function checkTransactionStatus(md5) {
    const data = { md5: md5 };

    try {
        let getMoney = false;
        while (!getMoney) {
            const response = await axios.post(API_URL, data, {
                headers: {
                    'Authorization': ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const responseData = response.data;
                console.log(responseData)
                if (responseData.responseMessage === 'Success') {
                    getMoney = true;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error checking transaction status:', error.message);
    }
}

async function checkStreamTransactionStatus (req, res) {
    const { md5 } = req.body;

    let checkInterval;
    let attempts = 0;

    // Create a "stream" to send updates as the transaction status changes
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const intervalTime = 1000; // Check every 1 second

    const checkStatus = async () => {
        if (attempts >= 10) {  // Max attempts
            clearInterval(checkInterval);
            res.write("data: {\"status\": \"Transaction timeout\"}\n\n");
            res.end();
            return;
        }

        try {
            // Simulating an API call to check transaction status
            const status = await axios.post('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', { md5 }, {
                headers: {
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                    'Content-Type': 'application/json',
                },
            });

            const responseData = status.data;

            // If the transaction is found, send success data
            if (responseData.responseMessage === "Success") {
                res.write(`data: {"status": "Transaction successful"}\n\n`);
                clearInterval(checkInterval);
                res.end();
            } else {
                res.write(`data: {"status": "Transaction not yet successful, retrying..."}\n\n`);
            }
        } catch (error) {
            clearInterval(checkInterval);
            res.write(`data: {"status": "Error occurred while checking transaction"}\n\n`);
            res.end();
        }

        attempts++;
    };

    checkInterval = setInterval(checkStatus, intervalTime);
}

// Main controller function to handle the flow
async function handleTransaction(req, res) {
    try {
        const result = await runNodeScript();
        const pattern = /'(.*?)'/g;
        const matches = [];
        let match;
        while ((match = pattern.exec(result)) !== null) {
            matches.push(match[1]);
        }

        if (matches.length < 2) {
            return res.status(400).json({ error: 'Expected data not found in Node.js script output.' });
        }

        // Check transaction status
        await checkTransactionStatus(matches[1]);

        return res.status(200).json({ message: 'Transaction successful and images generated.' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const generateDeepLinkKHQR = async (qrCode, appIconUrl, appName, appDeepLinkCallback) => {
    try {
        // Here, the QR code can be generated using the provided QR string
        const qrData = await qrcode.toDataURL(qrCode);

        // Prepare the payload for Bakong API's deeplink generation
        const deeplinkData = {
            qr: qrCode,
            sourceInfo: {
                appIconUrl: appIconUrl,
                appName: appName,
                appDeepLinkCallback: appDeepLinkCallback
            }
        };

        // Call Bakong API for deeplink generation
        const response = await axios.post('https://api-bakong.nbc.gov.kh/v1/generate_deeplink_by_qr', deeplinkData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return response.data;
        }

        throw new Error('Failed to generate deeplink');
    } catch (error) {
        throw new Error(`Error generating KHQR: ${error.message}`);
    }
};

module.exports = {
    generateDeeplink,
    checkTransactionStatus,
    checkStreamTransactionStatus,
    handleTransaction
};
