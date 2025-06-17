const fs = require('fs');
const filePath = 'src/components/auth/TestUserMiddleware.tsx';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
  "import { supabase, isTestEmail } from '../../lib/supabaseClient';",
  "import { supabase, isTestEmail } from '../../lib/supabaseClient';\nimport { isAuthenticated } from '../../lib/directAuth';"
);
content = content.replace(
  "console.log('[TestUserMiddleware] Checking for test user...');",
  "console.log('[TestUserMiddleware] Checking for test user...');\n        if (isAuthenticated && isAuthenticated()) { console.log('[TestUserMiddleware] Direct auth active, bypassing'); setChecking(false); setHasProcessed(true); return; }"
);
fs.writeFileSync(filePath, content);
console.log('Fixed TestUserMiddleware');
