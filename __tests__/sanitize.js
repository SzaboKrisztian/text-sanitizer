const { sanitize } = require('../sanitize');
const mockData = require('../__mocks__/user_input');

const user = { firstName: 'Benicio Monserrate Rafael', lastName: 'del Toro Sánchez' };

describe('Sanitize tests', () => {
    beforeEach(() => jest.resetAllMocks());

    test('It should not find restricted content in valid inputs', () => {
        mockData.validInputs.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                original,
                sanitized: original,
                hasRestrictedContent: false,
                mask: null,
            });
        });
    });

    test('It should find and restrict phone numbers', () => {
        mockData.withPhone.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: true,
            });
            expect(result.sanitized).not.toEqual(original);
            expect(result.mask).toBeTruthy();
            expect(result.sanitized.includes(result.mask)).toBeTruthy();
        });
    });

    test('It should find and restrict email addresses', () => {
        mockData.withEmail.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: true,
            });
            expect(result.sanitized).not.toEqual(original);
            expect(result.mask).toBeTruthy();
            expect(result.sanitized.includes(result.mask)).toBeTruthy();
        });
    });

    test('It should find and restrict web urls', () => {
        mockData.withLink.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: true,
            });
            expect(result.sanitized).not.toEqual(original);
            expect(result.mask).toBeTruthy();
            expect(result.sanitized.includes(result.mask)).toBeTruthy();
        });
    });

    test('It should find and restrict mentions of social media', () => {
        mockData.withSocialMedia.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: true,
            });
        });
    });

    test('It should shorten the user\'s name', () => {
        mockData.withNames.forEach(entry => {
            const original = entry.text.trim();
            const result = sanitize(original, entry.user);
            expect(result).toMatchObject({
                hasRestrictedContent: false,
            });
            expect(result.sanitized.includes(entry.expected)).toBeTruthy();
        });
    });
});
