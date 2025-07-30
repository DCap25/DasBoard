import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  BarChart3,
  Calculator,
  Target
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

export default function SingleFinanceWelcome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    console.log('[SingleFinanceWelcome] Get Started clicked, navigating to dashboard...');
    
    // Mark that this user has seen the welcome page (use a generic key if user.id not available yet)
    const welcomeKey = user?.id ? `welcome_seen_${user.id}` : 'welcome_seen_current_user';
    localStorage.setItem(welcomeKey, 'true');
    
    // Navigate directly to dashboard - user is already authenticated if they're on welcome page
    navigate('/dashboard/single-finance');
  };

  const handleSkipToDashboard = () => {
    console.log('[SingleFinanceWelcome] Skip to Dashboard clicked, navigating to dashboard...');
    
    // Mark that this user has seen the welcome page (use a generic key if user.id not available yet)
    const welcomeKey = user?.id ? `welcome_seen_${user.id}` : 'welcome_seen_current_user';
    localStorage.setItem(welcomeKey, 'true');
    
    // Navigate directly to dashboard - user is already authenticated if they're on welcome page
    navigate('/dashboard/single-finance');
  };

  const features = [
    {
      icon: FileText,
      title: 'Log Your Deals',
      description: 'Track every F&I product sale with our streamlined deal logging system'
    },
    {
      icon: TrendingUp,
      title: 'Monitor Performance',
      description: 'Real-time metrics on penetration rates, PVR, and product performance'
    },
    {
      icon: DollarSign,
      title: 'Track Earnings',
      description: 'Automatic commission calculations and monthly pay tracking'
    },
    {
      icon: Target,
      title: 'Hit Your Goals',
      description: 'Visual goal tracking to help you achieve your monthly targets'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Log Your First Deal',
      description: 'Click "Log New Deal" to start tracking your F&I performance'
    },
    {
      number: '2',
      title: 'Add Product Details',
      description: 'Enter VSC, GAP, PPM, and other product profits for each deal'
    },
    {
      number: '3',
      title: 'Track Your Progress',
      description: 'Watch your metrics update in real-time as you log deals'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">The DAS Board</h1>
            <Button
              variant="ghost"
              onClick={handleSkipToDashboard}
              className="text-gray-600 hover:text-gray-900"
            >
              Skip to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Finance Manager Dashboard!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You're all set to start tracking your F&I performance. Let's show you how to get the most out of your new dashboard.
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-12 bg-white shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-blue-600" />
              Quick Start Guide
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-blue-600" />
                Pro Tip: Log Deals Daily
              </h3>
              <p className="text-gray-700">
                For the most accurate tracking and insights, log your deals as they happen. This ensures your metrics are always up-to-date and helps you spot trends quickly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.title} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What You'll See */}
        <Card className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">What You'll See in Your Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Real-Time Metrics</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>F&I Gross Revenue tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Product penetration percentages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Per Vehicle Retailed (PVR) metrics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Products per deal tracking</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Performance Tools</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Monthly pay calculator</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Goal tracking & progress</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Deal status management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>F&I product mix analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Tracking Your Success?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your dashboard is set up and ready to go. Click below to start logging your first deal!
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Check out our{' '}
            <button 
              onClick={() => navigate('/help')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              help center
            </button>{' '}
            or contact support at support@thedasboard.com
          </p>
        </div>
      </div>
    </div>
  );
}