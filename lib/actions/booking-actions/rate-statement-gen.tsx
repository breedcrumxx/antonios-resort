export const rateStatementGenerator = (avg: number) => {

  if (avg == 5.0) {
    return "Satisfactory"
  } else if (avg >= 4.0) {
    return "Moderate"
  } else if (avg >= 3.0) {
    return "Average"
  } else if (avg >= 2.0) {
    return "Acceptable"
  } else if (avg < 2.0) {
    return "Fair"
  }

}