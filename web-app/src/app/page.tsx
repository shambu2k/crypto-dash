'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { CryptoCard } from '../components/CryptoCard';
import { getCryptoPrices, getCryptoHistory } from '../services/coinCapService';
import { ErrorBoundary } from '../components/ErrorBoundary';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp'];
const CHART_DAYS = 7; // Number of days to show in price history
const CRYPTO_IDS = ['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
    
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) setSelectedCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('currency', selectedCurrency);
  }, [selectedCurrency]);

  const queryClient = useQueryClient();

  const { data: priceData, isLoading: isPriceLoading, isError: isPriceError} = useQuery({
    queryKey: ['cryptoPrices', selectedCurrency],
    queryFn: () => getCryptoPrices(CRYPTO_IDS),
    staleTime: 10000, // Data remains fresh for 10 seconds
    retry: 1
  });

  const { data: chartData, isLoading: isChartLoading, isError: isChartError } = useQuery({
    queryKey: ['cryptoHistory', selectedCurrency],
    queryFn: () => getCryptoHistory(CRYPTO_IDS, selectedCurrency, CHART_DAYS),
    staleTime: 10000,
    retry: 1
  });

  const filteredCryptos = priceData
    ? Object.entries(priceData).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cryptoPrices'] }),
        queryClient.invalidateQueries({ queryKey: ['cryptoHistory'] })
      ]);
      setShowToast(true);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen font-mono ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} p-4 sm:p-8`}>
        <div className="container mx-auto">
          <header className="mb-8 border-b-4 border-current pb-8">
            <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4 sm:gap-0">
              <h1 className="text-4xl uppercase">Crypto Dashboard</h1>
              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                <select
                  className={`border-4 ${isDarkMode ? 'border-white bg-black text-white' : 'border-black bg-white text-black'} px-2 sm:px-4 py-2 uppercase text-sm sm:text-base w-full sm:w-auto`}
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency.toUpperCase()}
                    </option>
                  ))}
                </select>
                <button
                  className={`border-4 ${isDarkMode ? 'border-white bg-black text-white' : 'border-black bg-white text-black'} px-2 sm:px-4 py-2 uppercase text-sm sm:text-base w-full sm:w-auto min-w-[80px]`}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? 'LIGHT' : 'DARK'}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="SEARCH CRYPTOCURRENCIES..."
                className={`border-4 ${isDarkMode ? 'border-white bg-black text-white' : 'border-black bg-white text-black'} px-4 py-2 w-full sm:w-96 uppercase`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className={`border-4 ${isDarkMode ? 'border-white bg-black text-white' : 'border-black bg-white text-black'} px-8 py-2 uppercase cursor-pointer transition-transform active:scale-95`}
                onClick={handleRefresh}
                disabled={isPriceLoading || isChartLoading}
              >
                {(isPriceLoading || isChartLoading) ? (
                  <span className="inline-block w-4 h-4 border-4 border-current border-t-transparent animate-spin"></span>
                ) : (
                  'REFRESH'
                )}
              </button>
            </div>
          </header>

          {showToast && (
            <div className={`fixed bottom-4 right-4 border-4 ${isDarkMode ? 'border-white bg-black text-white' : 'border-black bg-white text-black'} px-4 py-2 uppercase transition-opacity duration-300`}>
              Data Refreshed Successfully
            </div>
          )}

          {(isPriceError || isChartError) ? (
            <div className="alert alert-error">
              <span>{isPriceError ? 'Error fetching crypto prices.' : 'Error fetching price history.'} Please try again.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCryptos.map(([name, data]) => {
                const price = data[selectedCurrency];
                const priceChange = data[`${selectedCurrency}_24h_change`];
                const marketCap = data[`${selectedCurrency}_market_cap`];

                return (
                  <CryptoCard
                    key={name}
                    name={name}
                    price={price}
                    priceChange={priceChange}
                    marketCap={marketCap}
                    selectedCurrency={selectedCurrency}
                    isDarkMode={isDarkMode}
                    chartData={chartData?.[name]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
