const sampleVariants = [
    {
        productId: 1, // Product 1: Apple iPhone 13 Pro Max
        sku: 'IPH13-PRO-MAX-SILVER-NT',
        price: 1099.99,
        stock: 20,
        attributes: [
            { name: 'Color', value: 'Silver' },
            { name: 'Storage', value: '128GB' },
        ],
    },
    {
        productId: 1, // Product 1: Apple iPhone 13 Pro Max
        sku: 'IPH13-PRO-MAX-GRAPHITE-NT',
        price: 1099.99,
        stock: 15,
        attributes: [
            { name: 'Color', value: 'Graphite' },
            { name: 'Storage', value: '128GB' },
        ],
    },
    {
        productId: 2, // Product 2: Samsung Galaxy S21 Ultra
        sku: 'S21-ULTRA-BLACK-128GB-NT',
        price: 1199.99,
        stock: 10,
        attributes: [
            { name: 'Color', value: 'Phantom Black' },
            { name: 'Storage', value: '128GB' },
        ],
    },
    {
        productId: 3, // Product 3: Sony WH-1000XM4 Noise Cancelling Headphones
        sku: 'WH1000XM4-BLACK',
        price: 349.99,
        stock: 50,
        attributes: [
            { name: 'Color', value: 'Black' },
        ],
    },
    {
        productId: 4, // Product 4: Dell XPS 13 Laptop
        sku: 'DELL-XPS-13-INTEL-I7',
        price: 1499.99,
        stock: 30,
        attributes: [
            { name: 'Processor', value: 'Intel i7' },
            { name: 'Color', value: 'Platinum Silver' },
        ],
    },
    {
        productId: 5, // Product 5: Apple Watch Series 7
        sku: 'AW-7-GPS-45MM',
        price: 399.99,
        stock: 60,
        attributes: [
            { name: 'Size', value: '45mm' },
            { name: 'GPS', value: 'GPS' },
        ],
    },
    {
        productId: 6, // Product 6: Samsung Galaxy Buds Pro
        sku: 'GB-PRO-SILVER',
        price: 199.99,
        stock: 100,
        attributes: [
            { name: 'Color', value: 'Silver' },
        ],
    },
    {
        productId: 7, // Product 7: Bose QuietComfort 35 II
        sku: 'BOSE-QC35-II-BLACK',
        price: 299.99,
        stock: 40,
        attributes: [
            { name: 'Color', value: 'Black' },
        ],
    },
    {
        productId: 8, // Product 8: Microsoft Surface Laptop 4
        sku: 'MS-SURF-LAPTOP-4-INTEL-I7',
        price: 1199.99,
        stock: 35,
        attributes: [
            { name: 'Processor', value: 'Intel i7' },
            { name: 'Color', value: 'Platinum' },
        ],
    },
    {
        productId: 9, // Product 9: GoPro HERO10 Black
        sku: 'GO-PRO-HERO10-BLACK',
        price: 499.99,
        stock: 30,
        attributes: [
            { name: 'Color', value: 'Black' },
            { name: 'Edition', value: 'Standard' },
        ],
    },
    {
        productId: 10, // Product 10: Fitbit Charge 5
        sku: 'FITBIT-CHARGE-5-BLACK',
        price: 179.99,
        stock: 70,
        attributes: [
            { name: 'Color', value: 'Black' },
            { name: 'Size', value: 'Small' },
        ],
    },
    {
        productId: 11, // Product 11: JBL Charge 5 Portable Bluetooth Speaker
        sku: 'JBL-CHARGE-5-BLACK',
        price: 179.99,
        stock: 120,
        attributes: [
            { name: 'Color', value: 'Black' },
        ],
    },
    {
        productId: 12, // Product 12: Lenovo ThinkPad X1 Carbon
        sku: 'LENOVO-X1-CARBON-I7',
        price: 1899.99,
        stock: 20,
        attributes: [
            { name: 'Processor', value: 'Intel i7' },
            { name: 'Color', value: 'Black' },
        ],
    },
    {
        productId: 13, // Product 13: iPad Pro 12.9-inch (5th Generation)
        sku: 'IPAD-PRO-12-9-2021-WIFI',
        price: 1099.99,
        stock: 50,
        attributes: [
            { name: 'Wi-Fi', value: 'Wi-Fi Only' },
            { name: 'Size', value: '12.9-inch' },
        ],
    },
    {
        productId: 14, // Product 14: Apple AirPods Pro (2nd Generation)
        sku: 'AIRPODS-PRO-2-WHITE',
        price: 249.99,
        stock: 80,
        attributes: [
            { name: 'Color', value: 'White' },
        ],
    },
    {
        productId: 15, // Product 15: Harman Kardon Onyx Studio 6 Bluetooth Speaker
        sku: 'HARMAN-KARDON-ONYX-STUDIO-6',
        price: 399.99,
        stock: 25,
        attributes: [
            { name: 'Color', value: 'Black' },
        ],
    },
    {
        productId: 16, // Product 16: HP Spectre x360 14
        sku: 'HP-SPECTRE-X360-14-I7',
        price: 1599.99,
        stock: 40,
        attributes: [
            { name: 'Processor', value: 'Intel i7' },
            { name: 'Color', value: 'Nightfall Black' },
        ],
    },
    {
        productId: 17, // Product 17: Apple MacBook Air (M1 Chip)
        sku: 'MACBOOK-AIR-M1-2020-8GB',
        price: 999.99,
        stock: 60,
        attributes: [
            { name: 'Processor', value: 'Apple M1' },
            { name: 'RAM', value: '8GB' },
        ],
    },
    {
        productId: 18, // Product 18: Sony A7 III Mirrorless Camera
        sku: 'SONY-A7-III-24MP-BODY',
        price: 1999.99,
        stock: 30,
        attributes: [
            { name: 'Sensor', value: 'Full-frame' },
        ],
    },
];

module.exports = sampleVariants;
