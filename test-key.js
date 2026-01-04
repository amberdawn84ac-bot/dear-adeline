const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
    const key = 'AIzaSyANT4241K7SN109pVuj6AF-GR1i9GyiKJ8';

    try {
        const genAI = new GoogleGenerativeAI(key);
        console.log('Trying gemini-2.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Hello');
        console.log('Success with gemini-2.5-flash! Response:', result.response.text());
    } catch (error) {
        console.error('Error with gemini-2.5-flash:', error.message);
    }
}

testKey();
