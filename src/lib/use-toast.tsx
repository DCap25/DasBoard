// Inspired by react-hot-toast library
import * as React from 'react';

import {
  Toast,
  ToastActionElement,
  ToastProps,
  ToastProvider,
  ToastViewport,
} from '../components/ui/toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: string;
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // Dismiss all toasts if no ID is provided
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map(t => ({
            ...t,
            open: false,
          })),
        };
      }

      // Dismiss a specific toast by ID
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === toastId ? { ...t, open: false } : t)),
      };
    }

    case 'REMOVE_TOAST': {
      const { toastId } = action;

      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== toastId),
      };
    }
  }
};

type ToastContextType = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, 'id'>) => string;
  updateToast: (toast: Partial<ToasterToast> & { id: string }) => void;
  dismissToast: (id?: string) => void;
  removeToast: (id?: string) => void;
} | null;

const ToastContext = React.createContext<ToastContextType>(null);

// Create a global store for the toast context
let toastContextValue: ToastContextType = null;

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    console.error('[ToastContext] useToast called outside of ToastProvider');
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  React.useEffect(() => {
    console.log('[ToastContext] Provider mounted');
    return () => {
      console.log('[ToastContext] Provider unmounted');
    };
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToasterToast, 'id'>) => {
      const id = genId();
      console.log(`[ToastContext] Adding toast: ${id}`, toast);

      const newToast = {
        ...toast,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) {
            dismissToast(id);
          }
        },
      };

      dispatch({ type: 'ADD_TOAST', toast: newToast });

      return id;
    },
    [dispatch]
  );

  const updateToast = React.useCallback(
    (toast: Partial<ToasterToast> & { id: string }) => {
      console.log(`[ToastContext] Updating toast: ${toast.id}`, toast);
      dispatch({ type: 'UPDATE_TOAST', toast });
    },
    [dispatch]
  );

  const dismissToast = React.useCallback(
    (toastId?: string) => {
      console.log(`[ToastContext] Dismissing toast: ${toastId || 'all'}`);
      dispatch({ type: 'DISMISS_TOAST', toastId });
    },
    [dispatch]
  );

  const removeToast = React.useCallback(
    (toastId?: string) => {
      console.log(`[ToastContext] Removing toast: ${toastId || 'all'}`);
      if (toastId !== undefined && toastTimeouts.has(toastId)) {
        clearTimeout(toastTimeouts.get(toastId));
        toastTimeouts.delete(toastId);
      }

      dispatch({ type: 'REMOVE_TOAST', toastId });
    },
    [dispatch]
  );

  React.useEffect(() => {
    state.toasts.forEach(toast => {
      if (!toast.open && !toastTimeouts.has(toast.id)) {
        const timeout = setTimeout(() => {
          removeToast(toast.id);
        }, TOAST_REMOVE_DELAY);

        toastTimeouts.set(toast.id, timeout);
      }
    });
  }, [state.toasts, removeToast]);

  // Store the context value in our global variable
  const contextValue = {
    toasts: state.toasts,
    addToast,
    removeToast,
    updateToast,
    dismissToast,
  };

  toastContextValue = contextValue;

  console.log('[ToastContext] Rendering with state:', state);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastProvider>
        {state.toasts.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props}>
            {title && <div className="grid gap-1">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
            {action}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

// Create and export the toast function that doesn't use hooks directly
export function toast(props: Omit<ToasterToast, 'id'>) {
  try {
    if (!toastContextValue) {
      console.warn('[ToastContext] Toast context not available yet. Toast will not be displayed.');
      console.log('[ToastContext] Toast props:', props);
      return '';
    }

    return toastContextValue.addToast(props);
  } catch (error) {
    console.error('[ToastContext] Error displaying toast:', error);
    console.log('[ToastContext] Toast props:', props);
    return '';
  }
}

// Helper functions
toast.success = function (props: { title: string; description: string }) {
  return toast({ ...props, variant: 'default' });
};

toast.error = function (props: { title: string; description: string }) {
  return toast({ ...props, variant: 'destructive' });
};

toast.warning = function (props: { title: string; description: string }) {
  return toast({ ...props, variant: 'warning' });
};

toast.info = function (props: { title: string; description: string }) {
  return toast({ ...props, variant: 'info' });
};
