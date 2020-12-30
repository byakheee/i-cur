import {fromURL, FullCalendar} from 'ical';

const parseiCalFrom = (url: string): Promise<FullCalendar> =>
  new Promise((resolve, reject) => {
    // iCal の仕様なので
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromURL(url, {}, (error: any, data: FullCalendar) => {
      console.log('in callback');
      if (error) {
        return reject(error);
      }
      resolve(data);
    });
  });

const main = async (): Promise<void> => {
  const url =
    'https://calendar.google.com/calendar/ical/cl4764siatuphqvvsundhopai0%40group.calendar.google.com/public/basic.ics';
  const ical = await parseiCalFrom(url);
  for (const plan in ical) {
    console.log(ical[plan]);
  }
};

main().then(
  () => {},
  e => console.error(e),
);
