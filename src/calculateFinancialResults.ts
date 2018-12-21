import { FinancialResult } from "./interfaces";

function calculateFinancialResults(input: FinancialResult[]): number {
  return input.reduce((carry: number, current: FinancialResult) => {
    Object.values(current).forEach((entry: { [key: string]: string }) => {
      Object.values(entry).forEach((value: string) => {
        const floatValue = Number.parseFloat(value);
        if (!isNaN(floatValue)) {
          carry += floatValue;
        }
      });
    });
    return carry;
  }, 0);
}

export default calculateFinancialResults;
