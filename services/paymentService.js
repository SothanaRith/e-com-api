const { BakongKHQR, khqrData, MerchantInfo, SourceInfo, IndividualInfo } = require('bakong-khqr');
const axios = require('axios');

const generateKHQR = async (req, res) => {

    try {
        // Optional data for both individual and merchant information
        const optionalData = {
            currency: req.body.currency === "khr" ? khqrData.currency.khr : khqrData.currency.usd,
            amount: req.body.amount ?? 100,
            AcquiringBank: "ABA Bank",// Example amount for transaction
            mobileNumber: "85587575857", // Example mobile number
            storeLabel: "Snap buy", // Example store label
            expirationTimestamp: Date.now() + (1 * 60 * 1000), // Example expiration in 1 minute
            merchantCategoryCode: "8220", // Default merchant category code"
            payloadFormatIndicator: "01",
            pointofInitiationMethod: "11",
            countryCode: "KH",
            merchantCity: "PHNOM PENH"
        };

        // Merchant Info Example (for business transactions)
        const merchantInfo = new MerchantInfo(
            "sothanarith_heang1@aclb", // Merchant account ID
            "Sothanarith Heang",       // Merchant name
            "PHNOM PENH",             // City
            1243546472,               // Amount in cents (e.g., 1243546472 for 1243546472.00)
            "DEVBKKHPXXX",            // Acquiring Bank Code
            optionalData              // Optional data specific to the merchant transaction
        );

        // Individual Info Example (for personal transactions)
        const individualInfo = new IndividualInfo(
            "un_virak2@aclb",          // Individual account ID (e.g., phone number or email)
            "Virak Un",               // Individual name
            "PHNOM PENH",             // City
            optionalData              // Optional data specific to the individual transaction
        );

        // Create the KHQR instance
        const khqr = new BakongKHQR();

        // Choose to generate Merchant QR or Individual QR based on the request body
        let response;
        if (req.body.type === 'merchant') {
            response = await khqr.generateMerchant(merchantInfo); // Generate Merchant QR
        } else {
            response = await khqr.generateIndividual(individualInfo); // Generate Individual QR
        }

        // Return the response with QR code and MD5 hash
        res.status(200).json({
            qrCode: response.data.qr,
            md5: response.data.md5,
        });

        console.log(response);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify KHQR
const verifyKHQR = async (req, res) => {
    try {
        const { qrCode } = req.body;

        const verification = await BakongKHQR.verify(qrCode);

        console.log(verification)
        res.status(200).json({
            valid: verification,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Decode KHQR
const decodeKHQR = async (req, res) => {
    try {
        const { qrCode } = req.body;

        const decodeResponse = BakongKHQR.decode(qrCode);

        res.status(200).json({
            data: decodeResponse.data,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const renewToken = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the email parameter
        if (!email || email.length > 30) {
            return res.status(400).json({ error: 'Valid email is required (max length 30).' });
        }

        // Prepare the request body
        const data = { email: email };

        // Make the POST request to renew the token
        const response = await axios.post(
            'https://api-bakong.nbc.gov.kh/v1/renew_token', // Replace with your API base URL
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        // Handle response from the server
        if (response.status === 200) {
            const responseData = response.data;
            if (responseData.responseCode === 0) {
                return res.status(200).json({
                    responseCode: responseData.responseCode,
                    responseMessage: responseData.responseMessage,
                    token: responseData.data.token,
                });
            } else {
                return res.status(400).json({
                    responseCode: responseData.responseCode,
                    responseMessage: responseData.responseMessage,
                    errorCode: responseData.errorCode || null,
                });
            }
        } else {
            return res.status(response.status).json({ error: 'Failed to renew token.' });
        }

    } catch (error) {
        console.error('Error renewing token:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    generateKHQR,
    verifyKHQR,
    decodeKHQR,
    renewToken
};
