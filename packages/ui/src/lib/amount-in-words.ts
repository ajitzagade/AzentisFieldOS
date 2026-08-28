// Indian-numbering amount-in-words (Crore/Lakh/Thousand), a presentation
// helper for AmountField: field-entry typos (an extra zero on a Payment)
// are caught by reading the words, the way every Indian cheque and invoice
// does it. Pure formatting — no rounding rules of its own beyond paise.
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]!;
  const ten = TENS[Math.floor(n / 10)]!;
  const one = n % 10;
  return one ? `${ten}-${ONES[one]!}` : ten;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ONES[hundred]!} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

function integerInWords(n: number): string {
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${integerInWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ");
}

// "" for anything unparseable/absurd, so a half-typed field shows nothing
// rather than nonsense. Negative amounts (signed correction deltas) read
// as "Minus …".
export function amountInWords(value: number | string): string {
  if (typeof value === "string" && value.trim() === "") return "";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1000000000000) return "";
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);
  const parts: string[] = [];
  if (rupees > 0 || paise === 0) {
    parts.push(`${integerInWords(rupees)} Rupee${rupees === 1 ? "" : "s"}`);
  }
  if (paise > 0) {
    parts.push(`${twoDigits(paise)} Paise`);
  }
  const words = parts.join(" and ");
  return `${n < 0 ? "Minus " : ""}${words}`;
}
