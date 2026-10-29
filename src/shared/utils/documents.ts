import { onlyDigits } from './masks';

const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function hasOnlyOneDistinctDigit(digits: string): boolean {
  return new Set(digits).size === 1;
}

function cpfCheckDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i += 1) {
    sum += Number(digits[i]) * (length + 1 - i);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

function cnpjCheckDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((total, weight, i) => total + Number(digits[i]) * weight, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Same rule the API applies, so a typo is caught before the request goes out. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== CPF_LENGTH || hasOnlyOneDistinctDigit(digits)) {
    return false;
  }

  return (
    cpfCheckDigit(digits, 9) === Number(digits[9]) &&
    cpfCheckDigit(digits, 10) === Number(digits[10])
  );
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== CNPJ_LENGTH || hasOnlyOneDistinctDigit(digits)) {
    return false;
  }

  return (
    cnpjCheckDigit(digits, CNPJ_FIRST_WEIGHTS) === Number(digits[12]) &&
    cnpjCheckDigit(digits, CNPJ_SECOND_WEIGHTS) === Number(digits[13])
  );
}

export function isValidDocument(value: string): boolean {
  return isValidCpf(value) || isValidCnpj(value);
}
