import moment from 'moment';

export const getFirstDayOfTheMonth = (timestamp: number): number => {
  return moment.unix(timestamp).startOf('month').unix();
}

export const getDate30DaysBefore = (timestamp: number): number => {
  return moment.unix(timestamp).subtract(30, 'days').unix();
}

export const getFirstDayOfLastMonth = (timestamp: number): number => {
  return moment.unix(timestamp).startOf('month').subtract(1, 'months').unix();
}

export const getDaysOfTheMonth = (timestamp: number): number => {
  return moment.unix(timestamp).daysInMonth();
}