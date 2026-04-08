import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function UserAvatar({ username, color, size = 'md', showTooltip = true }) {
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  const sizeClasses = {
    sm: 'user-avatar--sm',
    md: 'user-avatar--md',
    lg: 'user-avatar--lg',
  };

  const avatar = (
    <div
      className={cn('user-avatar', sizeClasses[size])}
      style={{ backgroundColor: color || '#7c3aed' }}
    >
      {initial}
    </div>
  );

  if (!showTooltip) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent side="bottom" className="tooltip-dark">
        <p>{username}</p>
      </TooltipContent>
    </Tooltip>
  );
}
