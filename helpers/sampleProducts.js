const sampleProducts = [
    {
        categoryId: 1,
        name: 'Apple iPhone 13 Pro Max',
        description: 'The iPhone 13 Pro Max offers a 6.7-inch Super Retina display, 128GB of storage, and 5G connectivity.',
        price: 1099.99,
        totalStock: 50,
        imageUrl: [
            '/uploads/iphone13promax.jpg',
            '/uploads/dellxps13.jpg',
            '/uploads/applewatch7.jpg',
            '/uploads/galaxybudspro.jpg',
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
        ],
        review: {
            rating: 5,
            userId: 1,
            comment: 'Amazing phone, best camera quality!',
        },
        variants: [
            {
                sku: 'IP13PM-128GB-SILVER',
                price: 1099.99,
                stock: 30,
                attributes: [
                    { name: 'Storage', value: '128GB' },
                    { name: 'Color', value: 'Silver' },
                ],
            },
            {
                sku: 'IP13PM-256GB-GOLD',
                price: 1199.99,
                stock: 20,
                attributes: [
                    { name: 'Storage', value: '256GB' },
                    { name: 'Color', value: 'Gold' },
                ],
            },
        ],
        relatedProductIds: [2, 5, 14],
    },
    {
        categoryId: 2,
        name: 'Samsung Galaxy S21 Ultra',
        description: 'With a 6.8-inch display, 128GB storage, and a powerful 108MP camera, the Galaxy S21 Ultra is made for photographers.',
        price: 1199.99,
        totalStock: 60,
        imageUrl: [
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
            '/uploads/galaxys21ultra.jpg',
        ],
        review: {
            rating: 4,
            userId: 2,
            comment: 'Great phone but battery life could be better.',
        },
        variants: [
            {
                sku: 'SGS21U-128GB-BLACK',
                price: 1199.99,
                stock: 40,
                attributes: [
                    { name: 'Storage', value: '128GB' },
                    { name: 'Color', value: 'Black' },
                ],
            },
            {
                sku: 'SGS21U-256GB-SILVER',
                price: 1299.99,
                stock: 20,
                attributes: [
                    { name: 'Storage', value: '256GB' },
                    { name: 'Color', value: 'Silver' },
                ],
            },
        ],
        relatedProductIds: [1, 6],
    },
    {
        categoryId: 3,
        name: 'Sony WH-1000XM4 Noise Cancelling Headphones',
        description: 'Industry-leading noise cancellation, crystal clear sound, and up to 30 hours of battery life.',
        price: 349.99,
        totalStock: 100,
        imageUrl: [
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
            '/uploads/sonyheadphones.jpg',
        ],
        review: {
            rating: 5,
            userId: 3,
            comment: 'Best headphones for travel and work.',
        },
        variants: [
            {
                sku: 'SONYWH1000XM4-BLK',
                price: 349.99,
                stock: 70,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
            {
                sku: 'SONYWH1000XM4-SLV',
                price: 369.99,
                stock: 30,
                attributes: [
                    { name: 'Color', value: 'Silver' },
                ],
            },
        ],
        relatedProductIds: [7, 11],
    },
    {
        categoryId: 4,
        name: 'Dell XPS 13 Laptop',
        description: '13.4-inch FHD+ display, Intel Core i7, 16GB RAM, 512GB SSD, perfect for professionals on the go.',
        price: 1499.99,
        totalStock: 30,
        imageUrl: [
            '/uploads/dellxps13.jpg',
            '/uploads/applewatch7.jpg',
            '/uploads/galaxybudspro.jpg',
            '/uploads/boseqc35ii.jpg',
        ],
        review: {
            rating: 4,
            userId: 4,
            comment: 'Lightweight and powerful for daily tasks.',
        },
        variants: [
            {
                sku: 'DELLXPS13-I7-16GB',
                price: 1499.99,
                stock: 20,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i7' },
                    { name: 'RAM', value: '16GB' },
                    { name: 'Storage', value: '512GB SSD' },
                ],
            },
            {
                sku: 'DELLXPS13-I5-8GB',
                price: 1299.99,
                stock: 10,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i5' },
                    { name: 'RAM', value: '8GB' },
                    { name: 'Storage', value: '256GB SSD' },
                ],
            },
        ],
        relatedProductIds: [12, 20],
    },
    {
        categoryId: 1,
        name: 'Apple Watch Series 7',
        description: 'Sleek design with a larger display, faster charging, and advanced health monitoring features.',
        price: 399.99,
        totalStock: 75,
        imageUrl: [
            '/uploads/applewatch7.jpg',
            '/uploads/applewatch7.jpg',
            '/uploads/applewatch7.jpg',
            '/uploads/applewatch7.jpg',
            '/uploads/applewatch7.jpg',
        ],
        review: {
            rating: 4,
            userId: 5,
            comment: 'Love the health tracking features.',
        },
        variants: [
            {
                sku: 'AWATCH7-40MM-GREEN',
                price: 399.99,
                stock: 50,
                attributes: [
                    { name: 'Size', value: '40mm' },
                    { name: 'Color', value: 'Green' },
                ],
            },
            {
                sku: 'AWATCH7-44MM-BLUE',
                price: 429.99,
                stock: 25,
                attributes: [
                    { name: 'Size', value: '44mm' },
                    { name: 'Color', value: 'Blue' },
                ],
            },
        ],
        relatedProductIds: [1, 14],
    },
    {
        categoryId: 2,
        name: 'Samsung Galaxy Buds Pro',
        description: 'Premium sound quality, noise cancellation, and a comfortable fit make these earbuds perfect for any activity.',
        price: 199.99,
        totalStock: 120,
        imageUrl: [
            '/uploads/galaxybudspro.jpg',
            '/uploads/galaxybudspro.jpg',
            '/uploads/galaxybudspro.jpg',
            '/uploads/galaxybudspro.jpg',
            '/uploads/galaxybudspro.jpg',
        ],
        review: {
            rating: 4,
            userId: 6,
            comment: 'Excellent sound and comfortable for long use.',
        },
        variants: [
            {
                sku: 'GALAXYBUDSPRO-BLACK',
                price: 199.99,
                stock: 70,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
            {
                sku: 'GALAXYBUDSPRO-SILVER',
                price: 209.99,
                stock: 50,
                attributes: [
                    { name: 'Color', value: 'Silver' },
                ],
            },
        ],
        relatedProductIds: [2, 3],
    },
    {
        categoryId: 3,
        name: 'Bose QuietComfort 35 II',
        description: 'With world-class noise cancellation and a comfortable over-ear design, these headphones are ideal for travel.',
        price: 299.99,
        totalStock: 80,
        imageUrl: [
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
            '/uploads/boseqc35ii.jpg',
        ],
        review: {
            rating: 5,
            userId: 7,
            comment: 'Comfortable and noise cancellation is top notch.',
        },
        variants: [
            {
                sku: 'BOSEQC35II-BLK',
                price: 299.99,
                stock: 80,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [3, 6],
    },
    {
        categoryId: 4,
        name: 'Microsoft Surface Laptop 4',
        description: '13.5-inch PixelSense display, Intel Core i5, 8GB RAM, and a long battery life for a productive day.',
        price: 1199.99,
        totalStock: 40,
        imageUrl: [
            '/uploads/surfacelaptop4.jpg',
            '/uploads/surfacelaptop4.jpg',
            '/uploads/surfacelaptop4.jpg',
            '/uploads/surfacelaptop4.jpg',
            '/uploads/surfacelaptop4.jpg',
        ],
        review: {
            rating: 4,
            userId: 8,
            comment: 'Great for productivity and portability.',
        },
        variants: [
            {
                sku: 'SURFACE-L4-I5-8GB',
                price: 1199.99,
                stock: 30,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i5' },
                    { name: 'RAM', value: '8GB' },
                ],
            },
            {
                sku: 'SURFACE-L4-I7-16GB',
                price: 1399.99,
                stock: 10,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i7' },
                    { name: 'RAM', value: '16GB' },
                ],
            },
        ],
        relatedProductIds: [4, 12],
    },
    {
        categoryId: 1,
        name: 'GoPro HERO10 Black',
        description: 'Capture stunning 5.3K video, 23MP photos, and excellent stabilization with the HERO10 Black.',
        price: 499.99,
        totalStock: 100,
        imageUrl: [
            '/uploads/goprohero10.jpg',
            '/uploads/goprohero10.jpg',
            '/uploads/goprohero10.jpg',
            '/uploads/goprohero10.jpg',
            '/uploads/goprohero10.jpg',
        ],
        review: {
            rating: 5,
            userId: 9,
            comment: 'Perfect action camera with amazing video quality.',
        },
        variants: [
            {
                sku: 'GOPROHERO10-BLACK',
                price: 499.99,
                stock: 100,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [1, 3],
    },
    {
        categoryId: 2,
        name: 'Fitbit Charge 5',
        description: 'A sleek fitness tracker with built-in GPS, heart rate monitor, and sleep tracking features.',
        price: 179.99,
        totalStock: 150,
        imageUrl: [
            '/uploads/fitbitcharge5.jpg',
            '/uploads/fitbitcharge5.jpg',
            '/uploads/fitbitcharge5.jpg',
            '/uploads/fitbitcharge5.jpg',
            '/uploads/fitbitcharge5.jpg',
        ],
        review: {
            rating: 4,
            userId: 10,
            comment: 'Accurate tracking and easy to use.',
        },
        variants: [
            {
                sku: 'FITBITC5-BLACK',
                price: 179.99,
                stock: 150,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [5, 14],
    },
    {
        categoryId: 3,
        name: 'JBL Charge 5 Portable Bluetooth Speaker',
        description: 'With 20 hours of playtime, waterproof design, and superior sound, the JBL Charge 5 is your perfect travel companion.',
        price: 179.99,
        totalStock: 200,
        imageUrl: [
            '/uploads/jblcharge5.jpg',
            '/uploads/jblcharge5.jpg',
            '/uploads/jblcharge5.jpg',
            '/uploads/jblcharge5.jpg',
            '/uploads/jblcharge5.jpg',
        ],
        review: {
            rating: 5,
            userId: 11,
            comment: 'Loud, clear, and durable speaker.',
        },
        variants: [
            {
                sku: 'JBLCHARGE5-BLACK',
                price: 179.99,
                stock: 200,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [3, 7],
    },
    {
        categoryId: 4,
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'A powerful and lightweight 14-inch laptop with Intel Core i7, 16GB RAM, and a durable build.',
        price: 1899.99,
        totalStock: 25,
        imageUrl: [
            '/uploads/lenovothinkpadx1.jpg',
            '/uploads/lenovothinkpadx1.jpg',
            '/uploads/lenovothinkpadx1.jpg',
            '/uploads/lenovothinkpadx1.jpg',
        ],
        review: {
            rating: 5,
            userId: 12,
            comment: 'Reliable and fast laptop for professionals.',
        },
        variants: [
            {
                sku: 'LENOVO-X1-I7-16GB',
                price: 1899.99,
                stock: 25,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i7' },
                    { name: 'RAM', value: '16GB' },
                ],
            },
        ],
        relatedProductIds: [4, 8],
    },
    {
        categoryId: 1,
        name: 'iPad Pro 12.9-inch (5th Generation)',
        description: 'The iPad Pro features an M1 chip, 12.9-inch Liquid Retina XDR display, and supports Apple Pencil.',
        price: 1099.99,
        totalStock: 60,
        imageUrl: [
            '/uploads/ipadpro12.jpg',
            '/uploads/ipadpro12.jpg',
            '/uploads/ipadpro12.jpg',
            '/uploads/ipadpro12.jpg',
            '/uploads/ipadpro12.jpg',
        ],
        review: {
            rating: 5,
            userId: 13,
            comment: 'Powerful tablet with stunning display.',
        },
        variants: [
            {
                sku: 'IPADPRO12-128GB',
                price: 1099.99,
                stock: 40,
                attributes: [
                    { name: 'Storage', value: '128GB' },
                    { name: 'Color', value: 'Space Gray' },
                ],
            },
            {
                sku: 'IPADPRO12-256GB',
                price: 1299.99,
                stock: 20,
                attributes: [
                    { name: 'Storage', value: '256GB' },
                    { name: 'Color', value: 'Silver' },
                ],
            },
        ],
        relatedProductIds: [1, 5],
    },
    {
        categoryId: 2,
        name: 'Apple AirPods Pro (2nd Generation)',
        description: 'Active Noise Cancellation, Transparency mode, and up to 6 hours of listening time with a single charge.',
        price: 249.99,
        totalStock: 150,
        imageUrl: ['/uploads/airpodspro2.jpg'],
        review: {
            rating: 5,
            userId: 14,
            comment: 'Fantastic sound and noise cancellation.',
        },
        variants: [
            {
                sku: 'AIRPODSPRO2',
                price: 249.99,
                stock: 150,
                attributes: [
                    { name: 'Generation', value: '2nd' },
                ],
            },
        ],
        relatedProductIds: [5, 6],
    },
    {
        categoryId: 3,
        name: 'Harman Kardon Onyx Studio 6 Bluetooth Speaker',
        description: 'Stylish and powerful with a 6-hour battery life, perfect for parties or home use.',
        price: 399.99,
        totalStock: 80,
        imageUrl: ['/uploads/harmankardononyx6.jpg'],
        review: {
            rating: 4,
            userId: 15,
            comment: 'Great bass and sleek design.',
        },
        variants: [
            {
                sku: 'HARMANONYX6-BLK',
                price: 399.99,
                stock: 80,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [7, 11],
    },
    {
        categoryId: 4,
        name: 'HP Spectre x360 14',
        description: 'Convertible 2-in-1 laptop with a 14-inch OLED display, Intel Core i7, and 16GB of RAM.',
        price: 1599.99,
        totalStock: 40,
        imageUrl: ['/uploads/hpspectrex360.jpg'],
        review: {
            rating: 4,
            userId: 16,
            comment: 'Flexible and powerful convertible laptop.',
        },
        variants: [
            {
                sku: 'HPSPECTREX360-I7',
                price: 1599.99,
                stock: 40,
                attributes: [
                    { name: 'Processor', value: 'Intel Core i7' },
                    { name: 'RAM', value: '16GB' },
                ],
            },
        ],
        relatedProductIds: [4, 20],
    },
    {
        categoryId: 1,
        name: 'Apple MacBook Air (M1 Chip)',
        description: 'The 13.3-inch MacBook Air features Apple’s M1 chip, 8GB RAM, and all-day battery life.',
        price: 999.99,
        totalStock: 50,
        imageUrl: ['/uploads/macbookairm1.jpg'],
        review: {
            rating: 5,
            userId: 17,
            comment: 'Light, fast, and great battery life.',
        },
        variants: [
            {
                sku: 'MACBOOKAIR-M1-8GB',
                price: 999.99,
                stock: 50,
                attributes: [
                    { name: 'RAM', value: '8GB' },
                    { name: 'Processor', value: 'Apple M1' },
                ],
            },
        ],
        relatedProductIds: [1, 14],
    },
    {
        categoryId: 2,
        name: 'Sony PlayStation 5',
        description: 'The latest gaming console from Sony, featuring stunning graphics, fast load times, and exclusive games.',
        price: 499.99,
        totalStock: 200,
        imageUrl: ['/uploads/ps5.jpg'],
        review: {
            rating: 5,
            userId: 18,
            comment: 'Next-gen gaming experience is fantastic!',
        },
        variants: [
            {
                sku: 'PS5-DIGITAL',
                price: 399.99,
                stock: 80,
                attributes: [
                    { name: 'Edition', value: 'Digital' },
                ],
            },
            {
                sku: 'PS5-DISC',
                price: 499.99,
                stock: 120,
                attributes: [
                    { name: 'Edition', value: 'Disc' },
                ],
            },
        ],
        relatedProductIds: [19, 22],
    },
    {
        categoryId: 3,
        name: 'Razer DeathAdder V2 Gaming Mouse',
        description: 'Precision optical sensor, ultra-fast response time, and customizable RGB lighting make this the ultimate gaming mouse.',
        price: 69.99,
        totalStock: 300,
        imageUrl: ['/uploads/razerdeathadderv2.jpg'],
        review: {
            rating: 4,
            userId: 19,
            comment: 'Comfortable and responsive gaming mouse.',
        },
        variants: [
            {
                sku: 'RAZERDA-V2-BLK',
                price: 69.99,
                stock: 300,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [22, 24],
    },
    {
        categoryId: 4,
        name: 'Corsair Vengeance LPX 16GB (2 x 8GB) DDR4 RAM',
        description: 'High-performance RAM with a sleek heat spreader, ideal for gaming and intensive applications.',
        price: 89.99,
        totalStock: 150,
        imageUrl: ['/uploads/corsairvengeance.jpg'],
        review: {
            rating: 5,
            userId: 20,
            comment: 'Reliable RAM with great overclocking potential.',
        },
        variants: [
            {
                sku: 'CORSAIR16GB-DDR4',
                price: 89.99,
                stock: 150,
                attributes: [
                    { name: 'Capacity', value: '16GB' },
                    { name: 'Type', value: 'DDR4' },
                ],
            },
        ],
        relatedProductIds: [24, 28],
    },
    {
        categoryId: 1,
        name: 'Sony A7 III Mirrorless Camera',
        description: 'Full-frame mirrorless camera with a 24.2MP sensor, 4K video recording, and exceptional autofocus.',
        price: 1999.99,
        totalStock: 30,
        imageUrl: ['/uploads/sonya7iii.jpg'],
        review: {
            rating: 5,
            userId: 21,
            comment: 'Excellent image quality and autofocus speed.',
        },
        variants: [
            {
                sku: 'SONYA7III-BODY',
                price: 1999.99,
                stock: 30,
                attributes: [
                    { name: 'Type', value: 'Body Only' },
                ],
            },
        ],
        relatedProductIds: [23, 25],
    },
    {
        categoryId: 2,
        name: 'Nintendo Switch OLED Model',
        description: 'The Nintendo Switch OLED model features a 7-inch OLED screen, improved audio, and a more stable kickstand.',
        price: 349.99,
        totalStock: 80,
        imageUrl: ['/uploads/nintendoswitcholed.jpg'],
        review: {
            rating: 4,
            userId: 22,
            comment: 'Great display and solid gaming experience.',
        },
        variants: [
            {
                sku: 'NSWITCH-OLED',
                price: 349.99,
                stock: 80,
                attributes: [
                    { name: 'Model', value: 'OLED' },
                ],
            },
        ],
        relatedProductIds: [19, 26],
    },
    {
        categoryId: 3,
        name: 'Amazon Echo Studio',
        description: 'A premium smart speaker with 3D audio, Dolby Atmos, and Alexa integration.',
        price: 199.99,
        totalStock: 100,
        imageUrl: ['/uploads/echo-studio.jpg'],
        review: {
            rating: 4,
            userId: 23,
            comment: 'Impressive sound and smart features.',
        },
        variants: [
            {
                sku: 'ECHOSTUDIO-BLK',
                price: 199.99,
                stock: 100,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [11, 15],
    },
    {
        categoryId: 4,
        name: 'Logitech MX Master 3 Wireless Mouse',
        description: 'Ergonomically designed wireless mouse with customizable buttons and long battery life.',
        price: 99.99,
        totalStock: 120,
        imageUrl: ['/uploads/logitechmxmaster3.jpg'],
        review: {
            rating: 5,
            userId: 24,
            comment: 'Ergonomic and highly customizable mouse.',
        },
        variants: [
            {
                sku: 'LOGIMXMASTER3-BLK',
                price: 99.99,
                stock: 120,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [24, 27],
    },
    {
        categoryId: 1,
        name: 'Canon EOS 90D DSLR Camera',
        description: 'A DSLR with a 32.5MP sensor, 4K video recording, and fast autofocus, perfect for photography and vlogging.',
        price: 1299.99,
        totalStock: 40,
        imageUrl: ['/uploads/canon90d.jpg'],
        review: {
            rating: 5,
            userId: 25,
            comment: 'Fantastic DSLR with versatile features.',
        },
        variants: [
            {
                sku: 'CANON90D-BODY',
                price: 1299.99,
                stock: 40,
                attributes: [
                    { name: 'Type', value: 'Body Only' },
                ],
            },
        ],
        relatedProductIds: [23, 29],
    },
    {
        categoryId: 2,
        name: 'Google Pixel 6 Pro',
        description: 'Google’s flagship smartphone with a 6.7-inch OLED display, Tensor chip, and 5G connectivity.',
        price: 899.99,
        totalStock: 60,
        imageUrl: ['/uploads/googlepixel6pro.jpg'],
        review: {
            rating: 4,
            userId: 26,
            comment: 'Clean Android experience with excellent camera.',
        },
        variants: [
            {
                sku: 'PIXEL6PRO-128GB',
                price: 899.99,
                stock: 60,
                attributes: [
                    { name: 'Storage', value: '128GB' },
                    { name: 'Color', value: 'Stormy Black' },
                ],
            },
        ],
        relatedProductIds: [2, 19],
    },
    {
        categoryId: 3,
        name: 'Bose SoundLink Revolve+ Bluetooth Speaker',
        description: '360-degree sound, 16 hours of battery life, and a water-resistant design make this speaker ideal for any environment.',
        price: 299.99,
        totalStock: 50,
        imageUrl: ['/uploads/bosesoundlinkrevolve.jpg'],
        review: {
            rating: 5,
            userId: 27,
            comment: 'Great sound in all directions and portable.',
        },
        variants: [
            {
                sku: 'BOSESLREVOLVE-BLK',
                price: 299.99,
                stock: 50,
                attributes: [
                    { name: 'Color', value: 'Black' },
                ],
            },
        ],
        relatedProductIds: [7, 11],
    },
    {
        categoryId: 4,
        name: 'Apple Mac Mini (M1 Chip)',
        description: 'Compact desktop with Apple’s M1 chip, 8GB RAM, and exceptional performance for professional work.',
        price: 699.99,
        totalStock: 80,
        imageUrl: ['/uploads/macminiM1.jpg'],
        review: {
            rating: 4,
            userId: 28,
            comment: 'Compact and fast desktop for professionals.',
        },
        variants: [
            {
                sku: 'MACMINI-M1-8GB',
                price: 699.99,
                stock: 80,
                attributes: [
                    { name: 'RAM', value: '8GB' },
                    { name: 'Processor', value: 'Apple M1' },
                ],
            },
        ],
        relatedProductIds: [1, 14],
    },
];

module.exports = sampleProducts;