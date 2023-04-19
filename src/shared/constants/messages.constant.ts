// 01**** VALIDATE
// 02**** DATABASE
// 03**** BASE API
// 0001** CUSTOM APP API
// 0002** CUSTOM APP SERVICE
const AUTH = {
  UNAUTHORIZED: 'AUTH000101',
  REQUIRE_LOGIN: 'AUTH000102',
};
const USER = {};

export const ERROR_CODES = {
  AUTH,
  USER,
};
export const ERROR_MESSAGES: Record<string, string> = {
  [AUTH.UNAUTHORIZED]: 'Unauthorized account',
  [AUTH.REQUIRE_LOGIN]: 'Required login',
};
