import { ProfileAvatar } from "@/components/profile-avatar";

type HeaderActionsProps = {
  avatarUrl?: string | null;
  name?: string | null;
};

export function HeaderActions({ avatarUrl, name }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ProfileAvatar avatarUrl={avatarUrl} name={name} />
    </div>
  );
}
