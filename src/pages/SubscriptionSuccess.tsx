import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Mail, Calendar, Users, Building, Lightbulb } from 'lucide-react';

interface SuccessState {
  planName: string;
  organizationName: string;
  setupComplete: boolean;
}

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessState;

  const nextSteps = [
    {
      icon: Mail,
      title: 'Check Your Email',
      description:
        "We've sent setup instructions and login credentials to your admin email addresses.",
      status: 'completed',
    },
    {
      icon: Users,
      title: 'Add Your Team',
      description:
        'Invite salespeople, finance managers, and other team members to their dashboards.',
      status: 'pending',
    },
    {
      icon: Building,
      title: 'Configure Dealerships',
      description: 'Set up goals, schedules, and customize your dashboard preferences.',
      status: 'pending',
    },
    {
      icon: Calendar,
      title: 'Start Using DAS Board',
      description: 'Begin logging deals and tracking performance across your organization.',
      status: 'pending',
    },
  ];

  const handleGetStarted = () => {
    // Navigate to the appropriate dashboard based on the plan
    navigate('/auth', {
      state: {
        message: 'Welcome to The DAS Board! Please log in with your credentials.',
        newSubscription: true,
      },
    });
  };

  if (!state?.setupComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Access</h1>
          <p className="text-gray-400 mb-6">
            This page is only accessible after completing a subscription.
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to The DAS Board!</h1>
            <p className="text-xl text-gray-300">
              Your subscription for{' '}
              <span className="text-blue-400 font-semibold">{state.organizationName}</span> is now
              active.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subscription Details */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">{state.planName}</div>
              <div className="text-gray-400">Subscription Plan</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">14 Days</div>
              <div className="text-gray-400">Free Trial Period</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-2">5 Minutes</div>
              <div className="text-gray-400">Setup Time Remaining</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Next Steps</h2>
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      step.status === 'completed' ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        step.status === 'completed' ? 'text-green-400' : 'text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                  {step.status === 'completed' && (
                    <div className="text-green-400 text-sm font-medium">✓ Completed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Lightbulb className="w-6 h-6 text-blue-400 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quick Tips for Success</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Start by adding a few key team members to test the system
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Log a few sample deals to see how the dashboards populate
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Set realistic monthly goals to track progress effectively
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Use the schedule management to organize your team efficiently
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help Getting Started?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Documentation</h4>
              <p className="text-gray-400 text-sm mb-3">
                Comprehensive guides and tutorials to help you get the most out of The DAS Board.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View Documentation →
              </button>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Support Team</h4>
              <p className="text-gray-400 text-sm mb-3">
                Our support team is ready to help with setup, training, and any questions you have.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
          >
            Access Your Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <button
            onClick={() => navigate('/screenshots')}
            className="border border-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            View Feature Tour
          </button>
        </div>

        {/* Trial Information */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">
              Your 14-day free trial starts now. No charges until{' '}
              {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              <br />
              You can cancel anytime before your trial ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
