import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NotificationService } from '@/services/notification.service';
import type { AuthProfile } from '@/types/auth';
import type { Notification } from '@/types/notification';

export function getNotificationScope(profile?: AuthProfile) {
  if (!profile) return undefined;
  if (profile.role === 'admin') return `admin:${profile.admin_id}`;
  if (profile.role === 'parent') return `parent:${profile.parent_id}`;
  return `teacher:${profile.teacher_id}`;
}

export function useNotificationInbox(limit = 20) {
  const { data: profile } = useCurrentUser();
  const notificationScope = getNotificationScope(profile);

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', 'inbox', notificationScope, limit],
    queryFn: async () => {
      if (profile?.role === 'admin') {
        return NotificationService.getInbox();
      }
      return NotificationService.getMyNotifications(limit);
    },
    enabled: !!profile,
    refetchInterval: 30_000,
  });

  return { ...query, profile, notificationScope };
}
