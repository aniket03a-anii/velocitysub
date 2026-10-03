import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  Info,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadData = () => {
    setNotifications(DataService.getNotifications());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const handleMarkRead = (id: string) => {
    DataService.markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    DataService.markAllNotificationsRead();
  };

  const filtered = notifications.filter((n) => filter === 'all' || !n.read_at);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time renewal alarms, silent tariff increase warnings, and new candidate discovery pings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Unread ({notifications.filter((n) => !n.read_at).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No notifications to display</p>
            <p>You are all caught up on renewal and price change alerts.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const isUnread = !n.read_at;

            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  isUnread ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'price_increase'
                        ? 'bg-rose-50 text-rose-600'
                        : n.type === 'new_candidate'
                        ? 'bg-amber-50 text-amber-600'
                        : n.type === 'renewal_alert'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {n.type === 'price_increase' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : n.type === 'new_candidate' ? (
                      <Sparkles className="w-5 h-5" />
                    ) : n.type === 'renewal_alert' ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs font-bold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {n.type === 'new_candidate' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('/discover');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 shrink-0 self-center"
                  >
                    <span>Review Candidate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
