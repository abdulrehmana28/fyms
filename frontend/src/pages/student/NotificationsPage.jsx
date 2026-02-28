import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../store/slices/notificationSlice";
import {
  AlertCircle,
  BadgeCheck,
  BellOff,
  Calendar,
  CheckCircle2,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markNotificationAsReadHandler = (id) =>
    dispatch(markNotificationAsRead(id));
  const markAllNotificationsAsReadHandler = () =>
    dispatch(markAllNotificationsAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return (
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
        );
      case "deadline":
        return (
          <div className="p-2.5 bg-rose-100 rounded-xl">
            <Clock5 className="w-5 h-5 text-rose-600" />
          </div>
        );
      case "approval":
        return (
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case "meeting":
        return (
          <div className="p-2.5 bg-violet-100 rounded-xl">
            <Calendar className="w-5 h-5 text-violet-600" />
          </div>
        );
      case "system":
        return (
          <div className="p-2.5 bg-slate-100 rounded-xl">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 bg-slate-100 rounded-xl">
            <User className="w-5 h-5 text-slate-600" />
          </div>
        );
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-white",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-white",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority?.toLowerCase() === "high")
        .length,
      bg: "bg-white",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      Icon: CheckCircle2,
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-500 mt-1 text-lg">
            Stay updated with your project progress and important alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            onClick={markAllNotificationsAsReadHandler}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col gap-3">
              <div
                className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <item.Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.title}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications Container */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            Recent Activity
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group relative p-6 transition-all hover:bg-slate-50/80 ${!notification.isRead ? "bg-blue-50/40" : ""
                  }`}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-lg transition-colors ${!notification.isRead
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-700"
                            }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <time className="text-sm font-medium text-slate-400 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-4 text-[15px]">
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getPriorityStyles(
                            notification.priority,
                          )}`}
                        >
                          {notification.priority || "Low"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold capitalize">
                          <MessageCircle className="w-3 h-3" />
                          {notification.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                            onClick={() =>
                              markNotificationAsReadHandler(notification._id)
                            }
                            title="Mark as read"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Read</span>
                          </button>
                        )}
                        <button
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                          onClick={() =>
                            deleteNotificationHandler(notification._id)
                          }
                          title="Delete notification"
                        >
                          <BellOff className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <BellOff className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                All caught up!
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                No new notifications at the moment. We'll let you know when something important happens.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
