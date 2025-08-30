
export const getWeekRange = (date: Date) => {

  // Calculate the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();

  // Calculate the difference from Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  // Calculate Monday and Sunday dates
  const monday = new Date(new Date(date).setHours(0, 0, 0, 0));
  monday.setDate(date.getDate() + diffToMonday);

  const sunday = new Date(new Date(date).setHours(23, 59, 29));
  sunday.setDate(date.getDate() + diffToSunday);

  return { monday, sunday };
}