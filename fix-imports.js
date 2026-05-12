const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'frontend', 'src');
const files = walkSync(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match imports from clerk-shim
  // Example: import { useAuth, SignIn } from "../../lib/clerk-shim";
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)clerk-shim['"]/g;

  content = content.replace(importRegex, (match, importsStr, prefix) => {
    changed = true;
    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    const hooks = [];
    const guards = [];
    const components = [];

    imports.forEach(imp => {
      if (['AuthContext', 'ClerkProvider', 'useAuth', 'useUser', 'useClerk'].includes(imp)) {
        hooks.push(imp);
      } else if (['SignedIn', 'SignedOut'].includes(imp)) {
        guards.push(imp);
      } else if (['SignIn', 'SignUp', 'UserButton'].includes(imp)) {
        components.push(imp);
      } else {
        hooks.push(imp); // default fallback
      }
    });

    let newImports = '';
    if (hooks.length > 0) newImports += `import { ${hooks.join(', ')} } from "${prefix}AuthHooks";\n`;
    if (guards.length > 0) newImports += `import { ${guards.join(', ')} } from "${prefix}AuthGuards";\n`;
    if (components.length > 0) newImports += `import { ${components.join(', ')} } from "${prefix}AuthComponents";\n`;

    return newImports.trim();
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
