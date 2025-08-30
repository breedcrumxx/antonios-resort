export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const getStartAndEndDate = (filter: string): { startDate: Date, endDate: Date } => {
  const monthIndex = months.indexOf(filter);
  const currentYear = new Date().getFullYear();

  // Set the start date to the first day of the month at midnight UTC
  const startDate = new Date(Date.UTC(currentYear, monthIndex, 1, 0, 0, 0));

  // Set the end date to the last day of the month at 23:59:59.999 UTC
  const endDate = new Date(Date.UTC(currentYear, monthIndex + 1, 0, 23, 59));

  return { startDate, endDate }
}