const maskChars = '§¶¤¥¢£¦©®$^#~';

const numbersMap = {
    nul: '000',
    en: '11',
    to: '22',
    tre: '333',
    fire: '4444',
    fem: '555',
    seks: '6666',
    syv: '777',
    otte: '8888',
    ni: '99',
    zero: '0000',
    one: '111',
    two: '222',
    three: '33333',
    four: '4444',
    five: '5555',
    six: '666',
    seven: '77777',
    eight: '88888',
    nine: '9999',
};

const bannedWords = /\b(facebook|whatsapp|instagram|telegram|mobilepay)/gim;
const emailPattern = /[\w\d\-.]+\s*(?:@)\s*(?:[\w\d\-]+\s*(?:\.)\s*)+\w{2,}/gim;
const linkPattern = /(?:(?:https?|ftp):\/{2})?(?:(?:www|ftp)\.)?(?:[a-z0-9\-_]+\.)+(?:com|net|org|de|co\.uk|ru|info|top|xyz|se|no|nl|dk)/gim;

const urlWhitelist = [
    'ikea.com',
    'ilva.dk',
    'jysk.dk',
    'illumsbolighus.com',
    'vvs-eksperten.dk',
    'elgiganten.dk',
    'youtube.com',
    'jemogfix.dk',
    'philips-hue.com',
];

export function sanitize(text: string, user?: { firstName: string, lastName: string }, restrictWords = true) {
    const firstName = user ? user.firstName : undefined;
    const lastName = user ? user.lastName : undefined;
    const original = text.trim();
    const maskChar = findMask(original);

    let result: string = /*firstName && lastName ? findName(original, firstName, lastName) :*/ original;
    const emailResult = findEmail(result, maskChar);
    result = emailResult.sanitized ? emailResult.sanitized : result;
    const linkResult = findLinks(result, maskChar);
    result = linkResult.sanitized ? linkResult.sanitized : result;
    const phoneResult = findPhoneNumbers(result, maskChar);
    result = phoneResult.sanitized ? phoneResult.sanitized : result;
    const bannedWords = restrictWords ? findBannedWords(result) : false;

    const hasRestrictedContent = [
        phoneResult.sanitized !== undefined,
        emailResult.sanitized !== undefined,
        linkResult.sanitized !== undefined,
        bannedWords,
    ].some(found => found === true);
    const mask = hasRestrictedContent ? maskChar : null;

    return {
        original,
        sanitized: result,
        hasRestrictedContent,
        mask,
    }
}

function findMask(text: string): string {
    for (let i = 0; i < maskChars.length; i += 1) {
        const maskChar = maskChars.substr(i, 1);
        if (!text.includes(maskChar)) {
            return maskChar;
        }
    }
    return maskChars.charAt(0);
}

function findBannedWords(text: string) {
    return text.match(bannedWords) !== null;
}

function findName(text: string, firstName: string, lastName: string): string {
    if (!text || !firstName || !lastName) {
        throw new Error('Missing required parameters');
    }

    const wordsInFirst = firstName.split(/\s|-/);
    const first = wordsInFirst.length > 0 ? wordsInFirst[0] : null;

    const wordsInLast = lastName.split(/\s|-/);
    const firstLast = wordsInLast.length > 0 ? wordsInLast[0] : null;
    const lastLast = wordsInLast.length > 0 ? wordsInLast[wordsInLast.length - 1] : null;
    
    if (!first || !firstLast || !lastLast) {
        return text;
    }

    const matcher = new RegExp(`${first.replace('.', '\.')}.*?${lastLast.replace('.', '\.')}`, 'gim');
    const replacement = `${first.charAt(0).toUpperCase()}${first.substr(1).toLowerCase()} ${firstLast.charAt(0).toUpperCase()}.`;
    return text.replace(matcher, replacement);
}

function getEnd(text: string, matchStart: number): number {
    const nextSpaceIdx = text.indexOf(' ', matchStart);
    return nextSpaceIdx === -1 ? text.length : nextSpaceIdx;
}

function findPhoneNumbers(text: string, mask: string) {
    const replacedNumberWords = replaceNumberWords(text);
    if (!replacedNumberWords.match(/\d+/gi)) {
        return { found: false }
    }

    const links = Array.from(text.matchAll(linkPattern));
    const linkCoords = links.map(e => ({ start: e.index, end: getEnd(text, e.index) }));
    const numbers: IterableIterator<RegExpMatchArray> = replacedNumberWords.matchAll(/(?:\d(?:[^\d](?=\d))?){8,}/gi);
    const matches = Array.from(numbers);
    let result = text.slice();
    for (let i = 0; i < matches.length; i += 1) {
        const match = matches[i];
        
        // We want to avoid censoring numbers inside links
        const containingLink = linkCoords.find(e => match.index >= e.start && match.index < e.end);
        if (!containingLink) {
            result = result.substr(0, match.index)
                + mask.repeat(match[0].length)
                + result.substr(match.index! + match[0].length);
        }
    }

    return {
        sanitized: result.includes(mask) ? result : undefined
    }
}

function findLinks(text: string, mask: string) {
    const links = Array.from(text.matchAll(linkPattern));
    let result = text.slice();
    links.forEach(match => {
        for (let i = 0; i < urlWhitelist.length; i += 1) {
            if (match[0].includes(urlWhitelist[i])) {
                return;
            }
        }
        result = result.substr(0, match.index)
            + mask.repeat(match[0].length)
            + result.substr(match.index! + match[0].length);
    });

    return {
        sanitized: result.includes(mask) ? result : undefined
    }
}

function findEmail(text: string, mask: string) {
    const matches: IterableIterator<RegExpMatchArray> = text.matchAll(emailPattern)
    const mails: RegExpMatchArray[] = Array.from(matches);
    let result = text.slice();
    mails.forEach(match => {
        result = result.substr(0, match.index)
            + mask.repeat(match[0].length)
            + result.substr(match.index! + match[0].length);
    });

    return {
        sanitized: mails.length > 0 ? result : undefined
    }
}

function replaceNumberWords(text: string) {
    let result = text;
    Object.keys(numbersMap).sort((a, b) => b.length - a.length).forEach(word => {
        result = result.replace(new RegExp(word, 'gim'), numbersMap[word as keyof typeof numbersMap]);
    });

    return result;
}
