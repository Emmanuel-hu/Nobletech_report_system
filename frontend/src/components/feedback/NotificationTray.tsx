import { useNotification } from '../../context/NotificationContext';

export const NotificationTray = () => {
  const { notifications, dismissNotification } = useNotification();

  return (
    <aside className="notification-tray" aria-label="Notifications" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.tone}`}>
          <div>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
          <button type="button" onClick={() => dismissNotification(notification.id)} aria-label="Dismiss notification">
            Close
          </button>
        </div>
      ))}
    </aside>
  );
};
