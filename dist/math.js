export const defaults = { price:799, cost:350, discount:10, shipping:60, packaging:15, fee:8, fixed:0, target:25 };
export function calculate(values) {
  for (const key of Object.keys(defaults)) {
    if (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 1e9) throw new Error('Enter valid, non-negative amounts.');
  }
  if (values.discount > 100 || values.fee >= 100 || values.target >= 100) throw new Error('Discount must be 0–100%; platform fee and target margin must be below 100%.');
  const retention = 1-values.discount/100;
  const revenue = values.price*retention;
  const platformFee = revenue*values.fee/100 + values.fixed;
  const baseCost = values.cost + values.shipping + values.packaging + values.fixed;
  const costs = baseCost + revenue*values.fee/100;
  const profit = revenue-costs;
  const margin = revenue>0 ? profit/revenue*100 : null;
  const breakEven = retention>0 ? baseCost/(retention*(1-values.fee/100)) : null;
  const targetFactor = retention*(1-(values.fee+values.target)/100);
  const suggested = targetFactor>0 ? baseCost/targetFactor : null;
  return {revenue,platformFee,costs,profit,margin,breakEven,suggested};
}
