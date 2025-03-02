import { getCryptoPrices, getCryptoHistory } from '../coinCapService';

global.fetch = jest.fn();

describe('coinCapService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCryptoPrices', () => {
    const mockExchangeRates = {
      rates: { EUR: 0.85, GBP: 0.73 }
    };

    const mockCryptoData = {
      data: [{
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        priceUsd: '50000',
        marketCapUsd: '1000000000000',
        changePercent24Hr: '2.5'
      }]
    };

    it('fetches and formats crypto prices correctly', async () => {
      (fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCryptoData)
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExchangeRates)
        }));

      const result = await getCryptoPrices(['bitcoin']);

      expect(result.bitcoin).toBeDefined();
      expect(result.bitcoin.usd).toBe(50000);
      expect(result.bitcoin.eur).toBe(50000 * 0.85);
      expect(result.bitcoin.gbp).toBe(50000 * 0.73);
      expect(result.bitcoin.usd_24h_change).toBe(2.5);
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: false
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExchangeRates)
        }));

      await expect(getCryptoPrices(['bitcoin'])).rejects.toThrow('Network response was not ok');
    });
  });

  describe('getCryptoHistory', () => {
    const mockHistoryData = {
      data: [
        { time: 1234567890000, priceUsd: '45000' },
        { time: 1234567890001, priceUsd: '46000' }
      ]
    };

    const mockExchangeRates = {
      rates: { EUR: 0.85, GBP: 0.73 }
    };

    it('fetches and formats price history correctly', async () => {
      (fetch as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExchangeRates)
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistoryData)
        }));

      const result = await getCryptoHistory(['bitcoin'], 'eur', 1);

      expect(result.bitcoin).toBeDefined();
      expect(result.bitcoin).toHaveLength(2);
      expect(result.bitcoin[0][1]).toBe(45000 * 0.85);
      expect(result.bitcoin[1][1]).toBe(46000 * 0.85);
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExchangeRates)
      })).mockImplementationOnce(() => Promise.resolve({
        ok: false
      }));

      await expect(getCryptoHistory(['bitcoin'], 'usd', 1)).rejects.toThrow('Network response was not ok');
    });
  });
});