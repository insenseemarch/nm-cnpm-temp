import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  XCircle,
  UserCog,
  UserCheck,
  UserX,
  Calendar,
  Award,
  Shield,
  Cake,
  Heart,
  Bell,
} from 'lucide-react';
// NotificationDetailModal is rendered at a higher level (NotificationBell)

const typeToText = (n) => {
  const actor = n.actorName ? `${n.actorName} ` : '';
  switch (n.type) {
    case 'JOIN_REQUEST':
      return `${actor}đã gửi yêu cầu tham gia cây.`;
    case 'JOIN_APPROVED':
      return `Yêu cầu tham gia cây được chấp thuận.`;
    case 'JOIN_REJECTED':
      return `Yêu cầu tham gia cây bị từ chối.`;
    case 'MEMBER_REQUEST':
      return `${actor}gửi yêu cầu phê duyệt chỉnh sửa thông tin.`;
    case 'MEMBER_APPROVED':
      return `Yêu cầu chỉnh sửa thông tin được chấp thuận.`;
    case 'MEMBER_REJECTED':
      return `Yêu cầu chỉnh sửa thông tin bị từ chối.`;
    case 'EVENT_REMINDER':
      return `Nhắc nhở sự kiện: ${n.title || ''}`;
    case 'NEW_ACHIEVEMENT':
      return `Gia đình có thành tích mới: ${n.title || ''}`;
    case 'ADMIN_TRANSFER':
      return `${actor}đã chuyển quyền quản trị.`;
    case 'BIRTHDAY_REMINDER':
      return `Sinh nhật sắp tới: ${n.personName || ''}`;
    case 'ANNIVERSARY_REMINDER':
      return `Kỷ niệm sắp tới: ${n.personName || ''}`;
    default:
      return n.message || 'Thông báo mới';
  }
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const iconMap = {
  JOIN_REQUEST: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Mail,
  },
  JOIN_APPROVED: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: CheckCircle,
  },
  JOIN_REJECTED: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: XCircle,
  },
  MEMBER_REQUEST: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: UserCog,
  },
  MEMBER_APPROVED: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: UserCheck,
  },
  MEMBER_REJECTED: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: UserX,
  },
  EVENT_REMINDER: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Calendar,
  },
  NEW_ACHIEVEMENT: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Award,
  },
  ADMIN_TRANSFER: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Shield,
  },
  BIRTHDAY_REMINDER: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Cake,
  },
  ANNIVERSARY_REMINDER: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Heart,
  },
  DEFAULT: {
    bg: 'bg-accent/20',
    fg: 'text-accent',
    Icon: Bell,
  },
};

const getIconForType = (type) => {
  const info = iconMap[type] || iconMap.DEFAULT;
  const IconComponent = info.Icon;

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${info.bg} ${info.fg} mystical-border shadow-sm transition-all duration-300 hover:scale-110`}
      aria-hidden
      style={{ boxShadow: '0 0 10px rgba(114, 233, 251, 0.2)' }}
    >
      <IconComponent size={20} strokeWidth={2.5} />
    </div>
  );
};

const isInlineRequest = (type) => {
  if (!type) return false;
  return type.startsWith('JOIN_') || type.startsWith('MEMBER_') || type === 'ADMIN_TRANSFER';
};

const getRouteForNotification = (n) => {
  switch (n.type) {
    case 'EVENT_REMINDER':
      return `/events/${n.refId || n.id}`;
    case 'NEW_ACHIEVEMENT':
      return `/achievements/${n.refId || n.id}`;
    case 'BIRTHDAY_REMINDER':
    case 'ANNIVERSARY_REMINDER':
      // birthday/anniversary should navigate to event page
      return `/events/${n.refId || n.id}`;
    case 'ADMIN_TRANSFER':
      return `/profile`;
    default:
      return `/notifications`;
  }
};

const NotificationDropdown = ({
  notifications = [],
  onClose = () => {},
  onMarkAsRead = () => {},
  onOpenDetail = () => {},
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="absolute right-0 mt-3 w-96 max-h-[500px] overflow-hidden rounded-2xl bg-gradient-to-br from-background/98 via-primary/95 to-background/98 backdrop-blur-cosmic border mystical-border shadow-2xl animate-in fade-in slide-in-from-top-5"
      style={{ boxShadow: '0 0 40px rgba(114, 98, 255, 0.3), 0 10px 50px rgba(0, 0, 0, 0.5)' }}
    >
      <div className="px-5 py-4 border-b mystical-border flex items-center justify-between bg-gradient-to-r from-secondary/10 to-accent/10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <strong className="text-sm font-semibold text-foreground">Thông báo</strong>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-accent transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-accent/10"
        >
          Đóng
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 && (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Không có thông báo</p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={`relative px-4 py-3.5 hover:bg-gradient-to-r hover:from-accent/10 hover:to-secondary/10 transition-all duration-300 flex items-start gap-3 border-b border-border/30 last:border-0 ${
              !n.read ? 'bg-gradient-to-r from-secondary/5 to-accent/5' : ''
            }`}
          >
            <div className="flex-shrink-0 relative mt-0.5">{getIconForType(n.type)}</div>
            <div className="flex-1 relative min-w-0">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInlineRequest(n.type)) {
                      onOpenDetail(n);
                      onClose();
                    } else {
                      const route = getRouteForNotification(n);
                      if (route) {
                        onClose();
                        navigate(route);
                      }
                    }
                  }}
                  className="text-left w-full group/btn"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-relaxed flex-1 group-hover/btn:text-accent transition-colors">
                        {typeToText(n)}
                      </p>
                      {!n.read && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-accent to-secondary flex-shrink-0 mt-1.5"
                          style={{ boxShadow: '0 0 6px rgba(114, 233, 251, 0.6)' }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-medium">
                        {timeAgo(n.createdAt)}
                      </span>
                      {n.familyName && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-2xl text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                          {n.familyName}
                          <span className="ml-1.5 opacity-60">({n.familyId})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t mystical-border text-center bg-gradient-to-r from-secondary/5 to-accent/5">
        <button className="text-xs font-semibold text-accent hover:text-secondary transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-accent/10 hover:to-secondary/10">
          Xem tất cả
        </button>
      </div>
      {/* Modal is rendered by NotificationBell via onOpenDetail */}
    </div>
  );
};

export default NotificationDropdown;
