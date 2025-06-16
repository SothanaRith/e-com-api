const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const optionalData = {
    currency: khqrData.currency.khr,
    amount: 100,
    billNumber: "#0020",
    mobileNumber: "885183232096",
    storeLabel: "Zero",
    terminalLabel: "Zero",
};

const individualInfo = new IndividualInfo(
    "sothanarith_heang1@aclb",
    khqrData.currency.khr,
    "Phnom Penh",
    "Phnom Penh",
    optionalData
);

const khqr = new BakongKHQR();
const response = khqr.generateIndividual(individualInfo);

console.log(response);

