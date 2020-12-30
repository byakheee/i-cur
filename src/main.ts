import {compareAsc, differenceInSeconds, format, isAfter, isBefore} from 'date-fns';
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
    if (!data[key].start || !data[key].end) {
      // for non-null-assertion
      continue;
    }
    ret.push({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      start: data[key].start!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      end: data[key].end!,
      // FIXME: no need `!`
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      summary: data[key].summary ? data[key].summary! : '',
    });
  }
  return ret;
};

const main = async (): Promise<void> => {
  const url =
    'https://calendar.google.com/calendar/ical/cl4764siatuphqvvsundhopai0%40group.calendar.google.com/public/basic.ics';
  const response = await axios.get(url);
  if (!response || !response.data || typeof response.data !== 'string') {
    throw new Error('invalid format of iCal');
  }
  const ical = response.data;
  const formatedICalInDec = objectToArray(parseICS(ical))
    .filter(c => isBefore(c.start, new Date(2021, 0)) && isAfter(c.start, new Date(2020, 11)))
    .sort((a, b) => compareAsc(a.start, b.start));
  const numOfDays = [...new Set(formatedICalInDec.map(c => format(c.start, 'd')))].length;
  // console.log(JSON.stringify(formatedICalInDec));
  // eslint-disable-next-line no-irregular-whitespace
  console.log(`配信日数　　：${numOfDays}日`);
  console.log(`累計配信分数：${differenceInSeconds(formatedICalInDec[0].end, formatedICalInDec[0].start)}日`);
  console.log(
    `累計配信分数：${formatedICalInDec
      .map(c => differenceInSeconds(c.end, c.start))
      .reduce((prev, cur) => prev + cur)}分`,
  );
};

main().then(
  () => {},
  e => console.error(e),
);
