const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Reemplazar <PageGuide> sin espacio final
            if (content.includes('<PageGuide>')) {
                const routeMatch = fullPath.replace(/\\/g, '/');
                const parts = routeMatch.split('/');
                let idName = parts.slice(parts.indexOf('dashboard') + 1, parts.length - 1).join('-');
                if (!idName) idName = 'dashboard-home';
                content = content.replace(/<PageGuide>/g, `<PageGuide guideId="${idName}">`);
                modified = true;
            }

            if (modified) fs.writeFileSync(fullPath, content);
        }
    }
}
replaceInDir('src/app');
console.log('Fixed missing guideIds from <PageGuide> tags.');
