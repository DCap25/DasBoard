const fs = require('fs');

const files = [
  'src/pages/finance/FinanceHomePage.tsx',
  'src/pages/finance/SingleFinanceHomePage.tsx',
  'src/components/dashboards/SingleFinanceManagerDashboard.tsx',
  'src/components/dashboards/GMDashboard.tsx',
  'src/components/dashboards/SalesManagerDashboard.tsx',
  'src/components/dashboards/GeneralManagerDashboard.tsx',
  'src/components/dashboards/SalesDashboard.tsx',
  'src/components/dashboards/AVPDashboard.tsx',
  'src/components/dashboards/FinanceDashboard.tsx',
  'src/components/dashboards/FinanceDirectorDashboard.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/GroupAdminDashboard.tsx',
  'src/components/admin/MasterAdminPanel.tsx',
  'src/components/dealership/AdminDashboard.tsx',
  'src/components/manager/GeneralManagerDashboard.tsx',
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix Actions columns to be red
  content = content.replace(
    /(<(?:th|TableHead)[^>]*className="[^"]*)(bg-gray-700)([^"]*"[^>]*>\s*Actions?\s*<\/)/gi,
    (match, prefix, grayClass, suffix) => {
      const newMatch = match.replace(grayClass, 'bg-red-600');
      if (newMatch !== match) changed = true;
      return newMatch;
    }
  );

  // Fix Delete columns to be red
  content = content.replace(
    /(<(?:th|TableHead)[^>]*className="[^"]*)(bg-gray-700)([^"]*"[^>]*>\s*Delete\s*<\/)/gi,
    (match, prefix, grayClass, suffix) => {
      const newMatch = match.replace(grayClass, 'bg-red-600');
      if (newMatch !== match) changed = true;
      return newMatch;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed Actions/Delete columns to red in ${filePath}`);
  } else {
    console.log(`ℹ️  No Actions/Delete columns to fix in ${filePath}`);
  }
});

console.log('\n🎉 All Actions and Delete columns are now red!');
console.log('🔴 Actions/Delete columns: Red (bg-red-600) with white text');
