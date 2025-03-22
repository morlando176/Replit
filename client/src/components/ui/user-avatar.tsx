import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  className?: string;
}

export default function UserAvatar({ name, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary-100 text-primary-600 font-bold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
