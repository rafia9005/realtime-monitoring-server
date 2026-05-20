const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.match(/\.(tsx|jsx|css|ts|js)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove gradient classes
    content = content.replace(/bg-gradient-to-[a-z]+/g, 'bg-slate-50 dark:bg-slate-800');
    content = content.replace(/\b(from|via|to)-[a-z0-9]+-[0-9]+(\/[0-9]+)?\b/g, '');
    content = content.replace(/\b(from|via|to)-[a-z]+(\/[0-9]+)?\b/g, '');
    
    // Replace heavy shadows with shadow-sm or remove
    content = content.replace(/shadow-(lg|xl|2xl|md)/g, 'shadow-sm');
    content = content.replace(/shadow-[a-z0-9]+-[0-9]+\/[0-9]+/g, ''); // e.g., shadow-indigo-500/30
    content = content.replace(/drop-shadow(-[a-z]+)?/g, '');

    // Cleanup double spaces created by removal
    content = content.replace(/ +/g, ' ');
    content = content.replace(/ "/g, '"');
    content = content.replace(/" /g, '"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${changed} files.`);
