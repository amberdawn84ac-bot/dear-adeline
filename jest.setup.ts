import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill fetch/Request/Response

// Mock scrollIntoView for JSDOM
if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = jest.fn();
}
