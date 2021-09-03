import { sanitize } from '../sanitize';
import { default as mockData } from '../__mocks__';

const verbose = false;

const user = { firstName: 'Benicio Monserrate Rafael', lastName: 'del Toro Sánchez', userId: 666 };

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
            if (verbose) console.log('phone', result);
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
            if (verbose) console.log('emails', result);
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
            if (verbose) console.log('links', result);
        });
    });

    test('It should not restrict web urls from whitelisted domains', () => {
        mockData.withWhitelistedLink.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: false,
                original,
                sanitized: original,
                mask: null
            });
            if (verbose) console.log('whitelisted links', result);
        });
    });

    test('It should find and restrict mentions of social media', () => {
        mockData.withSocialMedia.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user);
            expect(result).toMatchObject({
                hasRestrictedContent: true,
            });
            if (verbose) console.log('social - restrict', result);
        });
    });

    test('It should not restrict mentions of social media with the right flag', () => {
        mockData.withSocialMedia.forEach(text => {
            const original = text.trim();
            const result = sanitize(original, user, false);
            expect(result).toMatchObject({
                original,
                sanitized: original,
                hasRestrictedContent: false,
                mask: null,
            });
            if (verbose) console.log('social - don\'t restrict', result);
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
            if (verbose) console.log('username', result);
        });
    });
});
