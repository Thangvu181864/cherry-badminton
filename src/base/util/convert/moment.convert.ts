import * as assert from 'assert';
import * as moment from 'moment';
import { Moment } from 'moment';

/*
  Format
 */
const DATE_TIME_FORMAT = {
  '-dmy': 'D-M-YYYY',
  '-ymd': 'YYYY-M-D',
  '/dmy': 'D/M/YYYY',
  '/mdy': 'M/D/YYYY',
  '/ymd': 'YYYY/M/D',

  '/mdyy': 'M/D/YY',
  '/dmyy': 'D/M/YY',
  '/yymd': 'YY/M/D',

  '-dmy hms': 'D-M-YYYY H:m:s',
  '-ymd hms': 'YYYY-M-D H:m:s',
  '/dmy hms': 'D/M/YYYY H:m:s',
  '/ymd hms': 'YYYY/M/D H:m:s',
  _ymd_hms: 'YYYY_M_D_H_m_s',
};

function replace(s: string): string {
  s = s.replace(/D/, 'DD');
  s = s.replace(/M/, 'MM');
  s = s.replace(/H/, 'HH');
  s = s.replace(/m/, 'mm');
  s = s.replace(/s/, 'ss');
  return s;
}

const DateTimeOutFormat = Object.fromEntries(
  Object.entries(DATE_TIME_FORMAT).map(([key, value]) => [key, replace(value)]),
);
const BaseFormat = {
  mm: 'moment',
  dt: 'datetime',
  tz: 'YYYY-MM-DDTHH:mm:ss',
};
const STR_OUT_FORMAT: Record<string, string> = {
  ...BaseFormat,
  ...DateTimeOutFormat,
};
const STR_IN_FORMAT: Record<string, string> = {
  ...BaseFormat,
  ...DATE_TIME_FORMAT,
};

function isValidFormat(inValue: Moment | string, inFormat: string): boolean {
  return (
    (inFormat === 'mm' && inValue instanceof moment) ||
    (typeof inValue === 'string' &&
      inValue.length > 0 &&
      Object.keys(STR_IN_FORMAT).includes(inFormat))
  );
}

export function convertFormat(
  inValue: Moment | string,
  inFormat: string,
  outFormat: string,
): string {
  assert(
    isValidFormat(inValue, inFormat) &&
      Object.keys(STR_OUT_FORMAT).includes(outFormat) &&
      outFormat !== 'mm',
    'Invalid input data',
  );

  const inDatetime: Moment =
    inValue instanceof moment
      ? moment(inValue) //
      : moment(inValue, STR_IN_FORMAT[inFormat], true);
  assert(inDatetime.isValid(), 'Invalid date');
  return inDatetime.format(STR_OUT_FORMAT[outFormat]);
}

/*
  Exchange
 */

/*
  Compute
 */
