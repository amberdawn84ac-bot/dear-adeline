const key = 'AIzaSyANT4241K7SN109pVuj6AF-GR1i9GyiKJ8';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
