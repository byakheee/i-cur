import {compareAsc, differenceInMinutes, format, isAfter, isBefore} from 'date-fns';
import {convertToTimeZone} from 'date-fns-timezone';
import {FullCalendar, parseICS} from 'ical';
import axios from 'axios';

type ICal = {
  start: Date;
  end: Date;
  summary: string;
};

const objectToArray = (data: FullCalendar): ICal[] => {
  const ret: ICal[] = [];
  for (const key in data) {
    const {start, end, summary} = data[key]
    if (start && end) {
      ret.push({
        start, end, summary: summary ? summary : ''
      });
    }
  }
  return ret;
};

const main = async (): Promise<void> => {
  const [, , arg1, arg2] = process.argv
  const year = parseInt(arg1);
  const month = parseInt(arg2);
  console.log(`${year}年${month}月の配信実績です`)
  const url =
    'https://calendar.google.com/calendar/ical/cl4764siatuphqvvsundhopai0%40group.calendar.google.com/public/basic.ics';
  const response = await axios.get(url);
  if (!response || !response.data || typeof response.data !== 'string') {
    throw new Error('invalid format of iCal');
  }
  const ical = response.data;
  const formatedICalInDec = objectToArray(parseICS(ical))
    .filter(c => isBefore(c.start, new Date(year, month)) && isAfter(c.start, new Date(year, month-1)))
    .sort((a, b) => compareAsc(a.start, b.start));
  const numOfDays = [
    ...new Set(
      formatedICalInDec
        .filter(c => 30 <= differenceInMinutes(c.end, c.start))
        // 朝4時基準なので +5:00 で日付を計算する
        .map(c => format(convertToTimeZone(c.start, {timeZone: 'Asia/Tashkent'}), 'd')),
    ),
  ].length;
  const mins = formatedICalInDec.map(c => differenceInMinutes(c.end, c.start)).reduce((prev, cur) => prev + cur);
  console.log(`配信日数：${numOfDays}日`);
  console.log(`累計配信時間：${Math.floor(mins / 60)}時間${mins % 60}分`);
};

main().then(
  () => {},
  e => console.error(e),
);
