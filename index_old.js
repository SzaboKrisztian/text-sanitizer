const { findNumbers } = require('libphonenumber-js');
const fs = require('fs');
const path = require('path');

if (require.main === module) {
    if (process.argv.length < 3) {
        console.error('No input to process');
        process.exit(1);
    }
    const filenames = process.argv.slice(2);
    filenames.forEach(file => {
        const fullPath = path.resolve(__dirname, file);
        try {
            fs.accessSync(fullPath);
            const contents = fs.readFileSync(fullPath);
            const censored = censor(contents.toString());
            console.log(`----------\n${fullPath}\n----------\n`);
            console.log(censored);
            console.log(`----------\nHas it been censored? ${censored.includes('****')}\n\n`);
        } catch (error) {
            console.error(error.message);
        }
    });
}

function censor(text) {
    text = hideFullName(text);
        // transform words to numbers
        // makes a copy of the string with numbers instead on words
        // i.e. one -> 1
        let textCopy = detectWordNumbers(text.toLowerCase());
        // hide dk phone numbers
        const phoneNumbers = findNumbers(textCopy, 'DK');
        for (let j = phoneNumbers.length - 1; j >= 0; j -= 1) {
            textCopy = textCopy
                .substring(0, phoneNumbers[j].startsAt)
                .concat('*'.repeat(phoneNumbers[j].endsAt - phoneNumbers[j].startsAt))
                .concat(textCopy.substring(phoneNumbers[j].endsAt, textCopy.length));
        }
        // Custom linkify && Emails
        textCopy = linkify(textCopy);
        return textCopy.includes('*****') ? textCopy : text;
}

function detectWordNumbers(comment) {
    const numbersMap = {
        nul: 0,
        en: 1,
        to: 2,
        tre: 3,
        fire: 4,
        fem: 5,
        seks: 6,
        syv: 7,
        otte: 8,
        ni: 9,
        ti: 10,
        facebook: 22801348,
        whatsapp: 22801348,
        fb: 22801348,
        '@': 22801348,
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
    };

    let a, g;

    a = comment.toString().split(/[\s-]+/);
    g = '';
    a.forEach(feach);
    return g;

    function feach(w) {
        const x = numbersMap[w];
        if (x != null) {
            g = isNaN(g.slice(-1)) ? g : g.trim();
            numbersMap[w - 1] == null ? (g += ' ') : g;
            g = g + x + '';
        } else {
            g = g + ' ' + w;
        }
    }
}

function hideFullName(inputText) {
    if (!this.userFirstName || !this.userLastName || this.userLastName.trim().length <= 1) {
        return inputText;
    }
    const regexString = "first[\\W_]*last"
        .replace("first", this.userFirstName)
        .replace("last", this.userLastName);
    const fullNameRegex = new RegExp(regexString, "gim");
    inputText = inputText.replace(fullNameRegex, `${this.userFirstName} ${this.userLastName[0]}.`);
    return inputText;
}

function linkify(inputText) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    // URLs starting with http://, https://, or ftp://
    replacePattern1 = /((https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '*****');

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '*****');

    // Catch replace email address.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '*****');

    return replacedText;
}
