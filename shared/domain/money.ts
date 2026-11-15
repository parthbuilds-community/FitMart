import { z } from "zod";

/**
 * Money is an integer amount in minor units (paise for INR).
 *
 * It is branded so a plain `number` cannot be passed where money is expected.
 * Construct values with `asMoney` or `rupeesToMinor`; never do arithmetic on a
 * raw float and cast it afterwards.
 */
declare const moneyBrand: unique symbol;

export type Money = number & { readonly [moneyBrand]: "Money" };

/** Boundary schema: any integer minor-unit amount accepted from a validated source. */
export const moneySchema = z.number().int().nonnegative();

export function asMoney(value: number): Money {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(
      `Money must be a non-negative integer in minor units, received ${String(value)}`,
    );
  }
  return value as Money;
}

export function rupeesToMinor(rupees: number): Money {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new RangeError(`Rupees must be a non-negative finite number, received ${String(rupees)}`);
  }
  return asMoney(Math.round(rupees * 100));
}

export function minorToRupees(minor: Money): number {
  return minor / 100;
}

export function addMoney(...amounts: Money[]): Money {
  return asMoney(amounts.reduce((total, amount) => total + amount, 0));
}

export function multiplyMoney(unitPrice: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`Quantity must be a non-negative integer, received ${String(quantity)}`);
  }
  return asMoney(unitPrice * quantity);
}

export function formatMoney(minor: Money, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(minorToRupees(minor));
}
