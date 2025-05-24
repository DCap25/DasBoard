console.log('Testing build process...');
import { existsSync } from 'fs';
import { exit } from 'process';

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'vite.config.js',
    'tsconfig.json',
    'tailwind.config.js',
    'src/main.tsx',
    'src/App.tsx',
    'index.html'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      console.error(`❌ Required file missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('✅ All required build files present');
  }
  
  return allFilesExist;
}

const fileChecksPassed = checkRequiredFiles();

if (fileChecksPassed) {
  console.log('\n🎉 Build tests passed!');
  exit(0);
} else {
  console.error('\n❌ Build tests failed. Some required files are missing.');
  exit(1);
} 