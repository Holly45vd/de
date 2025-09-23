export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
