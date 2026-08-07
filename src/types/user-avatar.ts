export type UserAvatarSize = 'sm' | 'md' | 'lg';

export interface UserAvatarProps {
  initials: string;
  size?: UserAvatarSize;
  /** Accessible label for the avatar. */
  alt?: string;
  /** Optional photo URL — when present, replaces the initials. */
  src?: string;
}
