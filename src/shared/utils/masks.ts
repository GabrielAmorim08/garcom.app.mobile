export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/** One field for both logins: up to 11 digits reads as a CPF, anything longer as a CNPJ. */
export function maskDocument(value: string): string {
  return onlyDigits(value).length > 11 ? maskCnpj(value) : maskCpf(value);
}

export function maskVerificationCode(value: string): string {
  return onlyDigits(value).slice(0, 6);
}
