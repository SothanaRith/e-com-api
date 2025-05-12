const sampleReviews = [
    {
        productId: 1,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 2,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 3,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 4,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 5,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 6,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 7,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 8,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 9,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 10, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 11, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 12, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 13, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
    {
        productId: 14, // Apple AirPods Pro (2nd Generation)
        userId: 1,     // Assuming User 14 is a valid user
        rating: 4,
        comment: 'Love the new sound quality, but they’re a bit large for my ears.',
    },
    {
        productId: 15, // Harman Kardon Onyx Studio 6 Bluetooth Speaker
        userId: 1,     // Assuming User 15 is a valid user
        rating: 5,
        comment: 'The sound is incredibly clear and full. Perfect for any room.',
    },
    {
        productId: 16, // HP Spectre x360 14
        userId: 1,     // Assuming User 16 is a valid user
        rating: 5,
        comment: 'A premium laptop with an elegant design and excellent performance.',
    },
    {
        productId: 17, // Apple MacBook Air (M1 Chip)
        userId: 1,     // Assuming User 17 is a valid user
        rating: 5,
        comment: 'Incredible performance with the M1 chip, and the battery lasts all day.',
    },
    {
        productId: 18, // Sony A7 III Mirrorless Camera
        userId: 1,     // Assuming User 18 is a valid user
        rating: 5,
        comment: 'The autofocus is extremely fast, and the image quality is outstanding.',
    },
    {
        productId: 19, // Google Pixel 6 Pro
        userId: 1,     // Assuming User 19 is a valid user
        rating: 5,
        comment: 'Excellent performance, camera, and display. Google really nailed it with this one.',
    },
    {
        productId: 20, // JBL Flip 5 Bluetooth Speaker
        userId: 1,     // Assuming User 20 is a valid user
        rating: 4,
        comment: 'The sound is great for a portable speaker, but the battery could be better.',
    },
    {
        productId: 1,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 2,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 3,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 4,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 5,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 6,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 7,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 8,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 9,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 10, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 11, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 12, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 13, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
    {
        productId: 14, // Apple AirPods Pro (2nd Generation)
        userId: 1,     // Assuming User 14 is a valid user
        rating: 4,
        comment: 'Love the new sound quality, but they’re a bit large for my ears.',
    },
    {
        productId: 15, // Harman Kardon Onyx Studio 6 Bluetooth Speaker
        userId: 1,     // Assuming User 15 is a valid user
        rating: 5,
        comment: 'The sound is incredibly clear and full. Perfect for any room.',
    },
    {
        productId: 16, // HP Spectre x360 14
        userId: 1,     // Assuming User 16 is a valid user
        rating: 5,
        comment: 'A premium laptop with an elegant design and excellent performance.',
    },
    {
        productId: 17, // Apple MacBook Air (M1 Chip)
        userId: 1,     // Assuming User 17 is a valid user
        rating: 5,
        comment: 'Incredible performance with the M1 chip, and the battery lasts all day.',
    },
    {
        productId: 18, // Sony A7 III Mirrorless Camera
        userId: 1,     // Assuming User 18 is a valid user
        rating: 5,
        comment: 'The autofocus is extremely fast, and the image quality is outstanding.',
    },
    {
        productId: 19, // Google Pixel 6 Pro
        userId: 1,     // Assuming User 19 is a valid user
        rating: 5,
        comment: 'Excellent performance, camera, and display. Google really nailed it with this one.',
    },
    {
        productId: 20, // JBL Flip 5 Bluetooth Speaker
        userId: 1,     // Assuming User 20 is a valid user
        rating: 4,
        comment: 'The sound is great for a portable speaker, but the battery could be better.',
    },
    {
        productId: 21,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 22,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 23,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 24,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 25,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 26,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 27,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 28,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 29,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 30, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 31, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 32, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 33, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
    {
        productId: 34, // Apple AirPods Pro (2nd Generation)
        userId: 1,     // Assuming User 14 is a valid user
        rating: 4,
        comment: 'Love the new sound quality, but they’re a bit large for my ears.',
    },
    {
        productId: 35, // Harman Kardon Onyx Studio 6 Bluetooth Speaker
        userId: 1,     // Assuming User 15 is a valid user
        rating: 5,
        comment: 'The sound is incredibly clear and full. Perfect for any room.',
    },
    {
        productId: 36, // HP Spectre x360 14
        userId: 1,     // Assuming User 16 is a valid user
        rating: 5,
        comment: 'A premium laptop with an elegant design and excellent performance.',
    },
    {
        productId: 37, // Apple MacBook Air (M1 Chip)
        userId: 1,     // Assuming User 17 is a valid user
        rating: 5,
        comment: 'Incredible performance with the M1 chip, and the battery lasts all day.',
    },
    {
        productId: 38, // Sony A7 III Mirrorless Camera
        userId: 1,     // Assuming User 18 is a valid user
        rating: 5,
        comment: 'The autofocus is extremely fast, and the image quality is outstanding.',
    },
    {
        productId: 39, // Google Pixel 6 Pro
        userId: 1,     // Assuming User 19 is a valid user
        rating: 5,
        comment: 'Excellent performance, camera, and display. Google really nailed it with this one.',
    },
    {
        productId: 40, // JBL Flip 5 Bluetooth Speaker
        userId: 1,     // Assuming User 20 is a valid user
        rating: 4,
        comment: 'The sound is great for a portable speaker, but the battery could be better.',
    },
    {
        productId: 41,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 42,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 43,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 44,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 45,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 46,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 47,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 48,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 49,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 50, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 51, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 52, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 53, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
    {
        productId: 54, // Apple AirPods Pro (2nd Generation)
        userId: 1,     // Assuming User 14 is a valid user
        rating: 4,
        comment: 'Love the new sound quality, but they’re a bit large for my ears.',
    },
    {
        productId: 55, // Harman Kardon Onyx Studio 6 Bluetooth Speaker
        userId: 1,     // Assuming User 15 is a valid user
        rating: 5,
        comment: 'The sound is incredibly clear and full. Perfect for any room.',
    },
    {
        productId: 56, // HP Spectre x360 14
        userId: 1,     // Assuming User 16 is a valid user
        rating: 5,
        comment: 'A premium laptop with an elegant design and excellent performance.',
    },
    {
        productId: 57, // Apple MacBook Air (M1 Chip)
        userId: 1,     // Assuming User 17 is a valid user
        rating: 5,
        comment: 'Incredible performance with the M1 chip, and the battery lasts all day.',
    },
    {
        productId: 58, // Sony A7 III Mirrorless Camera
        userId: 1,     // Assuming User 18 is a valid user
        rating: 5,
        comment: 'The autofocus is extremely fast, and the image quality is outstanding.',
    },
    {
        productId: 59, // Google Pixel 6 Pro
        userId: 1,     // Assuming User 19 is a valid user
        rating: 5,
        comment: 'Excellent performance, camera, and display. Google really nailed it with this one.',
    },
    {
        productId: 60, // JBL Flip 5 Bluetooth Speaker
        userId: 1,     // Assuming User 20 is a valid user
        rating: 4,
        comment: 'The sound is great for a portable speaker, but the battery could be better.',
    },
    {
        productId: 61,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 62,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 63,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 64,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 65,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 66,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 67,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 68,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 69,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 70, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 71, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 72, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 73, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
    {
        productId: 74, // Apple AirPods Pro (2nd Generation)
        userId: 1,     // Assuming User 14 is a valid user
        rating: 4,
        comment: 'Love the new sound quality, but they’re a bit large for my ears.',
    },
    {
        productId: 75, // Harman Kardon Onyx Studio 6 Bluetooth Speaker
        userId: 1,     // Assuming User 15 is a valid user
        rating: 5,
        comment: 'The sound is incredibly clear and full. Perfect for any room.',
    },
    {
        productId: 76, // HP Spectre x360 14
        userId: 1,     // Assuming User 16 is a valid user
        rating: 5,
        comment: 'A premium laptop with an elegant design and excellent performance.',
    },
    {
        productId: 77, // Apple MacBook Air (M1 Chip)
        userId: 1,     // Assuming User 17 is a valid user
        rating: 5,
        comment: 'Incredible performance with the M1 chip, and the battery lasts all day.',
    },
    {
        productId: 78, // Sony A7 III Mirrorless Camera
        userId: 1,     // Assuming User 18 is a valid user
        rating: 5,
        comment: 'The autofocus is extremely fast, and the image quality is outstanding.',
    },
    {
        productId: 79, // Google Pixel 6 Pro
        userId: 1,     // Assuming User 19 is a valid user
        rating: 5,
        comment: 'Excellent performance, camera, and display. Google really nailed it with this one.',
    },
    {
        productId: 80, // JBL Flip 5 Bluetooth Speaker
        userId: 1,     // Assuming User 20 is a valid user
        rating: 4,
        comment: 'The sound is great for a portable speaker, but the battery could be better.',
    },
    {
        productId: 81,  // Assuming Product 1 is the iPhone 13 Pro Max
        userId: 1,      // Assuming User 1 is a valid user
        rating: 5,
        comment: 'Amazing phone! The camera is top-notch and the battery lasts all day.',
    },
    {
        productId: 82,  // Samsung Galaxy S21 Ultra
        userId: 1,      // Assuming User 2 is a valid user
        rating: 4,
        comment: 'Great phone with a fantastic screen, but a little pricey.',
    },
    {
        productId: 83,  // Sony WH-1000XM4 Noise Cancelling Headphones
        userId: 1,      // Assuming User 3 is a valid user
        rating: 5,
        comment: 'Best noise-cancelling headphones I’ve ever used! Great sound quality.',
    },
    {
        productId: 84,  // Dell XPS 13 Laptop
        userId: 1,      // Assuming User 4 is a valid user
        rating: 4,
        comment: 'Beautiful laptop, but I wish the battery life was longer.',
    },
    {
        productId: 85,  // Apple Watch Series 7
        userId: 1,      // Assuming User 5 is a valid user
        rating: 5,
        comment: 'I love the larger screen and faster charging. Perfect for fitness tracking!',
    },
    {
        productId: 86,  // Samsung Galaxy Buds Pro
        userId: 1,      // Assuming User 6 is a valid user
        rating: 5,
        comment: 'These buds are great! Sound quality is awesome, and they fit perfectly.',
    },
    {
        productId: 87,  // Bose QuietComfort 35 II
        userId: 1,      // Assuming User 7 is a valid user
        rating: 5,
        comment: 'Incredible sound and noise cancellation. A must-have for travel.',
    },
    {
        productId: 88,  // Microsoft Surface Laptop 4
        userId: 1,      // Assuming User 8 is a valid user
        rating: 4,
        comment: 'Great laptop, but the screen is a little reflective under bright light.',
    },
    {
        productId: 89,  // GoPro HERO10 Black
        userId: 1,      // Assuming User 9 is a valid user
        rating: 5,
        comment: 'Fantastic for vlogging and outdoor adventures. The 5.3K video quality is amazing.',
    },
    {
        productId: 90, // Fitbit Charge 5
        userId: 1,     // Assuming User 10 is a valid user
        rating: 4,
        comment: 'Great fitness tracker with an easy-to-read display and solid tracking features.',
    },
    {
        productId: 91, // JBL Charge 5 Portable Bluetooth Speaker
        userId: 1,     // Assuming User 11 is a valid user
        rating: 5,
        comment: 'Great sound and battery life. Perfect for parties and outdoor use.',
    },
    {
        productId: 92, // Lenovo ThinkPad X1 Carbon
        userId: 1,     // Assuming User 12 is a valid user
        rating: 5,
        comment: 'Lightweight, durable, and powerful. Excellent for work and travel.',
    },
    {
        productId: 93, // iPad Pro 12.9-inch (5th Generation)
        userId: 1,     // Assuming User 13 is a valid user
        rating: 5,
        comment: 'The display is stunning and the M1 chip makes it incredibly fast. A fantastic tablet.',
    },
];

module.exports = sampleReviews;
