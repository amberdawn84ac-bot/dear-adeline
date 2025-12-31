// jest.setup.ts
import '@testing-library/jest-dom';

// Mock scrollIntoView for JSDOM
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}