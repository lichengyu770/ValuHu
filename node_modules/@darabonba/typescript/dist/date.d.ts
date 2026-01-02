import moment from 'moment';
export default class TeaDate {
    date: moment.Moment;
    constructor(date: moment.MomentInput);
    format(layout: string): string;
    unix(): number;
    sub(amount: moment.unitOfTime.Base, unit: number): TeaDate;
    add(amount: moment.unitOfTime.Base, unit: number): TeaDate;
    diff(amount: moment.unitOfTime.Base, diffDate: TeaDate): number;
    hour(): number;
    minute(): number;
    second(): number;
    month(): number;
    year(): number;
    dayOfMonth(): number;
    dayOfWeek(): number;
    weekOfMonth(): number;
    weekOfYear(): number;
}
