import { ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { EMatchType } from '@modules/badminton-session/constants/match.enum';

export function IsEqualParticipantesInTeams(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsEqualparticipantesInTeams',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const participantesCounts = teams.map((team) => team.participantes.length);
          const equalCounts = participantesCounts.every(
            (count) => count === participantesCounts[0],
          );
          return equalCounts;
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be equal to the number of participants in teams`;
        },
      },
    });
  };
}

export function IsUniqueParticipantesInTeams(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueParticipantesInTeams',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const participantes = teams.flatMap((team) => team.participantes.map((p) => p.memberId));
          const uniqueparticipantes = new Set(participantes);
          return uniqueparticipantes.size === participantes.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be unique participants in teams`;
        },
      },
    });
  };
}

export function IsCorrectNumberOfParticipantes(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsCorrectNumberOfParticipantes',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          const teams = args.object['teams'];
          const type = args.object['type'];
          const numberOfparticipantes =
            type === EMatchType.SINGLES ? 1 : type === EMatchType.DOUBLES ? 2 : 3;
          for (const team of teams) {
            if (team.participantes.length !== numberOfparticipantes) {
              return false;
            }
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const type = args.object['type'];
          const numberOfparticipantes =
            type === EMatchType.SINGLES ? 1 : type === EMatchType.DOUBLES ? 2 : 3;
          return `The number of participants in each team must be ${numberOfparticipantes} for a ${type} match`;
        },
      },
    });
  };
}
