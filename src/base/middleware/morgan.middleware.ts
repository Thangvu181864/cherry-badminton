import * as morgan from 'morgan';

morgan.token('user', (req) => {
  if (req.user) return req.user.email;
  return 'Anonymous';
});

morgan.format('custom', (tokens, req, res) => {
  // tokens['remote-addr-cus'] = () => tokens['remote-addr'](req).padStart(29, ' ').substr(0, 29);
  // const frm = `ACCESS :date[iso] :remote-addr-cus | :user :method :url :status - :response-time ms`;
  const frm = `:remote-addr :user :method :url :status - :response-time ms`;
  const fn = morgan.compile(frm);
  return fn(tokens, req, res);
});

export function useMorgan(logger) {
  return morgan('custom', {
    stream: logger,
  });
}
