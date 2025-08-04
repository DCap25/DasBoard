import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin,
  User,
  Mail,
  Lock,
  Check,
  Star,
  Users,
  TrendingUp,
  Shield,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../LanguageSwitcher';

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = t('signup.dealershipSignup.validation.organizationNameRequired');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('signup.dealershipSignup.validation.addressRequired');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('signup.dealershipSignup.validation.cityRequired');
    }
    if (!formData.state.trim()) {
      newErrors.state = t('signup.dealershipSignup.validation.stateRequired');
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = t('signup.dealershipSignup.validation.zipCodeRequired');
    }
    if (!formData.adminName.trim()) {
      newErrors.adminName = t('signup.dealershipSignup.validation.adminNameRequired');
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = t('signup.dealershipSignup.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = t('signup.dealershipSignup.validation.validEmailRequired');
    }
    if (!formData.password) {
      newErrors.password = t('signup.dealershipSignup.validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('signup.dealershipSignup.validation.passwordMinLength');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.dealershipSignup.validation.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Navigate to success page or admin dashboard
      navigate('/signup/success', {
        state: {
          organizationName: formData.organizationName,
          planName: 'Dealership Package',
          setupComplete: true
        }
      });
    }
  };


  const features = [
    'Complete dashboard suite for all roles',
    'Real-time deal tracking & analytics',
    'Multi-location management',
    'Flexible admin structure',
    'Schedule & goal management',
    'Performance reporting',
    'Volume discounts available'
  ];

  const premiumFeatures = [
    'Custom integrations',
    'Dedicated account manager',
    '24/7 phone support',
    'Advanced reporting',
    'API access'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
              <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                {t('nav.signup')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => navigate('/screenshots')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.screenshots')}
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.pricing')}
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.about')}
              </button>
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.login')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Side - Pricing Information */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {t('signup.dealershipSignup.pricing.dealershipManagement')}
              </h1>
              <p className="text-xl text-gray-300">
                {t('signup.dealershipSignup.pricing.buildCustomPackage')}
              </p>
            </div>

            {/* Custom Configurator Pricing */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-bold text-white">{t('signup.dealershipSignup.pricing.dynamicPackagePricing')}</h2>
              </div>
              
              {/* Base Price */}
              <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('signup.dealershipSignup.pricing.basePricePerDealership')}</h3>
                    <p className="text-sm text-gray-400 mt-1">{t('signup.dealershipSignup.pricing.includesDashboardAccess')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-400">$250</span>
                    <span className="text-gray-400 text-sm">/mo</span>
                  </div>
                </div>
                
                {/* What's Included */}
                <div className="border-t border-blue-400/30 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">{t('signup.dealershipSignup.pricing.standardTeamAccess')}</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• {t('signup.dealershipSignup.pricing.upToSalesPeople')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.upToFinanceManagers')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.upToSalesManagers')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.oneGeneralManager')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">{t('signup.dealershipSignup.pricing.coreFeatures')}</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• {t('signup.dealershipSignup.pricing.realTimeDealTracking')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.performanceAnalytics')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.scheduleManagement')}</li>
                        <li>• {t('signup.dealershipSignup.pricing.goalTracking')}</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">{t('signup.dealershipSignup.pricing.whatsIncluded')}</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• {t('signup.dealershipSignup.pricing.completeDashboardSuite')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.realTimeDealTrackingAnalytics')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.multiLocationManagement')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.flexibleAdminStructure')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.scheduleGoalManagement')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.performanceReporting')}</li>
                      <li>• {t('signup.dealershipSignup.pricing.volumeDiscountsAvailable')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bundle Offers */}
              <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  {t('signup.dealershipSignup.pricing.specialBundleOffers')}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      <strong className="text-white">{t('signup.dealershipSignup.pricing.sellMoreBundle')}</strong> {t('signup.dealershipSignup.pricing.sellMoreBundleDesc')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      <strong className="text-white">{t('signup.dealershipSignup.pricing.sellMostBundle')}</strong> {t('signup.dealershipSignup.pricing.sellMostBundleDesc')}
                    </span>
                  </li>
                </ul>
              </div>

              {/* À La Carte Add-ons */}
              <div className="relative">
                <h3 className="text-base font-semibold text-white mb-2">{t('signup.dealershipSignup.pricing.aLaCarteAddons')}</h3>
                <div className="space-y-2">
                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('salesperson')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <User className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.additionalSalesPerson')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$5</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>

                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('financemanager')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <Users className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.additionalFinanceManager')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$20</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>

                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('salesmanager')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.additionalSalesManager')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$30</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>

                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('financedirector')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <Users className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.financeDirector')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$25</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>

                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('generalmanager')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.generalSalesManager')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$30</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>

                  <div 
                    className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRole('avp')}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{t('signup.dealershipSignup.pricing.areaVicePresident')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-semibold text-white">$50</span>
                      <span className="text-gray-400 text-xs">/mo</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview Tooltip */}
                {hoveredRole && (
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-300 p-4">
                    <h4 className="text-gray-800 font-semibold mb-2 text-sm">
                      {hoveredRole === 'salesperson' && t('signup.dealershipSignup.pricing.salesPersonDashboard')}
                      {hoveredRole === 'financemanager' && t('signup.dealershipSignup.pricing.financeManagerDashboard')}
                      {hoveredRole === 'salesmanager' && t('signup.dealershipSignup.pricing.salesManagerDashboard')}
                      {hoveredRole === 'financedirector' && t('signup.dealershipSignup.pricing.financeDirectorDashboard')}
                      {hoveredRole === 'generalmanager' && t('signup.dealershipSignup.pricing.generalManagerDashboard')}
                      {hoveredRole === 'avp' && t('signup.dealershipSignup.pricing.areaVicePresidentDashboard')}
                    </h4>
                    <img 
                      src={`/images/${
                        hoveredRole === 'salesperson' ? 'SALESPERSON_DASH.JPG' :
                        hoveredRole === 'financemanager' ? 'FINANCEMNG_DASH.JPG' :
                        hoveredRole === 'salesmanager' ? 'SALESMNG_DASH.JPG' :
                        hoveredRole === 'financedirector' ? 'FINANCEDIR_DASH.JPG' :
                        hoveredRole === 'generalmanager' ? 'GENERALMNG_DASH.JPG' :
                        hoveredRole === 'avp' ? 'AVP_DASH.JPG' : ''
                      }`}
                      alt="Dashboard Preview"
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Right Side - Signup Form */}
          <div>
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('signup.dealershipSignup.getStartedToday')}</h2>
                <p className="text-gray-400">
                  {t('signup.dealershipSignup.createAccountConfigure')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{t('signup.dealershipSignup.organizationInfo')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.organizationName')}
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.organizationName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder={t('signup.dealershipSignup.organizationNamePlaceholder')}
                      />
                      {errors.organizationName && (
                        <p className="text-red-400 text-sm mt-1">{errors.organizationName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.businessAddress')}
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder={t('signup.dealershipSignup.businessAddressPlaceholder')}
                      />
                      {errors.address && (
                        <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('signup.dealershipSignup.city')}
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.cityPlaceholder')}
                        />
                        {errors.city && (
                          <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('signup.dealershipSignup.state')}
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.statePlaceholder')}
                        />
                        {errors.state && (
                          <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.zipCode')}
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder={t('signup.dealershipSignup.zipCodePlaceholder')}
                      />
                      {errors.zipCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{t('signup.dealershipSignup.adminContactInfo')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.adminName')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="adminName"
                          value={formData.adminName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.adminName ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.adminNamePlaceholder')}
                        />
                      </div>
                      {errors.adminName && (
                        <p className="text-red-400 text-sm mt-1">{errors.adminName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.emailAddress')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.adminEmail ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.emailPlaceholder')}
                        />
                      </div>
                      {errors.adminEmail && (
                        <p className="text-red-400 text-sm mt-1">{errors.adminEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.passwordPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('signup.dealershipSignup.confirmPassword')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder={t('signup.dealershipSignup.confirmPasswordPlaceholder')}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  {t('signup.dealershipSignup.createAccountButton')}
                </button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    {t('signup.dealershipSignup.configureAfterSignup')}
                    <br />
                    <span className="text-white">{t('signup.dealershipSignup.useDiscountCode')}</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}