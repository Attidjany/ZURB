export interface MixRule {
  category: string;
  mid_end_pct: number;
  high_end_pct: number;
  outstanding_pct: number;
}

export interface CostParams {
  gold_usd_per_oz: number;
  grams_mid_end: number;
  grams_high_end: number;
  grams_outstanding: number;
}

export function constructionCostPerM2(category: string, mixRules: MixRule[], params: CostParams): number {
  const rule = mixRules.find((item) => item.category === category);
  if (!rule) {
    throw new Error(`Missing mix rule for category ${category}`);
  }

  const { mid_end_pct, high_end_pct, outstanding_pct } = rule;
  const totalGrams =
    params.grams_mid_end * mid_end_pct +
    params.grams_high_end * high_end_pct +
    params.grams_outstanding * outstanding_pct;

  const totalOunces = totalGrams / 31.1035;
  const costPerM2 = totalOunces * params.gold_usd_per_oz;
  return Math.round(costPerM2 * 100) / 100;
}
