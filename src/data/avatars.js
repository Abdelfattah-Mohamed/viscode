// Selectable avatars (emoji). Keep IDs contiguous starting from 1.
export const AVATARS = [
  { id: 1, emoji: "🦊" },
  { id: 2, emoji: "🐱" },
  { id: 3, emoji: "🐶" },
  { id: 4, emoji: "🦁" },
  { id: 5, emoji: "🐻" },
  { id: 6, emoji: "🐼" },
  { id: 7, emoji: "🦄" },
  { id: 8, emoji: "🐨" },
  { id: 9, emoji: "🐯" },
  { id: 10, emoji: "🐸" },
  { id: 11, emoji: "🐵" },
  { id: 12, emoji: "🐹" },
  { id: 13, emoji: "🐰" },
  { id: 14, emoji: "🦉" },
  { id: 15, emoji: "🐙" },
  { id: 16, emoji: "🐧" },
  { id: 17, emoji: "🦖" },
  { id: 18, emoji: "🐺" },
  { id: 19, emoji: "🦋" },
  { id: 20, emoji: "🐬" },
];

export function isValidAvatarId(avatarId) {
  return Number.isInteger(avatarId) && avatarId >= 1 && avatarId <= AVATARS.length;
}

export function getAvatarEmoji(avatarId) {
  const a = AVATARS.find((x) => x.id === avatarId);
  return a ? a.emoji : AVATARS[0].emoji;
}
