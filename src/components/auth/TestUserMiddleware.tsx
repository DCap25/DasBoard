import React, { ReactNode } from 'react';

interface TestUserMiddlewareProps {
  children: ReactNode;
}

/**
 * TestUserMiddleware - A development middleware component for testing user flows
 * Currently acts as a passthrough wrapper for children components
 */
const TestUserMiddleware: React.FC<TestUserMiddlewareProps> = ({ children }) => {
  // For now, this is just a passthrough component
  // Can be extended later with test user functionality if needed
  return <>{children}</>;
};

export default TestUserMiddleware;
