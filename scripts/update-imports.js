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

            if (content.includes('@/components/page-guide')) {
                content = content.replace(/@\/components\/page-guide/g, '@/components/ui/page-guide');
                modified = true;

                if (content.includes('<PageGuide')) {
                    const routeMatch = fullPath.replace(/\\/g, '/');
                    const parts = routeMatch.split('/');
                    let idName = parts.slice(parts.indexOf('dashboard') + 1, parts.length - 1).join('-');
                    if (!idName) idName = 'dashboard-home';
                    content = content.replace(/<PageGuide /g, `<PageGuide guideId="${idName}" `);
                }
            }
            if (content.includes('@/components/sortable-header')) {
                content = content.replace(/@\/components\/sortable-header/g, '@/components/ui/sortable-header');
                modified = true;
            }
            if (content.includes('@/components/theme-toggle')) {
                content = content.replace(/@\/components\/theme-toggle/g, '@/components/ui/theme-toggle');
                modified = true;
            }
            if (content.includes('@/components/theme-provider')) {
                content = content.replace(/@\/components\/theme-provider/g, '@/components/ui/theme-provider');
                modified = true;
            }

            if (modified) fs.writeFileSync(fullPath, content);
        }
    }
}
replaceInDir('src/app');
console.log('Imports and guideIds updated.');
