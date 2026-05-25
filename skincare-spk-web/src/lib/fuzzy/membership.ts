import type { FuzzyLabel } from "@/lib/types";

export function trapezoid(x: number, a: number, b: number, c: number, d: number): number {
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x >= a && x < b) return a === b ? 1 : (x - a) / (b - a);
  if (x > c && x <= d) return c === d ? 1 : (d - x) / (d - c);
  return 0;
}

export function triangle(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function inputMembership(label: FuzzyLabel, x: number): number {
  if (label === "low") return trapezoid(x, 0, 0, 2, 4);
  if (label === "medium") return triangle(x, 3, 5, 7);
  return trapezoid(x, 6, 8, 10, 10);
}

export function outputMembership(label: FuzzyLabel, x: number): number {
  if (label === "low") return trapezoid(x, 0, 0, 25, 45);
  if (label === "medium") return triangle(x, 35, 50, 65);
  return trapezoid(x, 55, 75, 100, 100);
}
