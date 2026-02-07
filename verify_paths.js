import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { readdir, readFile, stat } = fs.promises;

const appDir = path.resolve(__dirname, 'app');

async function getHtmlFiles(dir) {
    let results = [];
    try {
        const list = await readdir(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            const fileStat = await stat(filePath);
            if (fileStat && fileStat.isDirectory()) {
                if (file !== '_deprecated') {
                    results = results.concat(await getHtmlFiles(filePath));
                }
            } else if (file.endsWith('.html')) {
                results.push(filePath);
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dir}: ${err.message}`);
    }
    return results;
}

async function verifyLinks() {
    console.log(`Scanning directory: ${appDir}`);
    const htmlFiles = await getHtmlFiles(appDir);
    let errorCount = 0;

    for (const file of htmlFiles) {
        const content = await readFile(file, 'utf8');
        const relativePath = path.relative(appDir, file);
        
        // Match src="..." and href="..."
        const regex = /(?:src|href)=["']([^"']+)["']/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            let link = match[1];

            // Strip query parameters and hash fragments
            link = link.split('?')[0].split('#')[0];

            // Ignore external links, anchors, data URLs, and root-relative paths meant for server
            if (link.startsWith('http') || link.startsWith('#') || link.startsWith('data:') || link.startsWith('mailto:')) {
                continue;
            }

            // Resolve path
            const dirName = path.dirname(file);
            let resolvedPath;
            
            if (link.startsWith('/')) {
                 // Resolve relative to project root (parent of appDir) since / usually implies server root
                 // Assuming c:\Charter-Legacy v4 is root and app is subdirectory
                 const projectRoot = path.resolve(appDir, '..');
                 resolvedPath = path.join(projectRoot, link);
            } else {
                 resolvedPath = path.resolve(dirName, link);
            }

            try {
                await stat(resolvedPath);
            } catch (err) {
                console.error(`[MISSING] File: ${relativePath} -> Link: ${link}`);
                console.error(`          Resolved to: ${resolvedPath}`);
                errorCount++;
            }
        }
    }

    if (errorCount === 0) {
        console.log('API verification passed: All links match existing files!');
    } else {
        console.log(`Verification failed: ${errorCount} missing file references found.`);
    }
}

verifyLinks().catch(console.error);
