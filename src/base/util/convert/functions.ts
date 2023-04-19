import * as _ from 'lodash/fp';

export const addKeyPrefix = (prefix: string) =>
  _.flow(
    _.toPairs,
    _.map(([key, value]: [string, any]) => [prefix + key, value]),
    _.fromPairs,
  );

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const randomChar = () => String.fromCharCode(random(33, 126));

export const randomString = (stringLength: number) => {
  let randomString = '';
  while (stringLength--) randomString += randomChar();
  return randomString;
};

export const randomAlphabet = (stringLength: number) => {
  let randomString = '';

  const rd = () => {
    let rd = random(65, 122);
    if (90 < rd && rd < 97) rd += 10;
    return rd;
  };

  while (stringLength--) randomString += String.fromCharCode(rd());
  return randomString;
};
