@echo off
echo ==========================================
echo        EMERGENCY MARKETING FIX
echo ==========================================
echo.
echo This will quickly restore thedasboard.com
echo.

cd /d "E:\WebProjects\das-board-marketing"

echo Creating static marketing site...
if not exist out mkdir out

echo ^<!DOCTYPE html^> > out\index.html
echo ^<html^> >> out\index.html
echo ^<head^> >> out\index.html
echo     ^<title^>The DAS Board - Dealership Analytics System^</title^> >> out\index.html
echo     ^<script src="https://cdn.tailwindcss.com"^>^</script^> >> out\index.html
echo ^</head^> >> out\index.html
echo ^<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center"^> >> out\index.html
echo     ^<div class="text-center max-w-2xl mx-auto p-8"^> >> out\index.html
echo         ^<h1 class="text-4xl font-bold mb-4"^>The DAS Board^</h1^> >> out\index.html
echo         ^<p class="text-xl mb-8"^>Dealership Analytics System^</p^> >> out\index.html
echo         ^<p class="mb-8 text-gray-300"^>Powerful analytics and management tools for automotive dealerships^</p^> >> out\index.html
echo         ^<a href="https://685b10a638b41434ca7b9312--thedasboard.netlify.app" class="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-semibold inline-block"^>Access Dashboard^</a^> >> out\index.html
echo         ^<div class="mt-8 text-sm text-green-400 bg-green-400/10 p-4 rounded-lg"^>Site restored - Emergency deployment active^</div^> >> out\index.html
echo     ^</div^> >> out\index.html
echo ^</body^> >> out\index.html
echo ^</html^> >> out\index.html

echo /*    /index.html   200 > out\_redirects

echo.
echo Files created. Deploying...
netlify deploy --prod --dir=out --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0

echo.
echo ✅ Emergency deployment complete!
echo Check: https://thedasboard.com
echo.
pause 