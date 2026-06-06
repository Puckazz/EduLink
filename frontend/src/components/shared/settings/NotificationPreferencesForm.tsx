'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MeService } from '@/services/me.service';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface NotifPreferenceConfig {
  key: string;
  label: string;
  description: string;
  defaultValue?: boolean;
}

interface NotificationPreferencesFormProps {
  configs: NotifPreferenceConfig[];
}

/** Row: label + description trái, switch phải */
function NotifRow({
  config,
  checked,
  onCheckedChange,
}: {
  config: NotifPreferenceConfig;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border py-4 last:border-0">
      <div className="flex items-start gap-6 flex-1 min-w-0">
        <div className="w-40 shrink-0 pt-0.5">
          <Label
            htmlFor={`notif-${config.key}`}
            className="text-sm font-medium text-muted-foreground cursor-pointer"
          >
            {config.label}
          </Label>
        </div>
        <p className="flex-1 text-sm text-foreground">{config.description}</p>
      </div>
      <Switch
        id={`notif-${config.key}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  );
}

export function NotificationPreferencesForm({ configs }: NotificationPreferencesFormProps) {
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentUser();
  const preferenceScope = profile
    ? `${profile.role}:${
        profile.role === 'admin'
          ? profile.admin_id
          : profile.role === 'parent'
            ? profile.parent_id
            : profile.teacher_id
      }`
    : undefined;
  const preferenceQueryKey = ['preferences', preferenceScope] as const;

  const { data: savedPrefs, isPending: isLoading } = useQuery({
    queryKey: preferenceQueryKey,
    queryFn: () => MeService.getPreferences(),
    enabled: !!preferenceScope,
  });

  const [localPrefs, setLocalPrefs] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    configs.forEach((c) => {
      if (savedPrefs && c.key in savedPrefs) {
        initial[c.key] = savedPrefs[c.key] === 'true';
      } else {
        initial[c.key] = c.defaultValue ?? true;
      }
    });
    setLocalPrefs(initial);
    setIsDirty(false);
  }, [savedPrefs, configs]);

  const { mutate: savePrefs, isPending: isSaving } = useMutation({
    mutationFn: () =>
      MeService.upsertPreferences(
        Object.entries(localPrefs).map(([key, val]) => ({ key, value: String(val) })),
      ),
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(preferenceQueryKey, updatedPrefs);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-inbox'] });
      setIsDirty(false);
      toast.success('Đã lưu cài đặt thông báo.');
    },
    onError: () => {
      toast.error('Lưu cài đặt thất bại. Vui lòng thử lại.');
    },
  });

  function handleToggle(key: string, checked: boolean) {
    setLocalPrefs((prev) => ({ ...prev, [key]: checked }));
    setIsDirty(true);
  }

  function handleCancel() {
    const reset: Record<string, boolean> = {};
    configs.forEach((c) => {
      if (savedPrefs && c.key in savedPrefs) {
        reset[c.key] = savedPrefs[c.key] === 'true';
      } else {
        reset[c.key] = c.defaultValue ?? true;
      }
    });
    setLocalPrefs(reset);
    setIsDirty(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Section header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-8 py-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Cài đặt thông báo</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Chọn loại thông báo bạn muốn nhận.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={isSaving || !isDirty}
            onClick={handleCancel}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={() => savePrefs()}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </div>

      {/* ── Toggle rows ── */}
      <div className="px-8 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          configs.map((config) => (
            <NotifRow
              key={config.key}
              config={config}
              checked={localPrefs[config.key] ?? (config.defaultValue ?? true)}
              onCheckedChange={(checked) => handleToggle(config.key, checked)}
            />
          ))
        )}
      </div>
    </div>
  );
}
