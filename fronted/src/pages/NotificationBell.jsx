import { useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
} from "../services/notification.service";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then((res) => {
      setUnread(res.data.count);
    });
  }, []);

  const toggleBell = async () => {
    setOpen(!open);

    if (!open) {
      const res = await getNotifications();
      setNotifications(res.data.data);
      await markAllRead();
      setUnread(0);
    }
  };

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button onClick={toggleBell} className="relative">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-2 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-900 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-400">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="p-4 border-b border-gray-800">
                <p className="text-sm">
                  <span className="font-semibold">
                    {n.sender?.username}
                  </span>{" "}
                  {n.type === "LIKE" && "liked your video"}
                  {n.type === "COMMENT" && "commented on your video"}
                  {n.type === "SUBSCRIBE" && "subscribed to your channel"}
                </p>

                {n.video && (
                  <Link
                    to={`/watch/${n.video._id}`}
                    className="text-blue-400 text-xs"
                  >
                    View video
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
