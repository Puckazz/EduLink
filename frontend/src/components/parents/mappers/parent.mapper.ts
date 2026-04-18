import type { Parent } from '@/types/parent';
import type { CreateParentDto, UpdateParentDto } from '@/types/parent';
import type { ParentFormValues } from '@/components/parents/utils/parent-form.schema';

const AVATAR_STYLES = [
  'bg-blue-200 text-blue-800',
  'bg-emerald-200 text-emerald-800',
  'bg-amber-200 text-amber-800',
  'bg-violet-200 text-violet-800',
  'bg-rose-200 text-rose-800',
];

const RELATIONSHIP_LABEL: Record<
  Parent['relationship'],
  'Cha' | 'Mẹ' | 'Người giám hộ'
> = {
  CHA: 'Cha',
  ME: 'Mẹ',
  NGUOI_GIAM_HO: 'Người giám hộ',
};

export interface ParentTableRow {
  id: string;
  displayId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarInitials: string;
  avatarBg: string;
  linkedStudentText: string;
  relationshipLabel: 'Cha' | 'Mẹ' | 'Người giám hộ';
  isActive: boolean;
  statusLabel: 'Đã kích hoạt' | 'Chưa kích hoạt';
  raw: Parent;
}

function normalizeOptionalString(value: string): string | undefined {
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

function getAvatarInitials(fullName: string): string {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) {
    return '--';
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
}

function getAvatarStyle(parentId: number): string {
  return AVATAR_STYLES[parentId % AVATAR_STYLES.length];
}

function formatParentId(parentId: number): string {
  return `#PR${String(parentId).padStart(5, '0')}`;
}

export function mapParentToTableRow(parent: Parent): ParentTableRow {
  return {
    id: String(parent.parent_id),
    displayId: formatParentId(parent.parent_id),
    fullName: parent.full_name,
    phone: parent.phone,
    email: parent.email ?? '-',
    avatarInitials: getAvatarInitials(parent.full_name),
    avatarBg: getAvatarStyle(parent.parent_id),
    linkedStudentText: 'Xem chi tiết',
    relationshipLabel: RELATIONSHIP_LABEL[parent.relationship],
    isActive: parent.is_active,
    statusLabel: parent.is_active ? 'Đã kích hoạt' : 'Chưa kích hoạt',
    raw: parent,
  };
}

export function mapParentFormToCreateDto(
  values: ParentFormValues,
): CreateParentDto {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    email: normalizeOptionalString(values.email),
    username: normalizeOptionalString(values.username),
    password: normalizeOptionalString(values.password),
    relationship: values.relationship,
  };
}

export function mapParentFormToUpdateDto(
  values: ParentFormValues,
): UpdateParentDto {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    email: normalizeOptionalString(values.email),
    username: normalizeOptionalString(values.username),
    password: normalizeOptionalString(values.password),
    relationship: values.relationship,
  };
}
