#!/bin/bash
# Test Authentication Fix for Das Board

echo "=== Das Board Authentication Test Script ==="
echo

# Check if API service is running
if ! curl -s http://localhost:3001 > /dev/null; then
  echo "Mock API is not running. Please start it with: cd sales-api-new && npm run start"
  echo "Exiting..."
  exit 1
fi

echo "Mock API is running on port 3001 ✓"

# Check if Das Board is running
if ! curl -s http://localhost:5173 > /dev/null; then
  echo "Das Board application is not running. Please start it with: npm run dev"
  echo "Exiting..."
  exit 1
fi

echo "Das Board application is running on port 5173 ✓"
echo

# Define test users
declare -A test_users
test_users=(
  ["testsales@example.com"]="Salesperson:/dashboard/salesperson"
  ["testfinance@example.com"]="Finance Manager:/finance"
  ["testmanager@example.com"]="Sales Manager:/dashboard/sales-manager"
  ["testgm@example.com"]="General Manager:/dashboard/general-manager"
  ["testadmin@example.com"]="Admin:/dashboard/admin"
)

# Print instructions
echo "Please test the following users in your browser (http://localhost:5173):"
echo "-------------------------------------------------------------------"

for email in "${!test_users[@]}"; do
  IFS=':' read -r role redirect <<< "${test_users[$email]}"
  echo -e "\033[0;36mRole: $role\033[0m"
  echo "Email: $email"
  echo "Password: password"
  echo "Expected Redirect: $redirect"
  echo "-------------------------------------------------------------------"
done

# Instructions for testing
echo
echo -e "\033[0;36mOnce testing with the mock API is complete, test with Supabase:\033[0m"
echo "1. Set USE_MOCK_SUPABASE=false in .env.development"
echo "2. Restart the application with: npm run dev"
echo "3. Test the same users again to verify Supabase authentication works"
echo

echo -e "\033[0;36mVerify the following:\033[0m"
echo "- Login is successful for all test users"
echo "- Each user is redirected to the correct page based on their role"
echo "- Each user can only access data from their assigned dealership"
echo "- Logout functionality works correctly"
echo "- Authentication persists when refreshing the page"
echo

echo -e "\033[0;32mRefer to auth-fix-documentation.md for complete testing instructions and troubleshooting.\033[0m" 