import React from 'react';
import { X, User, Calendar, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';

const NotificationDetailModal = ({ notification, onClose, onAccept, onReject, busy }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative max-w-lg w-full mx-4 bg-gradient-to-br from-background/98 via-primary/95 to-background/98 backdrop-blur-cosmic border mystical-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ boxShadow: '0 0 60px rgba(114, 98, 255, 0.4), 0 20px 60px rgba(0, 0, 0, 0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b mystical-border bg-gradient-to-r from-secondary/10 to-accent/10">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            Chi tiết thông báo
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {notification.actorName && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-secondary/5 to-accent/5 border border-border/30">
              <User className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Người gửi</p>
                <p className="text-sm font-semibold text-foreground">{notification.actorName}</p>
              </div>
            </div>
          )}
          {notification.title && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-accent/5 to-secondary/5 border border-border/30">
              <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Tiêu đề</p>
                <p className="text-sm font-semibold text-foreground">{notification.title}</p>
              </div>
            </div>
          )}
          {notification.personName && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-warning/5 to-success/5 border border-border/30">
              <User className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Liên quan</p>
                <p className="text-sm font-semibold text-foreground">{notification.personName}</p>
              </div>
            </div>
          )}
          {notification.message && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/30">
              <MessageSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Mô tả</p>
                <p className="text-sm text-foreground leading-relaxed">{notification.message}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/20 to-border/20 border border-border/30">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Thời gian</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(notification.createdAt).toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(onAccept || onReject) && (
          <div className="px-6 py-4 border-t mystical-border bg-gradient-to-r from-secondary/5 to-accent/5 flex justify-end gap-3">
            {onReject && (
              <button
                onClick={onReject}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-error/90 to-warning/90 hover:from-error hover:to-warning text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                style={{ boxShadow: '0 0 20px rgba(255, 107, 157, 0.3)' }}
              >
                <XCircle className="w-4 h-4" />
                {busy ? 'Đang xử lý...' : 'Từ chối'}
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-success/90 to-accent/90 hover:from-success hover:to-accent text-primary-foreground text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                style={{ boxShadow: '0 0 20px rgba(114, 233, 251, 0.4)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy ? 'Đang xử lý...' : 'Chấp nhận'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetailModal;
