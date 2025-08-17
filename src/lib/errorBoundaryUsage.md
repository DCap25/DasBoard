# Error Boundary Usage Guide for The DAS Board

## Overview

The DAS Board now includes comprehensive error handling with multiple layers of error boundaries and safe API wrappers. This guide explains how to use the error handling system effectively.

## Error Boundary Components

### 1. PageErrorBoundary
Use for entire page/route components:
```tsx
import { PageErrorBoundary } from '../components/ErrorBoundary';

<PageErrorBoundary identifier="HomePage">
  <HomePage />
</PageErrorBoundary>
```

### 2. SectionErrorBoundary
Use for major UI sections:
```tsx
import { SectionErrorBoundary } from '../components/ErrorBoundary';

<SectionErrorBoundary identifier="UserProfile">
  <UserProfileSection />
</SectionErrorBoundary>
```

### 3. ComponentErrorBoundary
Use for individual components:
```tsx
import { ComponentErrorBoundary } from '../components/ErrorBoundary';

<ComponentErrorBoundary identifier="DataTable">
  <DataTable data={data} />
</ComponentErrorBoundary>
```

## Safe API Calls

### Basic Usage
```tsx
import { safeApiCall } from '../lib/errorHandling';

const fetchUserData = async (userId: string) => {
  const result = await safeApiCall(
    () => supabase.from('users').select('*').eq('id', userId).single(),
    {
      identifier: 'fetchUserData',
      onError: (error) => {
        console.error('Failed to fetch user:', error.userMessage);
      }
    }
  );

  if (result.success) {
    return result.data;
  } else {
    throw result.error;
  }
};
```

### With Retry Configuration
```tsx
const result = await safeApiCall(
  () => apiFunction(),
  {
    retryConfig: {
      maxAttempts: 5,
      baseDelay: 2000,
      backoffFactor: 1.5
    },
    timeout: 15000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    }
  }
);
```

## Safe State Updates

```tsx
import { safeStateUpdate } from '../lib/errorHandling';

const MyComponent = () => {
  const [data, setData] = useState(null);

  const updateData = (newData) => {
    safeStateUpdate(setData, newData, 'MyComponent');
  };

  return <div>{/* component content */}</div>;
};
```

## Safe Form Submissions

```tsx
import { safeFormSubmit } from '../lib/errorHandling';

const handleSubmit = async (formData) => {
  const result = await safeFormSubmit(
    () => submitToAPI(formData),
    {
      formName: 'UserRegistration',
      onSuccess: (data) => {
        toast({ title: 'Success', description: 'User registered successfully' });
      },
      onValidationError: (errors) => {
        errors.forEach(error => {
          setFieldError(error.field, error.message);
        });
      },
      onError: (errors) => {
        toast({ title: 'Error', description: 'Submission failed' });
      }
    }
  );

  return result;
};
```

## Specialized Error Boundaries

```tsx
import { createSpecializedErrorBoundary } from '../lib/errorHandling';

// For authentication components
const authBoundaryConfig = createSpecializedErrorBoundary('auth');
<SectionErrorBoundary {...authBoundaryConfig}>
  <LoginForm />
</SectionErrorBoundary>

// For API-heavy components
const apiBoundaryConfig = createSpecializedErrorBoundary('api');
<ComponentErrorBoundary {...apiBoundaryConfig}>
  <DataFetchingComponent />
</ComponentErrorBoundary>
```

## HOC Pattern

```tsx
import { withErrorBoundary } from '../components/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent, {
  identifier: 'MyComponent',
  onError: (error) => {
    console.log('Component error:', error.userMessage);
  }
});
```

## Async Function Wrapping

```tsx
import { withAsyncErrorHandling } from '../components/ErrorBoundary';

const safeAsyncFunction = withAsyncErrorHandling(
  async (params) => {
    // Your async logic here
    const result = await someAsyncOperation(params);
    return result;
  },
  (error) => {
    console.error('Async operation failed:', error.userMessage);
    // Handle error appropriately
  }
);
```

## React Query Integration

The app automatically uses a safe query client with enhanced error handling:

```tsx
// This is already configured in App.tsx
import { useQuery } from '@tanstack/react-query';

const { data, error, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  // Automatic retry and error handling is already configured
});
```

## Error Reporting

```tsx
import { reportError } from '../lib/errorHandling';

// Manual error reporting
try {
  // Some operation
} catch (error) {
  reportError(error, {
    context: 'UserAction',
    action: 'updateProfile',
    userId: user.id
  });
}
```

## Security Features

- **No Sensitive Data**: All error logging automatically sanitizes sensitive information
- **Production Safe**: Error messages are user-friendly in production
- **Secure Context**: Only non-sensitive context information is logged
- **Debounced Reporting**: Prevents error spam
- **Memory Safe**: Automatic cleanup and memory leak prevention

## Best Practices

1. **Layer Your Boundaries**: Use page → section → component hierarchy
2. **Identify Components**: Always provide meaningful identifiers
3. **Handle Errors Gracefully**: Provide fallback UI and recovery options
4. **Use Safe Wrappers**: Wrap all API calls and state updates
5. **Test Error Cases**: Verify error boundaries work correctly
6. **Monitor Logs**: Check console for error patterns in development

## Development Tools

In development mode, additional debugging information is available:

```tsx
// Available in browser console
window.debugStorage.inspect(); // Inspect localStorage
window.debugSupabase.testConnection(); // Test Supabase connection

// Error history in sessionStorage
JSON.parse(sessionStorage.getItem('error_history') || '[]');
```