import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import { TOAST_DURATION } from "../constants.js";

const ToastContext = createContext(null);

const toastStyles = {
  error: {
    toast:
      "w-full max-w-xl border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200",
    iconWrap:
      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200",
    toggle:
      "bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-900 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 dark:hover:text-white",
    Icon: HiX,
  },
  success: {
    toast:
      "w-full max-w-xl border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200",
    iconWrap:
      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200",
    toggle:
      "bg-green-50 text-green-400 hover:bg-green-100 hover:text-green-900 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 dark:hover:text-white",
    Icon: HiCheck,
  },
};

function AppToast({ toast, onDismiss }) {
  const { toast: toastClass, iconWrap, toggle, Icon } =
    toastStyles[toast.type] || toastStyles.error;

  return (
    <div className="pointer-events-auto w-full max-w-xl toast-in">
      <Toast className={toastClass}>
        <div className={iconWrap}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-medium">{toast.message}</div>
        <ToastToggle className={toggle} onDismiss={onDismiss} />
      </Toast>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    toastRef.current = null;
    setToast(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message, type = "error") => {
      if (!message) return;

      const next = { message, type };
      if (
        toastRef.current?.message === next.message &&
        toastRef.current?.type === next.type
      ) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      toastRef.current = next;
      setToast(next);
      timeoutRef.current = setTimeout(() => {
        toastRef.current = null;
        setToast(null);
        timeoutRef.current = null;
      }, TOAST_DURATION);
    },
    [],
  );

  const showError = useCallback(
    (message) => showToast(message, "error"),
    [showToast],
  );

  const showSuccess = useCallback(
    (message) => showToast(message, "success"),
    [showToast],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, showError, showSuccess, hideToast }),
    [showToast, showError, showSuccess, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-100 flex justify-center px-4">
        {toast && (
          <AppToast toast={toast} onDismiss={hideToast} />
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
