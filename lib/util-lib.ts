import { Between } from 'typeorm';
import { subYears } from 'date-fns';
import { bool } from 'aws-sdk/clients/signer';

export function createGuid(): string {
  function s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export const BeforeDate = (date: Date) => Between(subYears(date, 100), date);

export function getMaxDate(): Date {
  return new Date(8640000000000000);
}

export function getMinDate(): Date {
  return new Date(-8640000000000000);
}

export function getNow() {
  return new Date();
}

export function enumToArray<T, G extends keyof T = keyof T>(enumeration: T): any {
  const enumValues = Object.values(enumeration);
  let keyValuePairs = [];
  const numberOfEnumValues = enumValues.length / 2;
  let i = numberOfEnumValues;
  while (i < enumValues.length) {
    keyValuePairs.push({ key: +enumValues[i], value: enumValues[i - numberOfEnumValues] });
    i++;
  }
  return keyValuePairs;
}
