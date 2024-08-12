const fs = require('fs');
const path = require('path');

// Whitelist of root directories to search
const rootDirs = ['./apps/web'];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace import when useHistory is mixed with other imports
  const importRegex =
    /import\s*{([^}]*)}\s*from\s*['"]react-router(?:-dom)?['"]/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports.split(',').map((i) => i.trim());
    const updatedImports = importList
      .filter((i) => i !== 'useHistory')
      .concat(['useNavigate']);

    if (importList.includes('useHistory')) {
      modified = true;
      return `import { ${updatedImports.join(', ')} } from 'react-router-dom'`;
    }
    return match;
  });

  // Replace useHistory() with useNavigate()
  if (content.includes('useHistory()')) {
    content = content.replace(
      /const\s+(\w+)\s*=\s*useHistory\(\);/g,
      'const navigate = useNavigate();'
    );
    modified = true;
  }

  // Replace history.push
  if (content.includes('.push(')) {
    content = content.replace(/(\w+)\.push\((.*?)\)/g, 'navigate($2)');
    modified = true;
  }

  // Replace history.replace
  if (content.includes('.replace(')) {
    content = content.replace(
      /(\w+)\.replace\((.*?)\)/g,
      'navigate($2, { replace: true })'
    );
    modified = true;
  }

  // Replace history.goBack()
  if (content.includes('.goBack()')) {
    content = content.replace(/(\w+)\.goBack\(\)/g, 'navigate(-1)');
    modified = true;
  }

  // Replace history in dependency arrays with navigate
  const dependencyRegex = /\[([\s\S]*?history[\s\S]*?)\]/g;
  content = content.replace(dependencyRegex, (match, dependencies) => {
    // Preserve original formatting
    const formattedDependencies = match.replace(/\bhistory\b/g, 'navigate');
    return formattedDependencies;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      traverseDirectory(filePath);
    } else if (path.extname(filePath) === '.tsx') {
      updateFile(filePath);
    }
  }
}

// Traverse each whitelisted root directory
rootDirs.forEach((dir) => {
  console.log(`Searching in ${dir}...`);
  traverseDirectory(dir);
});

console.log('Finished updating files.');
