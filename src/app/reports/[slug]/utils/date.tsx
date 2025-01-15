import dayjs from 'dayjs';

export function getDateBucket(dateString: string) {
  // Check for day format 'MMM D YYYY' (e.g., 'Aug 4 2024')
  const isDay = dayjs(dateString, 'MMM D YYYY', true).isValid();
  if (isDay) return 'day';

  // Check for week format 'MMM DD - DD' (e.g., 'Sep 09 - 15')
  const weekPattern = /^[A-Za-z]{3} \d{2} - \d{2}$/; // Pattern for 'MMM DD - DD'
  const altWeekPattern1 = /^[A-Za-z]{3} \d{1} - \d{1}$/; // Pattern for 'MMM D - D'
  const altWeekPattern2 = /^[A-Za-z]{3} \d{1} - \d{2}$/; // Pattern for 'MMM D - DD'
  if (
    weekPattern.test(dateString) ||
    altWeekPattern1.test(dateString) ||
    altWeekPattern2.test(dateString)
  ) {
    const [start, end] = dateString
      .split(' - ')
      .map((date, index) =>
        index === 0
          ? weekPattern.test(dateString)
            ? dayjs(date, 'MMM DD', true)
            : dayjs(date, 'MMM D', true)
          : altWeekPattern1.test(dateString)
            ? dayjs(date, 'D', true)
            : dayjs(date, 'DD', true),
      );

    if (
      start.isValid() &&
      end.isValid() /*&& end.date() - start.date() === 6*/
    ) {
      // causes issues
      return 'week';
    }
  }

  // Check for month format 'MMM YYYY' (e.g., 'Aug 2024')
  const isMonth = dayjs(dateString, 'MMM YYYY', true).isValid();
  if (isMonth) return 'month';

  // If none of the formats match, return 'invalid'
  return 'invalid';
}
