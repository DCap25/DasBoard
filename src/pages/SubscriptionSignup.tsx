import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Building, 
  Users, 
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SubscriptionSignupState {
  dealershipCount: number;
  billing: 'monthly' | 'annual';
  adminStructure: 'centralized' | 'distributed' | 'hybrid';
  pricePerDealership: number;
}

interface DealershipInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface AdminInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
}

export default function SubscriptionSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SubscriptionSignupState;

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Organization info
  const [orgType, setOrgType] = useState<'single' | 'group'>('single');
  const [organizationName, setOrganizationName] = useState('');
  const [dealerships, setDealerships] = useState<DealershipInfo[]>([
    { name: '', address: '', city: '', state: '', zipCode: '', phone: '' }
  ]);

  // Admin info based on structure
  const [centralAdmin, setCentralAdmin] = useState<AdminInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: 'Group Administrator'
  });
  const [storeAdmins, setStoreAdmins] = useState<AdminInfo[]>([]);
  const [regionalAdmins, setRegionalAdmins] = useState<AdminInfo[]>([]);

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState<'stripe'>('stripe');
  const [stripeCustomerId, setStripeCustomerId] = useState('');

  useEffect(() => {
    if (!state?.dealershipCount) {
      navigate('/subscriptions');
      return;
    }

    // Initialize admins based on structure
    if (state.adminStructure === 'distributed') {
      const admins = dealerships.map((dealership) => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: `${dealership.name || 'Store'} Administrator`
      }));
      setStoreAdmins(admins);
    } else if (state.adminStructure === 'hybrid') {
      // For hybrid, we'll allow configuring this in the UI
      // Initialize with empty arrays
      setStoreAdmins([]);
      setRegionalAdmins([]);
    }
  }, [state, navigate, dealerships.length]);

  // Calculate pricing based on dealership count
  const calculateTotalPrice = () => {
    return (state?.pricePerDealership || 250) * dealerships.length;
  };

  const addDealership = () => {
    setDealerships([...dealerships, { 
      name: '', address: '', city: '', state: '', zipCode: '', phone: '' 
    }]);
  };

  const removeDealership = (index: number) => {
    if (dealerships.length > 1) {
      setDealerships(dealerships.filter((_, i) => i !== index));
    }
  };

  const updateDealership = (index: number, field: keyof DealershipInfo, value: string) => {
    const updated = [...dealerships];
    updated[index][field] = value;
    setDealerships(updated);
  };

  const updateCentralAdmin = (field: keyof AdminInfo, value: string) => {
    setCentralAdmin({ ...centralAdmin, [field]: value });
  };

  const updateStoreAdmin = (index: number, field: keyof AdminInfo, value: string) => {
    const updated = [...storeAdmins];
    updated[index][field] = value;
    setStoreAdmins(updated);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      
      dealerships.forEach((dealership, index) => {
        if (!dealership.name.trim()) {
          newErrors[`dealership_${index}_name`] = 'Dealership name is required';
        }
        if (!dealership.address.trim()) {
          newErrors[`dealership_${index}_address`] = 'Address is required';
        }
        if (!dealership.city.trim()) {
          newErrors[`dealership_${index}_city`] = 'City is required';
        }
        if (!dealership.state.trim()) {
          newErrors[`dealership_${index}_state`] = 'State is required';
        }
        if (!dealership.zipCode.trim()) {
          newErrors[`dealership_${index}_zipCode`] = 'ZIP code is required';
        }
      });
    }

    if (step === 2) {
      if (state.adminStructure === 'centralized') {
        if (!centralAdmin.firstName.trim()) {
          newErrors.centralAdmin_firstName = 'First name is required';
        }
        if (!centralAdmin.lastName.trim()) {
          newErrors.centralAdmin_lastName = 'Last name is required';
        }
        if (!centralAdmin.email.trim()) {
          newErrors.centralAdmin_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(centralAdmin.email)) {
          newErrors.centralAdmin_email = 'Please enter a valid email';
        }
      } else if (state.adminStructure === 'distributed') {
        storeAdmins.forEach((admin, index) => {
          if (!admin.firstName.trim()) {
            newErrors[`storeAdmin_${index}_firstName`] = 'First name is required';
          }
          if (!admin.lastName.trim()) {
            newErrors[`storeAdmin_${index}_lastName`] = 'Last name is required';
          }
          if (!admin.email.trim()) {
            newErrors[`storeAdmin_${index}_email`] = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(admin.email)) {
            newErrors[`storeAdmin_${index}_email`] = 'Please enter a valid email';
          }
        });
      } else {
        // Hybrid - validate at least one admin
        if (!centralAdmin.email && storeAdmins.length === 0 && regionalAdmins.length === 0) {
          newErrors.hybrid_admin = 'At least one administrator is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Here you would integrate with Stripe and your backend
      const subscriptionData = {
        dealershipCount: dealerships.length,
        pricePerDealership: state.pricePerDealership,
        billing: state.billing,
        organizationName,
        orgType,
        dealerships,
        adminStructure: state.adminStructure,
        centralAdmin: state.adminStructure === 'centralized' ? centralAdmin : null,
        storeAdmins: state.adminStructure === 'distributed' ? storeAdmins : [],
        regionalAdmins: state.adminStructure === 'hybrid' ? regionalAdmins : [],
        paymentMethod
      };

      console.log('Subscription data:', subscriptionData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to success page or dashboard
      navigate('/subscription/success', { 
        state: { 
          planName: `${dealerships.length} Dealership${dealerships.length > 1 ? 's' : ''}`,
          organizationName,
          setupComplete: true
        } 
      });

    } catch (error) {
      console.error('Subscription creation failed:', error);
      setErrors({ submit: 'Failed to create subscription. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = calculateTotalPrice();
    const discount = state.billing === 'annual' ? 0.15 : 0;
    return Math.round(basePrice * (1 - discount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/subscriptions')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
              <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Setup
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress & Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-8">
              {/* Progress Steps */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Setup Progress</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Organization Details', icon: Building },
                    { step: 2, title: 'Admin Setup', icon: Users },
                    { step: 3, title: 'Payment & Review', icon: CreditCard }
                  ].map(({ step, title, icon: Icon }) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        currentStep >= step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {currentStep > step ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        currentStep >= step ? 'text-white' : 'text-gray-400'
                      }`}>
                        {title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dealerships:</span>
                    <span className="text-white">{dealerships.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price/Dealership:</span>
                    <span className="text-white">${state.pricePerDealership}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Admin Structure:</span>
                    <span className="text-white">
                      {state.adminStructure === 'centralized' ? 'Centralized' : 
                       state.adminStructure === 'distributed' ? 'Store-Level' : 'Hybrid'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Billing:</span>
                    <span className="text-white capitalize">{state.billing}</span>
                  </div>
                  {state.billing === 'annual' && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount (15%):</span>
                      <span>-${Math.round(calculateTotalPrice() * 0.15)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-blue-400">${calculateTotal()}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-300">
                    <Shield className="w-4 h-4 mr-2 text-green-400" />
                    Secured by Stripe
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Organization Details</h2>
                  
                  {/* Organization Name */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className={`w-full p-3 bg-gray-700 border rounded-lg text-white ${
                        errors.organizationName ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="e.g., ABC Auto Group"
                    />
                    {errors.organizationName && (
                      <p className="text-red-400 text-sm mt-1">{errors.organizationName}</p>
                    )}
                  </div>

                  {/* Organization Type */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">
                      Organization Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setOrgType('single')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          orgType === 'single'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <Building className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <div className="text-white font-medium">Single Dealership</div>
                        <div className="text-gray-400 text-sm">Independent dealership</div>
                      </button>
                      <button
                        onClick={() => setOrgType('group')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          orgType === 'group'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <div className="text-white font-medium">Dealer Group</div>
                        <div className="text-gray-400 text-sm">Multiple locations</div>
                      </button>
                    </div>
                  </div>

                  {/* Dealership Information */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Dealership Information
                      </h3>
                      {orgType === 'group' && (
                        <button
                          onClick={addDealership}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500"
                        >
                          Add Dealership
                        </button>
                      )}
                    </div>

                    {dealerships.map((dealership, index) => (
                      <div key={index} className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-medium">
                            Dealership {index + 1}
                          </h4>
                          {dealerships.length > 1 && (
                            <button
                              onClick={() => removeDealership(index)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              Dealership Name *
                            </label>
                            <input
                              type="text"
                              value={dealership.name}
                              onChange={(e) => updateDealership(index, 'name', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors[`dealership_${index}_name`] ? 'border-red-500' : 'border-gray-600'
                              }`}
                              placeholder="Toyota of Downtown"
                            />
                            {errors[`dealership_${index}_name`] && (
                              <p className="text-red-400 text-xs mt-1">{errors[`dealership_${index}_name`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={dealership.phone}
                              onChange={(e) => updateDealership(index, 'phone', e.target.value)}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-gray-300 text-sm mb-1">
                              Address *
                            </label>
                            <input
                              type="text"
                              value={dealership.address}
                              onChange={(e) => updateDealership(index, 'address', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors[`dealership_${index}_address`] ? 'border-red-500' : 'border-gray-600'
                              }`}
                              placeholder="123 Main Street"
                            />
                            {errors[`dealership_${index}_address`] && (
                              <p className="text-red-400 text-xs mt-1">{errors[`dealership_${index}_address`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={dealership.city}
                              onChange={(e) => updateDealership(index, 'city', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors[`dealership_${index}_city`] ? 'border-red-500' : 'border-gray-600'
                              }`}
                              placeholder="Anytown"
                            />
                            {errors[`dealership_${index}_city`] && (
                              <p className="text-red-400 text-xs mt-1">{errors[`dealership_${index}_city`]}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">
                                State *
                              </label>
                              <input
                                type="text"
                                value={dealership.state}
                                onChange={(e) => updateDealership(index, 'state', e.target.value)}
                                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                  errors[`dealership_${index}_state`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                                placeholder="CA"
                                maxLength={2}
                              />
                              {errors[`dealership_${index}_state`] && (
                                <p className="text-red-400 text-xs mt-1">{errors[`dealership_${index}_state`]}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">
                                ZIP *
                              </label>
                              <input
                                type="text"
                                value={dealership.zipCode}
                                onChange={(e) => updateDealership(index, 'zipCode', e.target.value)}
                                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                  errors[`dealership_${index}_zipCode`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                                placeholder="12345"
                              />
                              {errors[`dealership_${index}_zipCode`] && (
                                <p className="text-red-400 text-xs mt-1">{errors[`dealership_${index}_zipCode`]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Admin Setup */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Administrator Setup</h2>
                  
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Admin Structure: {
                      state.adminStructure === 'centralized' ? 'Centralized Admin' :
                      state.adminStructure === 'distributed' ? 'Store-Level Admins' : 'Hybrid Structure'
                    }</h3>
                    <p className="text-xs text-gray-300">
                      {state.adminStructure === 'centralized' && 'One administrator will manage all dealerships'}
                      {state.adminStructure === 'distributed' && 'Each dealership will have its own administrator'}
                      {state.adminStructure === 'hybrid' && 'Mix of central and store-level administrators'}
                    </p>
                  </div>

                  {/* Centralized Admin Form */}
                  {state.adminStructure === 'centralized' && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Central Administrator</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">First Name *</label>
                          <input
                            type="text"
                            value={centralAdmin.firstName}
                            onChange={(e) => updateCentralAdmin('firstName', e.target.value)}
                            className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                              errors.centralAdmin_firstName ? 'border-red-500' : 'border-gray-600'
                            }`}
                          />
                          {errors.centralAdmin_firstName && (
                            <p className="text-red-400 text-xs mt-1">{errors.centralAdmin_firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={centralAdmin.lastName}
                            onChange={(e) => updateCentralAdmin('lastName', e.target.value)}
                            className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                              errors.centralAdmin_lastName ? 'border-red-500' : 'border-gray-600'
                            }`}
                          />
                          {errors.centralAdmin_lastName && (
                            <p className="text-red-400 text-xs mt-1">{errors.centralAdmin_lastName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Email *</label>
                          <input
                            type="email"
                            value={centralAdmin.email}
                            onChange={(e) => updateCentralAdmin('email', e.target.value)}
                            className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                              errors.centralAdmin_email ? 'border-red-500' : 'border-gray-600'
                            }`}
                          />
                          {errors.centralAdmin_email && (
                            <p className="text-red-400 text-xs mt-1">{errors.centralAdmin_email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Phone</label>
                          <input
                            type="tel"
                            value={centralAdmin.phone}
                            onChange={(e) => updateCentralAdmin('phone', e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-sm mb-1">Title</label>
                          <input
                            type="text"
                            value={centralAdmin.title}
                            onChange={(e) => updateCentralAdmin('title', e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            placeholder="e.g., VP of Operations, Owner"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-500/30">
                        <p className="text-xs text-blue-300">
                          This admin will have full access to manage all {dealerships.length} dealerships, 
                          including adding/removing users, setting schedules, and configuring pay plans.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Distributed Store Admins Form */}
                  {state.adminStructure === 'distributed' && (
                    <div className="space-y-4">
                      {dealerships.map((dealership, index) => (
                        <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">
                            Admin for {dealership.name || `Dealership ${index + 1}`}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">First Name *</label>
                              <input
                                type="text"
                                value={storeAdmins[index]?.firstName || ''}
                                onChange={(e) => updateStoreAdmin(index, 'firstName', e.target.value)}
                                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                  errors[`storeAdmin_${index}_firstName`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                              />
                              {errors[`storeAdmin_${index}_firstName`] && (
                                <p className="text-red-400 text-xs mt-1">{errors[`storeAdmin_${index}_firstName`]}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Last Name *</label>
                              <input
                                type="text"
                                value={storeAdmins[index]?.lastName || ''}
                                onChange={(e) => updateStoreAdmin(index, 'lastName', e.target.value)}
                                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                  errors[`storeAdmin_${index}_lastName`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                              />
                              {errors[`storeAdmin_${index}_lastName`] && (
                                <p className="text-red-400 text-xs mt-1">{errors[`storeAdmin_${index}_lastName`]}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Email *</label>
                              <input
                                type="email"
                                value={storeAdmins[index]?.email || ''}
                                onChange={(e) => updateStoreAdmin(index, 'email', e.target.value)}
                                className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                  errors[`storeAdmin_${index}_email`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                              />
                              {errors[`storeAdmin_${index}_email`] && (
                                <p className="text-red-400 text-xs mt-1">{errors[`storeAdmin_${index}_email`]}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Phone</label>
                              <input
                                type="tel"
                                value={storeAdmins[index]?.phone || ''}
                                onChange={(e) => updateStoreAdmin(index, 'phone', e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hybrid Structure Form */}
                  {state.adminStructure === 'hybrid' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-300">
                          For hybrid structures, please contact our team to configure your custom admin hierarchy. 
                          You can start with a central admin and add store/regional admins later.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Initial Central Administrator</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">First Name *</label>
                            <input
                              type="text"
                              value={centralAdmin.firstName}
                              onChange={(e) => updateCentralAdmin('firstName', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors.centralAdmin_firstName ? 'border-red-500' : 'border-gray-600'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={centralAdmin.lastName}
                              onChange={(e) => updateCentralAdmin('lastName', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors.centralAdmin_lastName ? 'border-red-500' : 'border-gray-600'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Email *</label>
                            <input
                              type="email"
                              value={centralAdmin.email}
                              onChange={(e) => updateCentralAdmin('email', e.target.value)}
                              className={`w-full p-2 bg-gray-700 border rounded text-white text-sm ${
                                errors.centralAdmin_email ? 'border-red-500' : 'border-gray-600'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Phone</label>
                            <input
                              type="tel"
                              value={centralAdmin.phone}
                              onChange={(e) => updateCentralAdmin('phone', e.target.value)}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment & Review */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Payment & Review</h2>
                  
                  {/* Subscription Summary */}
                  <div className="mb-8 p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Subscription Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Organization:</span>
                        <span className="text-white">{organizationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dealerships:</span>
                        <span className="text-white">{dealerships.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admin Structure:</span>
                        <span className="text-white">
                          {adminStructure === 'group_admin' ? 'Single Group Admin' : 'Individual Store Admins'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Billing Cycle:</span>
                        <span className="text-white capitalize">{state.billing}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-white">Total:</span>
                          <span className="text-blue-400">${calculateTotal()}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                    <div className="p-4 bg-gray-700/50 rounded-lg border border-blue-500">
                      <div className="flex items-center">
                        <CreditCard className="w-6 h-6 text-blue-400 mr-3" />
                        <div>
                          <div className="text-white font-medium">Stripe Checkout</div>
                          <div className="text-gray-400 text-sm">
                            Secure payment processing with bank-grade encryption
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">
                          By completing this subscription, you agree to our{' '}
                          <button className="text-blue-400 hover:text-blue-300 underline">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button className="text-blue-400 hover:text-blue-300 underline">
                            Privacy Policy
                          </button>.
                        </p>
                        <p>
                          Your subscription will begin immediately with a 14-day free trial. 
                          You can cancel anytime before the trial ends.
                        </p>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center text-red-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {errors.submit}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    currentStep === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        Processing...
                      </>
                    ) : (
                      'Complete Subscription'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}