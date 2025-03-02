import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';

interface CryptoCardProps {
  name: string;
  price: number;
  priceChange: number;
  marketCap: number;
  selectedCurrency: string;
  isDarkMode: boolean;
  chartData?: [number, number][];
}

export const CryptoCard = ({
  name,
  price,
  priceChange,
  marketCap,
  selectedCurrency,
  isDarkMode,
  chartData
}: CryptoCardProps) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedCurrency.toUpperCase(),
  }).format(price);

  return (
    <div className={`border-4 ${isDarkMode ? 'border-white bg-black' : 'border-black bg-white'} p-4`}>
      <div className="font-mono">
        <div className="flex justify-between items-start border-b-4 border-current pb-2 mb-2">
          <h2 className="text-2xl uppercase">{name}</h2>
          <div className={`${priceChange >= 0 ? 'text-white bg-black' : 'text-black bg-white'} ${isDarkMode ? 'border-white' : 'border-black'} border-4 px-2 flex items-center gap-1`}>
            {priceChange >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>
        <p className="text-4xl mb-2">{formattedPrice}</p>
        <p className="text-sm mb-4 opacity-75">
          Market Cap: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: selectedCurrency.toUpperCase(),
            notation: 'compact',
            maximumFractionDigits: 2
          }).format(marketCap)}
        </p>
        {chartData && (
          <div className="mt-4 h-32">
            <Line
              data={{
                labels: chartData.map(([timestamp]) =>
                  new Date(timestamp).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: `${name.toUpperCase()} Price`,
                    data: chartData.map(([, price]) => price),
                    borderColor: priceChange >= 0 ? '#10B981' : '#EF4444',
                    tension: 0.1,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};