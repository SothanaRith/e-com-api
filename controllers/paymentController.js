const paymentService = require('../services/paymentService');
const { exec } = require('child_process');
const qrcode = require('qrcode');
const axios = require('axios');
const Jimp = require('jimp');

const generateDeeplink = async (req, res) => {
    try {
        const { qrCode, appIconUrl, appName, appDeepLinkCallback } = req.body;
        const result = await paymentService.generateKHQR(qrCode, appIconUrl, appName, appDeepLinkCallback);
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

module.exports = {
    generateDeeplink,
    checkTransactionStatus,
    handleTransaction
};
