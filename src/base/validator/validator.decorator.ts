import { ValidationArguments } from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsOnlyDate(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsOnlyDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be a valid date`;
        },
      },
    });
  };
}

export function IsAlphanumericUnderscore(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsAlphanumericUnderscore',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(propertyValue: string) {
          const regex = /^[a-zA-Z0-9_]*$/;
          return typeof propertyValue === 'string' && regex.test(propertyValue);
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be alphanumeric and underscore`;
        },
      },
    });
  };
}

export function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          return (
            typeof propertyValue === 'number' &&
            typeof args.object[args.constraints[0]] === 'number' &&
            propertyValue > args.object[args.constraints[0]]
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be greater than "${String(args.constraints[0])}"`;
        },
      },
    });
  };
}

export function IsGreaterThanOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsGreaterThanOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          return (
            typeof propertyValue === 'number' &&
            typeof args.object[args.constraints[0]] === 'number' &&
            propertyValue >= args.object[args.constraints[0]]
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be greater than or equal to "${String(
            args.constraints[0],
          )}"`;
        },
      },
    });
  };
}

export function IsAfterNow(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsAfterNow',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(propertyValue: string | Date, args: ValidationArguments) {
          const date = moment(propertyValue);
          return date.isValid() && date.isAfter(moment(), args.constraints[0]);
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be same or after now`;
        },
      },
    });
  };
}

export function IsLaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsLaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(propertyValue: string | Date, args: ValidationArguments) {
          const date = args.object[args.constraints[0]];
          const fromDate = moment(date, true);
          const toDate = moment(propertyValue, true);
          return fromDate.isValid() && toDate.isValid() && toDate.isAfter(fromDate);
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be later than "${String(args.constraints[0])}"`;
        },
      },
    });
  };
}

export function IsLaterThanProperty(
  property: string,
  dateNumber: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsLaterThanProperty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, dateNumber],
      options: validationOptions,
      validator: {
        validate(propertyValue: string | Date, args: ValidationArguments) {
          const date = args.object[args.constraints[0]];
          return (
            moment(date, true).isValid() &&
            moment(propertyValue, true).isValid() &&
            moment(propertyValue).isAfter(moment(date).add(args.constraints[1], 'days'))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be later than "${String(
            args.constraints[1],
          )}" days after "${String(args.constraints[0])}`;
        },
      },
    });
  };
}

export function IsAllowedEmail(allowedEmails: string[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsAllowedEmail',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedEmails],
      options: validationOptions,
      validator: {
        validate(propertyValue: string, args: ValidationArguments) {
          const allowedEmailsPattern = args.constraints[0].join('|');
          const regex = new RegExp(`^(.+)@(${allowedEmailsPattern})$`, 'i');
          return typeof propertyValue === 'string' && regex.test(propertyValue);
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be one of the following: ${args.constraints[0].join(
            ', ',
          )}`;
        },
      },
    });
  };
}
