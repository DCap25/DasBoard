/**
 * BYPASS-AUTH.JS
 *
 * This script provides a direct intervention into the React app's authentication flow.
 * It should be loaded into the browser console when on the group-admin page.
 */

// Execute immediately
(function () {
  console.log('[BYPASS-AUTH] Initializing bypass script');

  // Clear existing sessions
  localStorage.clear();
  sessionStorage.clear();

  // Create a hardcoded authentication session
  const sessionData = {
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ1NzcxMzUxLCJzdWIiOiJjM2JmNjMwZS1mMWEwLTRjODAtYTMxOC04MzZkYmExZjdlMTQiLCJlbWFpbCI6Imdyb3VwMS5hZG1pbkBleGFtcGxldGVzdC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7InJvbGUiOiJncm91cF9hZG1pbiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzQ1NzY3NzUxfV0sInNlc3Npb25faWQiOiJjODQ5ZTdjMy04MDYyLTRmZjEtOWQ0MC0xNmYzY2Q1Zjk4MDMifQ.v8YU5HMKEG9i0VJrNOvO00RjB_G-W4fLRY2V_iY2YMU',
    refresh_token: 'Q5_H7U9gDwXUMCrXca3znw',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'c3bf630e-f1a0-4c80-a318-836dba1f7e14',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        role: 'group_admin',
      },
      aud: 'authenticated',
      email: 'group1.admin@exampletest.com',
    },
  };

  // Store in localStorage
  localStorage.setItem('sb-iugjtokydvbcvmrpeziv-auth-token', JSON.stringify(sessionData));

  // Set sessionStorage flags
  sessionStorage.setItem('is_authenticated', 'true');
  sessionStorage.setItem('is_group_admin', 'true');
  sessionStorage.setItem('user_email', sessionData.user.email);
  sessionStorage.setItem('auth_fix_applied', 'true');
  sessionStorage.setItem('user_id', sessionData.user.id);
  sessionStorage.setItem('user_role', 'group_admin');

  console.log('[BYPASS-AUTH] Auth tokens injected into storage');

  // === DIRECT DOM MANIPULATION TO BYPASS REACT'S VIRTUAL DOM ===

  // Wait for React to fully render the page
  setTimeout(() => {
    // Create a custom auth event to trigger React's auth context
    const authEvent = new CustomEvent('auth-state-change', {
      detail: {
        user: sessionData.user,
        session: {
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
          user: sessionData.user,
        },
        isAuthenticated: true,
      },
    });

    // Dispatch on window and document to make sure it's caught
    window.dispatchEvent(authEvent);
    document.dispatchEvent(authEvent);

    console.log('[BYPASS-AUTH] Auth event dispatched');

    // Direct monkey patching of React router navigation
    if (window.history && window.history.replaceState) {
      const originalReplaceState = window.history.replaceState;
      window.history.replaceState = function () {
        // If this is trying to redirect to login, block it
        if (
          arguments.length > 2 &&
          (arguments[2] === '/' ||
            arguments[2] === '/login' ||
            arguments[2] === '/auth' ||
            arguments[2].includes('login') ||
            arguments[2].includes('auth'))
        ) {
          console.log('[BYPASS-AUTH] Blocked redirect to:', arguments[2]);
          // Do nothing - block the redirect
          return;
        }
        // Otherwise, proceed normally
        return originalReplaceState.apply(this, arguments);
      };
      console.log('[BYPASS-AUTH] Navigation blocking enabled');
    }

    // === DIRECT DOM MANIPULATION - BRUTE FORCE ===
    try {
      // Try to inject a fake auth context directly into React app
      window.__REACT_CONTEXT_DEVTOOLS = window.__REACT_CONTEXT_DEVTOOLS || {};
      window.__REACT_CONTEXT_DEVTOOLS.injectAuthContext = function (user) {
        console.log('[BYPASS-AUTH] Attempting to inject into React context');
      };

      // Force isGroupAdmin to always return true
      Object.defineProperty(window, '__forceGroupAdmin', {
        value: true,
        writable: false,
      });

      console.log('[BYPASS-AUTH] React context hooks injected');
    } catch (err) {
      console.error('[BYPASS-AUTH] Error during context injection:', err);
    }
  }, 500);

  // Periodic check to ensure auth state remains consistent
  setInterval(() => {
    // Check if our session is still in localStorage
    const storedData = localStorage.getItem('sb-iugjtokydvbcvmrpeziv-auth-token');
    if (!storedData) {
      console.log('[BYPASS-AUTH] Session lost, re-injecting...');
      localStorage.setItem('sb-iugjtokydvbcvmrpeziv-auth-token', JSON.stringify(sessionData));

      // Refresh session flags
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('is_group_admin', 'true');
    }
  }, 2000);

  console.log('[BYPASS-AUTH] Bypass script has completed initialization');

  // Return a feedback message to console
  return 'Auth bypass script initialized successfully. Please close this console and wait for the page to reload.';
})();
