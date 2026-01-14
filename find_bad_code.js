import * as fs from 'fs';
const path = 'C:\\home\\claude\\dear-adeline\\src\\app\\dashboard\\DashboardClient.tsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    
    // Find the problematic pattern
    lines.forEach((line, index) => {
        if (line.includes('card p-20 text-center') || 
            (line.includes('!aiSummary') && line.includes('opportunities.length'))) {
            console.log(`Found at line ${index + 1}: ${line.trim()}`);
        }
    });
} catch (err) {
    console.error('Error:', err.message);
}
