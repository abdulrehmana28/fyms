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
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;

      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;

      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;

      default:
        // Custom combined icon (User + Down Arrow)
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "border-1-red-500";
      case "Medium":
        return "border-1-yellow-500";
      case "Low":
        return "border-1-green-500";
      default:
        return "border-1-slate-300";
    }
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter(
        (notification) => notification.priority === "high",
      ).length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((notification) => {
        const notifDate = new Date(notification.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };
  return (
    <>
      <div className="space-y-6">
        <div className="card">
          {/* card header */}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Stay updated with your project progress and deadlines
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small"
                  onClick={markAllNotificationsAsReadHandler}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          {/* notification stats */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item, index) => {
              return (
                <div key={index} className={`p-4 rounded-lg ${item.bg}`}>
                  <div className="flex items-center">
                    <div className={`p-2 ${item.iconBg} rounded-lg`}>
                      <item.Icon className={`w-6 h-6 ${item.textColor}`} />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${item.titleColor}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm font-semibold ${item.valueColor}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              return (
                <div
                  key={notification._id}
                  className={`p-4 border border-slate-200 border-1 rounded-lg transition-all duration-200 ${getPriorityColor(
                    notification.priority,
                  )} ${!notification.isRead ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}
                        >
                          {notification.title}{" "}
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-50 rounded-full inline-block">
                              ●
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          <span
                            className={`badge capitalize ${notification.priority === "High" ? "badge-rejected" : notification.priority === "Medium" ? "badge-pending" : "badge-approved"}`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center">
                        <span
                          className={`badge capitalize ${
                            notification.type === "feedback"
                              ? "bg-blue-100 text-blue-800"
                              : notification.type === "deadline"
                                ? "bg-red-100 text-red-800"
                                : notification.type === "approval"
                                  ? "bg-green-100 text-green-800"
                                  : notification.type === "meeting"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {notification.type}
                        </span>

                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              className="text-sm text-blue-600 hover:text-blue-500"
                              onClick={() => {
                                markNotificationAsReadHandler(notification._id);
                              }}
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            className="text-sm text-red-600 hover:text-red-500"
                            onClick={() => {
                              deleteNotificationHandler(notification._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center text-slate-300">
                <div className="flex items-center justify-center mb-3 text-slate-400">
                  <BellOff className="h-12 w-12" />
                </div>
              </div>
              <p className="text-slate-500 text-sm">
                No notifications available
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
