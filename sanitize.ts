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

const bannedWords = /\b(facebook|whatsapp|instagram|telegram)/gim;
const emailPattern = /[\w\d]+@(?:[\w\d]+\.)+\w{2,}/gim
const linkPattern = /(?:(?:https?|ftp):\/{2})?(?:(?:www|ftp)\.)?(?:[a-z0-9]+\.)+(?:com|net|org|de|co\.uk|ru|info|top|xyz|se|no|nl|dk)/gim

const urlWhitelist = ['ikea.com', 'ilva.dk', 'jysk.dk', 'illumsbolighus.com'];

export function sanitize(text: string, user: { firstName: string, lastName: string }, restrictWords = true) {
    const firstName = user ? user.firstName : undefined;
    const lastName = user ? user.lastName : undefined;
    const original = text.trim();
    const maskChar = findMask(original);

    let result = user ? findName(original, firstName, lastName) : original;
    const phoneResult = findPhoneNumbers(result, maskChar);
    result = phoneResult.found ? phoneResult.sanitized : result;
    const emailResult = findEmail(result, maskChar);
    result = emailResult.found ? emailResult.sanitized : result;
    const linkResult = findLinks(result, maskChar);
    result = linkResult.found ? linkResult.sanitized : result;
    const bannedWords = restrictWords ? findBannedWords(result) : false;

    const hasRestrictedContent = [
        phoneResult.found,
        emailResult.found,
        linkResult.found,
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

function findMask(text: string) {
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

function findName(text: string, firstName: string, lastName: string) {
    if (!text || !firstName || !lastName) {
        throw new Error('Missing required parameters');
    }

    const wordsInFirst = firstName.split(/\s|-/);
    const first = wordsInFirst.length > 0 ? wordsInFirst[0] : null;

    const wordsInLast = lastName.split(/\s|-/);
    const firstLast = wordsInLast.length > 0 ? wordsInLast[0] : null;
    const lastLast = wordsInLast.length > 0 ? wordsInLast[wordsInLast.length - 1] : null;
    
    if (!first || !lastLast) {
        return text;
    }

    const matcher = new RegExp(`${first}.*?${lastLast}`, 'gim');
    const replacement = `${first.charAt(0).toUpperCase()}${first.substr(1).toLowerCase()} ${firstLast.charAt(0).toUpperCase()}.`;
    return text.replace(matcher, replacement);
}

function findPhoneNumbers(text: string, mask: string) {
    const replacedNumberWords = replaceNumberWords(text);
    if (!replacedNumberWords.match(/\d+/gi)) {
        return { found: false }
    }

    const numbers: IterableIterator<RegExpMatchArray> = replacedNumberWords.matchAll(/(?:\d(?:[^\d](?=\d))?){6,}/gi);
    const matches = Array.from(numbers);
    let result = text.slice();
    for (let i = 0; i < matches.length; i += 1) {
        result = result.substr(0, matches[i].index)
            + mask.repeat(matches[i][0].length)
            + result.substr(matches[i].index + matches[i][0].length);
    }

    if (result.includes(mask)) {
        return {
            sanitized: result,
            found: true,
        }
    } else {
        return {
            found: false,
        }
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
            + result.substr(match.index + match[0].length);
    });

    if (result.includes(mask)) {
        return {
            sanitized: result,
            found: true
        }
    } else {
        return {
            found: false
        }
    }
}

function findEmail(text: string, mask: string) {
    const matches: IterableIterator<RegExpMatchArray> = text.matchAll(emailPattern)
    const mails: RegExpMatchArray[] = Array.from(matches);
    let result = text.slice();
    mails.forEach(match => {
        result = result.substr(0, match.index)
            + mask.repeat(match[0].length)
            + result.substr(match.index + match[0].length);
    });

    if (mails.length > 0) {
        return {
            sanitized: result,
            found: true
        }
    } else {
        return {
            found: false
        }
    }
}

function replaceNumberWords(text: string) {
    let result = text;
    Object.keys(numbersMap).sort((a, b) => b.length - a.length).forEach(word => {
        result = result.replace(new RegExp(word, 'gim'), numbersMap[word]);
    });

    return result;
}
