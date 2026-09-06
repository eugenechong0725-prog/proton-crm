export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeMalaysiaPhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let digits = digitsOnly(raw);

  if (digits.startsWith("60")) {
    // already has country code
  } else if (digits.startsWith("0")) {
    digits = `60${digits.slice(1)}`;
  } else if (digits.startsWith("1") && digits.length >= 9 && digits.length <= 10) {
    digits = `60${digits}`;
  } else {
    return null;
  }

  if (!/^601\d{8,9}$/.test(digits)) return null;
  return digits;
}

export function formatMalaysiaPhone(input: string): string {
  const normalized = normalizeMalaysiaPhone(input);
  if (!normalized) return input.trim();

  const local = `0${normalized.slice(2)}`;
  if (local.length === 10) {
    return `${local.slice(0, 3)}-${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (local.length === 11) {
    return `${local.slice(0, 3)}-${local.slice(3, 7)} ${local.slice(7)}`;
  }
  return local;
}

export function whatsappUrl(phone: string, message?: string): string | null {
  const normalized = normalizeMalaysiaPhone(phone);
  if (!normalized) return null;

  const base = `https://wa.me/${normalized}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
