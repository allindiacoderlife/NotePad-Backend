const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const app = express();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI("AIzaSyDBqwTH6xuScPRdfKZaj_LAM_CZDB1A1Hg");

// Set up the storage engine with Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Where to save the files
    },
    filename: function (req, file, cb) {
        // Generate a unique identifier for the file
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    },
});

// Configure multer to accept single image uploads
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Serve the "uploads" directory publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Call the Gemini AI (or any other image recognition API) here
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const propt = "you are mathematical genius . find the problem in the image and provide the solution. make it simple , short and easy to understand.";
        const image = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(req.file.path)).toString("base64"),
                mimeType: "image/png",
            },
        };

        const result = await model.generateContent([ image,propt]);
        const mathProblem = await result.response.text();

        // Return the URL of the uploaded image
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ message: 'Image uploaded successfully', imageUrl, mathProblem });
    } catch (err) {
        res.status(500).send('Server error: ' + err.message);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
