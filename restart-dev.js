// Script to restart the development server
import { exec } from 'child_process';

console.log('🔄 Restarting development server...');

// Kill any process using port 5173
console.log('🔪 Killing processes on port 5173...');
const killCommand =
  process.platform === 'win32' ? 'npx kill-port 5173' : 'lsof -ti:5173 | xargs kill -9';

exec(killCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(`⚠️ No processes found on port 5173 or error killing: ${error.message}`);
  } else {
    console.log('✅ Processes on port 5173 killed');
  }

  // Start the dev server
  console.log('🚀 Starting dev server...');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  const devProcess = exec(`${npm} run dev`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error starting dev server: ${error.message}`);
      process.exit(1);
    }
  });

  // Forward output from the dev server process
  devProcess.stdout.on('data', data => {
    process.stdout.write(data);
  });

  devProcess.stderr.on('data', data => {
    process.stderr.write(data);
  });

  // Handle Ctrl+C to properly terminate the dev server
  process.on('SIGINT', () => {
    console.log('👋 Terminating dev server...');
    devProcess.kill();
    process.exit(0);
  });
});
