export function formatDate(date: Date): string {
  const now = new Date();
  const isSameYear = now.getFullYear() === date.getFullYear();

  if (isSameYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export const formatRelativeDate = formatDate;
