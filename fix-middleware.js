const fs = require('fs');

// Read the TestUserMiddleware file
const filePath = 'src/components/auth/TestUserMiddleware.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add the direct auth import
content = content.replace(
  "import { supabase, isTestEmail } from '../../lib/supabaseClient';",
  "import { supabase, isTestEmail } from '../../lib/supabaseClient';\nimport { isAuthenticated } from '../../lib/directAuth';"
);

// Add the direct auth check
content = content.replace(
  "console.log('[TestUserMiddleware] Checking for test user...');",
  "console.log('[TestUserMiddleware] Checking for test user...');\n        if (isAuthenticated && isAuthenticated()) { console.log('[TestUserMiddleware] Direct auth active, bypassing'); setChecking(false); setHasProcessed(true); return; }"
);

// Write the file back
fs.writeFileSync(filePath, content);
console.log('Fixed TestUserMiddleware');
