import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill fetch/Request/Response

// Mock scrollIntoView for JSDOM
if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = jest.fn();
}

process.env.GOOGLE_AI_API_KEY = 'test-api-key';
