function normalizeAmountString(amount: string): string {
  const cleanAmount: string = amount.replace(/[^0-9.-]+/g,"");
  return Number.parseFloat(cleanAmount).toFixed(2);
}

export default normalizeAmountString;
