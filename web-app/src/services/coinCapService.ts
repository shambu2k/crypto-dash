const COINCAP_API = 'https://api.coincap.io/v2';

const CRYPTO_ID_MAP: { [key: string]: string } = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'ripple': 'xrp',
  'cardano': 'cardano',
  'solana': 'solana'
};

export interface CryptoAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface CryptoPrice {
  [cryptoId: string]: {
    [currency: string]: number;
    usd_market_cap: number;
    eur_market_cap: number;
    gbp_market_cap: number;
    usd_24h_change: number;
    eur_24h_change: number;
    gbp_24h_change: number;
    last_updated_at: number;
  };
}

export interface ChartData {
  [key: string]: [number, number][];
}

interface CoinCapResponse<T> {
  data: T;
  timestamp: number;
}

const convertCurrency = (priceUsd: string, rate: number): number => {
  return parseFloat(priceUsd) * rate;
};

const getExchangeRates = async (): Promise<{ [key: string]: number }> => {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!response.ok) throw new Error('Failed to fetch exchange rates');
  const data = await response.json();
  return {
    usd: 1,
    eur: data.rates.EUR,
    gbp: data.rates.GBP
  };
};

export const getCryptoPrices = async (cryptoIds: string[]): Promise<CryptoPrice> => {
  const mappedIds = cryptoIds.map(id => CRYPTO_ID_MAP[id]).join(',');
  const [assetsResponse, ratesResponse] = await Promise.all([
    fetch(`${COINCAP_API}/assets?ids=${mappedIds}`),
    getExchangeRates()
  ]);

  if (!assetsResponse.ok) {
    throw new Error('Network response was not ok');
  }

  const { data: assets } = await assetsResponse.json() as CoinCapResponse<CryptoAsset[]>;
  const rates = ratesResponse;

  return assets.reduce((acc, asset) => {
    const priceUsd = parseFloat(asset.priceUsd);
    const marketCapUsd = parseFloat(asset.marketCapUsd);
    const changePercent24Hr = parseFloat(asset.changePercent24Hr);

    acc[asset.id] = {
      usd: priceUsd,
      eur: convertCurrency(asset.priceUsd, rates.eur),
      gbp: convertCurrency(asset.priceUsd, rates.gbp),
      usd_market_cap: marketCapUsd,
      eur_market_cap: marketCapUsd * rates.eur,
      gbp_market_cap: marketCapUsd * rates.gbp,
      usd_24h_change: changePercent24Hr,
      eur_24h_change: changePercent24Hr,
      gbp_24h_change: changePercent24Hr,
      last_updated_at: Date.now()
    };
    return acc;
  }, {} as CryptoPrice);
};

export const getCryptoHistory = async (cryptoIds: string[], currency: string, days: number): Promise<ChartData> => {
  const interval = days <= 1 ? 'm5' : 'h2';
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startTime = start.getTime();
  const endTime = Date.now();

  const rates = await getExchangeRates();
  const rate = rates[currency.toLowerCase()];

  const promises = cryptoIds.map(async (id) => {
    const mappedId = CRYPTO_ID_MAP[id];
    const response = await fetch(
      `${COINCAP_API}/assets/${mappedId}/history?interval=${interval}&start=${startTime}&end=${endTime}`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { data } = await response.json() as CoinCapResponse<{ time: number; priceUsd: string; }[]>;
    const prices = data.map(({ time, priceUsd }): [number, number] => [
      time,
      parseFloat(priceUsd) * rate
    ]);

    return { id: mappedId, prices };
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results.map(({ id, prices }) => [id, prices]));
};