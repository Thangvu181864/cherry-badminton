import * as moment from 'moment';
import { slugify } from '@base/util/convert';

export const uniqueFileName = (filename: string) => {
  return `${moment(Date.now()).format('YYYYMMDDHHmmss')}_${Math.random()
    .toString(36)
    .substring(2)}_${slugify(filename)}`;
};
