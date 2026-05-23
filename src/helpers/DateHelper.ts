export class DateHelper {
  static format(date: Date, fmt: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    if (fmt === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }

    if (fmt === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    }

    return `${day}/${month}/${year}`;
  }

  static getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return DateHelper.format(date, 'YYYY-MM-DD');
  }

  static getPastDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return DateHelper.format(date, 'YYYY-MM-DD');
  }

  static today(): string {
    return DateHelper.format(new Date(), 'YYYY-MM-DD');
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  static getNextWorkingDay(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    while (DateHelper.isWeekend(date)) {
      date.setDate(date.getDate() + 1);
    }

    return DateHelper.format(date, 'YYYY-MM-DD');
  }
}
