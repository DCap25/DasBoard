const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/pages/finance/FinanceHomePage.tsx', 'utf8');

// Replace purple with blue-700 for Pay Calculator MTD card
content = content.replace(/border-l-purple-500/g, 'border-l-blue-700');
content = content.replace(/text-purple-500/g, 'text-blue-700');

// Replace amber with slate-700 for PVR card
content = content.replace(/border-l-amber-500/g, 'border-l-slate-700');
content = content.replace(/text-amber-500/g, 'text-slate-700');

// Fix the progress indicator colors to match the new scheme for Pay Calculator MTD
content = content.replace(
  /(<div className="flex items-center pt-1 text-)blue-600(">\s*<ChevronUp className="h-3 w-3 mr-1" \/>\s*<span className="text-xs">15% of F&I revenue<\/span>)/g,
  '$1blue-700$2'
);

// Fix the progress indicator colors to match the new scheme for PVR
content = content.replace(
  /(<div className="flex items-center pt-1 text-)blue-600(">\s*<ChevronUp className="h-3 w-3 mr-1" \/>\s*<span className="text-xs">\$120 from previous period<\/span>)/g,
  '$1slate-700$2'
);

// Write the file back
fs.writeFileSync('src/pages/finance/FinanceHomePage.tsx', content);

console.log('Finance dashboard colors updated successfully!');
