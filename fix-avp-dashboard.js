// Quick fix for AVP Dashboard entries
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'DashboardSelector.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Remove the first AVP entry with incorrect role
const firstAVPPattern =
  /\s*{\s*name:\s*'Area Vice President',\s*path:\s*'\/avp-dashboard',\s*email:\s*'avp@exampletest\.com',\s*role:\s*'area_vp',\s*},/;

content = content.replace(firstAVPPattern, '');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed AVP Dashboard entries - removed duplicate with incorrect role');
