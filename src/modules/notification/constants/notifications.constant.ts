export enum NOTIFICATION_PLATFORM {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

export enum RelatedDataType {
  USER = 'user',
}

export const DATA_ID_TYPE = {
  [RelatedDataType.USER]: 'number',
};
