import * as lodash from 'lodash';

export function unidecode(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function slugify(str = '') {
  return unidecode(str).toLowerCase().split(' ').join('_');
}

export function uppercaseFirstLetter(str = '') {
  const result = [];
  const format = str.trim().toLocaleLowerCase().split(' ');
  for (const c of format) if (c) result.push(lodash.capitalize(c).replace(/ /g, ''));
  return result.join(' ');
}

export function removeAccents(str: string) {
  const rawStr = uppercaseFirstLetter(str);
  return unidecode(rawStr);
}

export function isSpecialCharacter(str: string) {
  const format = /[!`~#$%^&*()?'':{}|<>]/g;
  return format.test(str);
}
