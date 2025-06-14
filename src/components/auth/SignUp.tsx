import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Building, Users } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();

  const signupOptions = [
    {
      id: 'single-finance',
      title: 'Single Finance Manager',
      description: 'Independent finance manager looking to track and manage deals',
      icon: User,
      route: '/signup/single-finance',
      features: [
        'Personal deal tracking',
        'Performance analytics',
        'Goal management',
        'Commission tracking',
      ],
    },
    {
      id: 'single-dealership',
      title: 'Single Dealership',
      description: 'Individual dealership wanting to manage sales and finance teams',
      icon: Building,
      route: '/signup/dealership',
      features: ['Team management', 'Sales tracking', 'Finance oversight', 'Performance reporting'],
    },
    {
      id: 'dealer-group',
      title: 'Dealer Group',
      description: 'Multi-location dealer group needing centralized management',
      icon: Users,
      route: '/signup/dealer-group',
      features: [
        'Multi-location management',
        'Centralized reporting',
        'Group-wide analytics',
        'Scalable team structure',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Join The Das Board</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the option that best describes your business to get started with the right
            dashboard for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signupOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer group"
                onClick={() => navigate(option.route)}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 group-hover:bg-blue-500 transition-colors">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{option.description}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center group-hover:shadow-lg"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(option.route);
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
