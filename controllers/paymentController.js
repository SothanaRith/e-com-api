const paymentService = require('../services/paymentService');
const { exec } = require('child_process');
const qrcode = require('qrcode');
const axios = require('axios');
const Jimp = require('jimp');

const BAKONG_TOKEN = process.env.BAKONG_TOKEN; // REQUIRED
const APP_DEEPLINK_SCHEME = process.env.APP_DEEPLINK_SCHEME || 'snapbuy';
const APP_DEEPLINK_HOST = process.env.APP_DEEPLINK_HOST || 'payment-callback';

if (!BAKONG_TOKEN) {
  console.warn('[paymentController] WARNING: BAKONG_TOKEN missing. Set it in .env');
}

async function generateDeeplink(req, res) {
  try {
    const { qrCode, appIconUrl, appName, appDeepLinkCallback } = req.body || {};

    if (!qrCode || !appIconUrl || !appName || !appDeepLinkCallback) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: qrCode, appIconUrl, appName, appDeepLinkCallback',
      });
    }

    // Optional: generate a PNG data URL to show QR preview on your frontend
    const qrImage = await qrcode.toDataURL(qrCode);

    const payload = {
      // IMPORTANT: Bakong expects the raw KHQR string here (NOT PNG)
      qr: qrCode,
      sourceInfo: {
        appIconUrl,
        appName,
        appDeepLinkCallback, // e.g. https://your-api.example.com/payment/callback
      },
    };

    const r = await bakong.post('/generate_deeplink_by_qr', payload, {
      headers: {
        Authorization: `Bearer ${BAKONG_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔗 Generated deeplink:', r.data);

    return res.json({
      success: true,
      ...r.data,          // deeplink, reference, etc. from Bakong
      qrImage,            // optional PNG data URL for UI preview
    });
  } catch (err) {
    const msg = err.response?.data || err.message || 'Unknown error';
    return res.status(500).json({
      success: false,
      message: `Error generating KHQR deeplink: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`,
    });
  }
}

// Preconfigured axios client
const bakong = axios.create({
  baseURL: 'https://api-bakong.nbc.gov.kh/v1',
  timeout: 10000,
});

// Constants
const ACCESS_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMzM0NDUzY2M0ZWYzNDAyYiJ9LCJpYXQiOjE3NTAwNTAyODgsImV4cCI6MTc1NzgyNjI4OH0.ECXxWWzlS3pN9Jq_5GmZZXKKyvPbx1KSJIhhdeWKTo4';

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
        if (attempts >= 3) {  // Max attempts
            clearInterval(checkInterval);
            res.write("data: {\"status\": \"Transaction timeout\"}\n\n");
            res.end();
            return;
        }

        try {
            // Simulating an API call to check transaction status
            const status = await axios.post('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', { md5 }, {
                headers: {
                    'Authorization': ACCESS_TOKEN,
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
async function handlePaymentCallback (req, res) {
    const txnId = req.query.txn_id || 'unknown';
    const deepLink = `snapbuy://payment-callback`;

    console.log(`🔁 Callback received: txn_id=${txnId}`);

    res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url='${deepLink}'" />
      </head>
      <body>
        <p>Redirecting to your app...</p>
        <script>
          window.location.href = "${deepLink}";
        </script>
      </body>
    </html>
  `);
}

const generateDeepLinkKHQR = async (qrCode, appIconUrl, appName, appDeepLinkCallback) => {
    try {
        // Here, the QR code can be generated using the provided QR string
        const qrData = await qrcode.toDataURL(qrCode);

        // Prepare the payload for Bakong API's deeplink generation
        const deeplinkData = {
            qr: qrData,
            sourceInfo: {
                appIconUrl: appIconUrl,
                appName: appName,
                appDeepLinkCallback: appDeepLinkCallback
            }
        };

        // Call Bakong API for deeplink generation
        const response = await axios.post('https://api-bakong.nbc.gov.kh/v1/generate_deeplink_by_qr', deeplinkData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ACCESS_TOKEN,
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
    checkStreamTransactionStatus,
    handlePaymentCallback
};
