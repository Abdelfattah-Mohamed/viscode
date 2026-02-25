// 10 selectable avatars (emoji). avatarId 1-10.
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
];

export function getAvatarEmoji(avatarId) {
  const a = AVATARS.find((x) => x.id === avatarId);
  return a ? a.emoji : AVATARS[0].emoji;
}
