import { compareAsc, differenceInMinutes, format, isAfter, isBefore } from 'date-fns';
import { convertToTimeZone } from 'date-fns-timezone';
import { FullCalendar, parseICS } from 'ical';
import axios from 'axios';

type ICal = {
  start: Date;
  end: Date;
  summary: string;
};

type Report = {
  year: number;
  month: number;
  numOfDays: number;
  minsOfMonth: number;
}

const convertICalFrom = (data: FullCalendar): ICal[] => {
  const ret: ICal[] = [];
  for (const key in data) {
    const { start, end, summary } = data[key]
    if (start && end) {
      ret.push({
        start, end, summary: summary ? summary : ''
      });
    }
  }
  return ret;
};

const genMonthlyReport = (year: number, month: number, iCal: ICal[]): Report => {
  const formatedICal = iCal
    .filter(c => isBefore(c.start, new Date(year, month)) && isAfter(c.start, new Date(year, month - 1)))
    .sort((a, b) => compareAsc(a.start, b.start));
  if (formatedICal.length === 0) throw new Error("No data exist.");
  
  const numOfDays = [
    ...new Set(
      formatedICal
        .filter(c => 30 <= differenceInMinutes(c.end, c.start))
        // 朝4時基準なので +5:00 で日付を計算する
        .map(c => format(convertToTimeZone(c.start, { timeZone: 'Asia/Tashkent' }), 'd')),
    ),
  ].length;
  const minsOfMonth = formatedICal.map(c => differenceInMinutes(c.end, c.start)).reduce((prev, cur) => prev + cur);
  return { year, month, numOfDays, minsOfMonth }
}

const main = async (): Promise<void> => {
  const [, , url, arg1, arg2] = process.argv
  const year = parseInt(arg1);
  const month = parseInt(arg2);
  console.log(`${year}年${month}月の配信実績です`);

  const response = await axios.get(url);
  if (!response || !response.data || typeof response.data !== 'string') {
    throw new Error('invalid format of iCal');
  }

  const ical = response.data;
  const report = genMonthlyReport(year, month, convertICalFrom(parseICS(ical)));

  console.log(`配信日数：${report.numOfDays}日`);
  console.log(`累計配信時間：${Math.floor(report.minsOfMonth / 60)}時間${report.minsOfMonth % 60}分`);
};

main().then(
  () => { },
  e => console.error(e),
);
