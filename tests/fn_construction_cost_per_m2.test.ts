import { constructionCostPerM2 } from '@/lib/cost';

describe('constructionCostPerM2', () => {
  it('computes weighted gold cost per m²', () => {
    const value = constructionCostPerM2(
      'A',
      [
        { category: 'A', mid_end_pct: 0.8, high_end_pct: 0.2, outstanding_pct: 0 },
        { category: 'B', mid_end_pct: 0.6, high_end_pct: 0.4, outstanding_pct: 0 }
      ],
      {
        gold_usd_per_oz: 3000,
        grams_mid_end: 14.91,
        grams_high_end: 20.9,
        grams_outstanding: 26.9
      }
    );

    expect(value).toBeCloseTo(1553.32, 2);
  });

  it('throws when rule missing', () => {
    expect(() =>
      constructionCostPerM2(
        'Z',
        [{ category: 'A', mid_end_pct: 1, high_end_pct: 0, outstanding_pct: 0 }],
        {
          gold_usd_per_oz: 3000,
          grams_mid_end: 14.91,
          grams_high_end: 20.9,
          grams_outstanding: 26.9
        }
      )
    ).toThrow('Missing mix rule for category Z');
  });
});
