import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Copy, CheckCircle, Users, TrendingUp, DollarSign } from 'lucide-react';

const DemoLoginInstructions: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoCredentials = {
    email: 'demo@thedasboard.com',
    password: 'DemoUser2025!',
  };

  const copyCredentials = async () => {
    const credText = `Email: ${demoCredentials.email}\nPassword: ${demoCredentials.password}`;
    try {
      await navigator.clipboard.writeText(credText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy credentials:', err);
    }
  };

  const demoFeatures = [
    {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: 'Sales Performance',
      description: '42 monthly sales, $1.25M revenue, 78% F&I penetration',
    },
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: 'Multi-Role Access',
      description: 'Sales Manager permissions with dashboard variety',
    },
    {
      icon: <DollarSign className="h-5 w-5 text-yellow-500" />,
      title: 'Realistic Deal Data',
      description: 'Sample deals with finance & insurance metrics',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Sales Demo
            </Badge>
          </div>
          <CardTitle className="text-xl">Demo Account Access</CardTitle>
          <CardDescription>
            Secure login credentials for sales demonstrations and product previews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demo Credentials */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Login Credentials</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  value={demoCredentials.email}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={demoCredentials.password}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-700 pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={copyCredentials} variant="outline" size="sm" className="mt-3 w-full">
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </Button>
          </div>

          {/* Demo Features */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
              Demo Environment Features
            </h3>

            <div className="space-y-3">
              {demoFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {feature.icon}
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              Usage Instructions
            </h3>
            <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
              <li>Use the normal login page with these credentials</li>
              <li>Demo user will be automatically redirected to demo dashboard</li>
              <li>All data shown is simulated for demonstration purposes</li>
              <li>Session will remain active until manual logout</li>
            </ol>
          </div>

          {/* Security Notice */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Security Notice</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              This demo account is for authorized sales demonstrations only. Do not share these
              credentials outside of approved sales activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoLoginInstructions;
