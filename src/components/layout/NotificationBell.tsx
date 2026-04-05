"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && unread > 0) markRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">
              {unread} unread
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-3 text-sm transition-colors",
                  !n.read && "bg-accent/40"
                )}
              >
                {n.href ? (
                  <Link href={n.href} className="block hover:opacity-80">
                    <p
                      className={cn(
                        "font-medium",
                        !n.read && "text-foreground"
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </Link>
                ) : (
                  <>
                    <p
                      className={cn(
                        "font-medium",
                        !n.read && "text-foreground"
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}