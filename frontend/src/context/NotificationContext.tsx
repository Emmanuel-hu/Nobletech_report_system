import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type NotificationTone = 'success' | 'warning' | 'danger' | 'info';

export type Notification = {
  id: string;
  title: string;
  message: string;
  tone: NotificationTone;
};

type NotificationContextValue = {
  notifications: Notification[];
  pushNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = (id: string): void => {
    setNotifications((previous) => previous.filter((notification) => notification.id !== id));
  };

  const pushNotification = (notification: Omit<Notification, 'id'>): void => {
    const id = crypto.randomUUID();
    setNotifications((previous) => [...previous, { id, ...notification }]);

    window.setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  };

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, pushNotification, dismissNotification }),
    [notifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used inside NotificationProvider.');
  }

  return context;
};
