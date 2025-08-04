import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Info, Settings, Globe, AlertCircle } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: false,
    marketing: false,
  });

  // Detect user location for GDPR/CCPA compliance
  const [userRegion, setUserRegion] = useState<'EU' | 'CA' | 'OTHER'>('OTHER');

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    const consentDate = localStorage.getItem('cookie-consent-date');
    
    // GDPR requires re-consent after 12 months
    if (cookieConsent && consentDate) {
      const consentTimestamp = new Date(consentDate).getTime();
      const now = new Date().getTime();
      const twelveMonths = 365 * 24 * 60 * 60 * 1000;
      
      if (now - consentTimestamp > twelveMonths) {
        // Consent expired, show banner again
        localStorage.removeItem('cookie-consent');
        localStorage.removeItem('cookie-consent-date');
        localStorage.removeItem('cookie-preferences');
        setTimeout(() => setShowBanner(true), 1000);
      }
    } else {
      // No consent found, show banner
      setTimeout(() => setShowBanner(true), 1000);
    }

    // Simple region detection (in production, use a proper geolocation service)
    detectUserRegion();
  }, []);

  const detectUserRegion = () => {
    // In production, use a service like ipapi.co or MaxMind
    // For now, we'll check timezone as a rough indicator
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('Europe')) {
      setUserRegion('EU');
    } else if (timezone.includes('Los_Angeles') || timezone.includes('America')) {
      // Rough check for California - in production use proper geolocation
      setUserRegion('CA');
    }
  };

  const handleAcceptAll = () => {
    const allPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent('all', allPreferences);
  };

  const handleAcceptSelected = () => {
    saveConsent('custom', preferences);
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    saveConsent('minimal', minimalPreferences);
  };

  const saveConsent = (type: string, prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', type);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    
    // Fire a custom event for other parts of the app to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: { consent: type, preferences: prefs } 
    }));
    
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-2">
        <div className="max-w-6xl mx-auto">
          <div className="bg-blue-50 rounded-lg shadow-lg border border-blue-200 p-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Cookie className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Cookie Preferences</h3>
                </div>
              </div>
              {userRegion !== 'OTHER' && (
                <div className="text-xs text-gray-500 flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {userRegion === 'EU' ? 'GDPR' : 'CCPA'}
                </div>
              )}
            </div>

            {/* Main Content */}
            {!showSettings ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-xs text-gray-600">
                      We use cookies to enhance your experience.
                      {userRegion === 'CA' && (
                        <span className="block text-xs text-blue-800 mt-1">
                          <strong>California:</strong> Opt-out available.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={handleRejectAll}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium py-1 px-2 rounded transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium py-1 px-2 rounded border border-gray-300 transition-colors flex items-center"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Settings View */
              <>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Manage Cookie Preferences</h4>
                  
                  <div className="space-y-4">
                    {/* Essential Cookies */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            Strictly Necessary Cookies
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            These cookies are essential for the website to function properly. They enable core 
                            functionality such as security, authentication, and session management.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                            className="h-5 w-5 text-blue-600 rounded cursor-not-allowed opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Functional Cookies */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-blue-600" />
                            Functional Cookies
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            These cookies enable personalized features and functionality, remembering your 
                            preferences and settings for a better user experience.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.functional}
                            onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                            className="h-5 w-5 text-blue-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-purple-600" />
                            Analytics Cookies
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            These cookies help us understand how visitors interact with our website, 
                            allowing us to improve our services and user experience.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                            className="h-5 w-5 text-blue-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <Cookie className="h-4 w-4 mr-2 text-orange-600" />
                            Marketing Cookies
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            These cookies may be set by our advertising partners to build a profile of your 
                            interests and show relevant ads on other sites.
                          </p>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                            className="h-5 w-5 text-blue-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAcceptSelected}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}