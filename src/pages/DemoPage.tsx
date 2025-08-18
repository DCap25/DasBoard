import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface HotspotProps {
  x: number;
  y: number;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  popupPosition?: 'bottom' | 'right' | 'top-left';
}

const Hotspot: React.FC<HotspotProps> = ({
  x,
  y,
  title,
  description,
  isActive,
  onClick,
  popupPosition = 'bottom',
}) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div
      className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 bg-blue-500 hover:bg-blue-400 hover:scale-110`}
    >
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
    </div>

    <div
      className={`absolute bg-white rounded-lg shadow-xl p-4 w-64 z-10 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
        popupPosition === 'right'
          ? 'left-8 top-1/2 transform -translate-y-1/2'
          : popupPosition === 'top-left'
            ? 'right-8 bottom-8 transform'
            : 'top-8 left-1/2 transform -translate-x-1/2'
      }`}
    >
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default function DemoPage() {
  const navigate = useNavigate();
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [currentDemo, setCurrentDemo] = useState('salesperson');

  const hotspotsConfig = {
    finance: [
      {
        x: 26,
        y: 59,
        title: 'Product Tracking',
        description:
          'Monitor product sales performance, track warranties, GAP, and other F&I products to maximize profitability per deal.',
        popupPosition: 'right' as const,
      },
      {
        x: 15,
        y: 20,
        title: 'Performance Metrics',
        description:
          'Monitor your personal performance with key metrics like PVR (Per Vehicle Retailed), products per deal, and monthly targets.',
      },
      {
        x: 70,
        y: 51,
        title: 'Team Performance',
        description:
          'Compare your performance with team averages and see how you rank among your colleagues.',
      },
      {
        x: 35,
        y: 90,
        title: 'Recent Deals Log',
        description:
          'View and manage your most recent deals with quick access to customer details and deal profitability.',
        popupPosition: 'top-left' as const,
      },
      {
        x: 85,
        y: 20,
        title: 'PVR',
        description:
          'Per Vehicle Retailed - Track your average profit per vehicle and see how it compares to targets and team averages.',
      },
      {
        x: 60,
        y: 20,
        title: 'Pay Calculator',
        description:
          'Calculate your commission and bonuses based on deal profitability and product sales.',
      },
      {
        x: 40,
        y: 33,
        title: 'Schedule',
        description: 'View your Schedule for the week and month',
      },
    ],
    'sales-manager': [
      {
        x: 30,
        y: 55,
        title: 'Team Schedule',
        description:
          'Easily view team schedules, track attendance, and manage shift assignments for optimal coverage.',
        popupPosition: 'right' as const,
      },
      {
        x: 15,
        y: 25,
        title: 'Gross Profit Indicator',
        description: 'Easily track Front End and Back End Gross in Real Time.',
      },
      {
        x: 85,
        y: 88,
        title: 'Sales Reports, Scheduler, Goals',
        description:
          'Access comprehensive sales reports, manage team schedules, and set/track monthly and yearly goals for your sales team.',
        popupPosition: 'top-left' as const,
      },
      {
        x: 35,
        y: 90,
        title: 'The DAS Board',
        description:
          'View Sales Leaderboard to stay on top of your salespeople performance and rankings.',
        popupPosition: 'top-left' as const,
      },
      {
        x: 90,
        y: 27,
        title: 'PVR',
        description:
          'Per Vehicle Retailed - Track your average profit per vehicle and see how it compares to targets and team averages.',
      },
      {
        x: 60,
        y: 25,
        title: 'Sales Performance',
        description:
          'Quick view to stay on top of sales goals, track team progress, and monitor key performance indicators.',
      },
      {
        x: 40,
        y: 28,
        title: 'Units Sold',
        description:
          'Track total units sold including new and used vehicles with daily, weekly, and monthly breakdowns.',
      },
    ],
    salesperson: [
      {
        x: 21,
        y: 63,
        title: 'The DAS Board',
        description:
          'View Sales Leaderboard to stay on top of your salespeople performance and rankings.',
        popupPosition: 'right' as const,
      },
      {
        x: 12,
        y: 23,
        title: 'Unit Count',
        description:
          'Track your new car and used car totals with daily, weekly, and monthly breakdowns to monitor sales volume.',
      },
      {
        x: 70,
        y: 56,
        title: 'Deal Log',
        description:
          'Stay on top of all of your deals with detailed customer information, deal status, and transaction history.',
      },
      {
        x: 50,
        y: 90,
        title: 'Goal Tracker and Pay Calculator',
        description:
          'Stay on top of your goals and MTD pay estimator to track progress and maximize earnings.',
        popupPosition: 'top-left' as const,
      },
      {
        x: 88,
        y: 23,
        title: 'Goal Quick View',
        description:
          'Easily know where you are at with your goals and track progress towards monthly and yearly targets.',
      },
      {
        x: 35,
        y: 23,
        title: 'Gross Tracker',
        description:
          'Stay on top of your gross with quick view front and back gross tracking to maximize every deal.',
        popupPosition: 'right' as const,
      },
      {
        x: 40,
        y: 40,
        title: 'Schedule',
        description: 'View your Schedule for the week and month',
      },
    ],
    'general-manager': [
      {
        x: 16,
        y: 49,
        title: 'F&I Manager Performance',
        description:
          'Compare F&I Manager performance with team averages and benchmark against industry standards for maximum profitability.',
        popupPosition: 'right' as const,
      },
      {
        x: 15,
        y: 20,
        title: 'Performance Metrics',
        description:
          "Monitor the dealership's performance with key metrics like PVR (Per Vehicle Retailed), products per deal, and total gross.",
      },
      {
        x: 85,
        y: 48,
        title: 'Sales Manager Performance',
        description:
          'View Sales Manager performance against teammates and compare individual metrics across the sales management team.',
      },
      {
        x: 35,
        y: 90,
        title: 'Sales DAS Board',
        description:
          'View your sales person leaders and track top performers for maximum productivity while monitoring team dynamics and individual goal achievement.',
        popupPosition: 'top-left' as const,
      },
      {
        x: 90,
        y: 20,
        title: 'PVR',
        description:
          "Per Vehicle Retailed - Track the dealership's average profit per vehicle both front end and back end to see results fast.",
      },
      {
        x: 64,
        y: 20,
        title: 'Goal Tracking',
        description:
          'Quickly determine unit sales progress MTD and track performance against monthly targets.',
      },
      {
        x: 38,
        y: 19,
        title: 'Units Sold',
        description:
          'Quickly track total units sold including new and used vehicles with MTD sales.',
      },
    ],
  };

  const demos = [
    {
      id: 'salesperson',
      title: 'Sales Person Dashboard',
      description: 'Individual sales tracking and customer management',
      image: '/images/SPDASH.JPG',
    },
    {
      id: 'finance',
      title: 'Finance Manager Dashboard',
      description: 'Individual finance manager tracking performance and deals',
      image: '/images/fi.JPG',
    },
    {
      id: 'sales-manager',
      title: 'Sales Manager Dashboard',
      description: 'Team management and sales performance overview',
      image: '/images/SMDASH.JPG',
    },
    {
      id: 'general-manager',
      title: 'General Manager Dashboard',
      description: 'Complete dealership overview and analytics',
      image: '/images/GMDASH.JPG',
    },
  ];

  const currentDemoData = demos.find(demo => demo.id === currentDemo);
  const currentHotspots = hotspotsConfig[currentDemo] || [];
  const currentDemoIndex = demos.findIndex(demo => demo.id === currentDemo);

  const handlePrevDemo = () => {
    const prevIndex = currentDemoIndex > 0 ? currentDemoIndex - 1 : demos.length - 1;
    setCurrentDemo(demos[prevIndex].id);
  };

  const handleNextDemo = () => {
    const nextIndex = currentDemoIndex < demos.length - 1 ? currentDemoIndex + 1 : 0;
    setCurrentDemo(demos[nextIndex].id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#00529b' }}>
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-white">Experience The DAS Board</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-300">
            Explore our interactive demo to see how different roles use our dashboard
          </p>
        </div>

        {/* Demo Container */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{currentDemoData?.title}</h2>
              <p className="text-gray-400">{currentDemoData?.description}</p>
            </div>
          </div>

          {/* Interactive Dashboard Demo with Arrows */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={handlePrevDemo}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-20 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNextDemo}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-20 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dashboard Image Container */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-xl">
              <div className="w-full relative" style={{ minHeight: '600px' }}>
                <img
                  src={currentDemoData?.image}
                  alt={currentDemoData?.title}
                  className="w-full h-full object-contain"
                  style={{ minHeight: '600px', maxHeight: '600px' }}
                />

                {/* Interactive Hotspots */}
                {currentHotspots.map((hotspot, index) => (
                  <Hotspot
                    key={index}
                    x={hotspot.x}
                    y={hotspot.y}
                    title={hotspot.title}
                    description={hotspot.description}
                    isActive={activeHotspot === index}
                    onClick={() => setActiveHotspot(activeHotspot === index ? null : index)}
                    popupPosition={hotspot.popupPosition}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dot Navigation */}
          <div className="flex justify-center items-center space-x-2 mt-6">
            {demos.map((demo, index) => (
              <button
                key={demo.id}
                onClick={() => setCurrentDemo(demo.id)}
                className={`transition-all duration-300 ${
                  currentDemo === demo.id
                    ? 'w-3 h-3 bg-blue-500 rounded-full'
                    : 'w-2 h-2 bg-gray-500 hover:bg-gray-400 rounded-full'
                }`}
                aria-label={`Go to ${demo.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
