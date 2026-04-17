const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const replaceInFile = (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add dark mode classes only if not already present
  content = content.replace(/bg-white(?!\s+dark:bg-)/g, 'bg-white dark:bg-slate-800');
  content = content.replace(/text-slate-900(?!\s+dark:text-)/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-800(?!\s+dark:text-)/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700(?!\s+dark:text-)/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-600(?!\s+dark:text-)/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-500(?!\s+dark:text-)/g, 'text-slate-500 dark:text-slate-400');
  
  // Specific backgrounds and borders
  content = content.replace(/bg-slate-50(?!\s+dark:bg-)/g, 'bg-slate-50 dark:bg-slate-900/50');
  content = content.replace(/bg-slate-100(?!\s+dark:bg-)/g, 'bg-slate-100 dark:bg-slate-800/50');
  content = content.replace(/border-slate-100(?!\s+dark:border-)/g, 'border-slate-100 dark:border-slate-700');
  content = content.replace(/border-slate-200(?!\s+dark:border-)/g, 'border-slate-200 dark:border-slate-700');
  content = content.replace(/border-slate-50(?!\s+dark:border-)/g, 'border-slate-50 dark:border-slate-800');
  content = content.replace(/bg-transparent(?!\s+dark:bg-)/g, 'bg-transparent');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

walk('./src', replaceInFile);
console.log('Theme replacement complete.');