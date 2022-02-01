import fs from 'fs';
import path from 'path';

import { sanitize } from './sanitize';

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
            const sanitized = sanitize(contents.toString(), undefined, true);
            console.log(`----------\n${fullPath}\n----------\n`);
            console.log(sanitized);
            console.log(`----------\nHas it been censored? ${sanitized.hasRestrictedContent}\n\n`);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error('Something went wrong');
            }
        }
    });
}
