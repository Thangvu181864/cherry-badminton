import { ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { EMatchType } from '@modules/badminton-session/constants/match.enum';

export function IsEqualParticipatesInTeams(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsEqualParticipatesInTeams',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const participatesCounts = teams.map((team) => team.participates.length);
          const equalCounts = participatesCounts.every((count) => count === participatesCounts[0]);
          return equalCounts;
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be equal to the number of participates in teams`;
        },
      },
    });
  };
}

export function IsUniqueParticipatesInTeams(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueParticipatesInTeams',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const participates = teams.flatMap((team) => team.participates);
          const uniqueParticipates = new Set(participates);
          return uniqueParticipates.size === participates.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be unique participates in teams`;
        },
      },
    });
  };
}

export function IsCorrectNumberOfParticipates(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsCorrectNumberOfParticipates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const type = args.object['type'];
          const numberOfParticipates =
            type === EMatchType.SINGLES ? 1 : type === EMatchType.DOUBLES ? 2 : 3;
          for (const team of teams) {
            if (team.participates.length !== numberOfParticipates) {
              return false;
            }
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const type = args.object['type'];
          const numberOfParticipates =
            type === EMatchType.SINGLES ? 1 : type === EMatchType.DOUBLES ? 2 : 3;
          return `The number of participates in each team must be ${numberOfParticipates} for a ${type} match`;
        },
      },
    });
  };
}
