const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");


const genAI = new GoogleGenerativeAI("AIzaSyDBqwTH6xuScPRdfKZaj_LAM_CZDB1A1Hg");

const gemini = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // const prompt = "Does this look solve the problem?";
    const image = {
        inlineData: {
            data: Buffer.from(fs.readFileSync("3.png")).toString("base64"),
            mimeType: "image/png",
        },
    };

    const result = await model.generateContent([image]);
    console.log(result.response.text());
}

gemini();