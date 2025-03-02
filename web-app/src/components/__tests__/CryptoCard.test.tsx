import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CryptoCard } from '../CryptoCard';

const mockProps = {
  name: 'bitcoin',
  price: 50000,
  priceChange: 2.5,
  marketCap: 1000000000000,
  selectedCurrency: 'usd',
  isDarkMode: false,
  chartData: [[1234567890000, 49000], [1234567890001, 50000]] as [number, number][]
};

describe('CryptoCard', () => {
  it('renders crypto information correctly', () => {
    render(<CryptoCard {...mockProps} />);
    
    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    expect(screen.getByText('2.50%')).toBeInTheDocument();
    expect(screen.getByText(/Market Cap:/)).toBeInTheDocument();
  });

  it('applies correct styling based on price change', () => {
    render(<CryptoCard {...mockProps} />);
    
    const priceChangeElement = screen.getByText('2.50%');
    expect(priceChangeElement.parentElement).toHaveClass('text-white bg-black');
  });

  it('handles negative price changes correctly', () => {
    render(
      <CryptoCard
        {...mockProps}
        priceChange={-2.5}
      />
    );
    
    const priceChangeElement = screen.getByText('2.50%');
    expect(priceChangeElement.parentElement).toHaveClass('text-black bg-white');
  });

  it('formats market cap in compact notation', () => {
    render(<CryptoCard {...mockProps} />);
    
    expect(screen.getByText(/Market Cap: \$1T/)).toBeInTheDocument();
  });

  it('applies dark mode styling when enabled', () => {
    render(
      <CryptoCard
        {...mockProps}
        isDarkMode={true}
      />
    );
    
    const cardElement = screen.getByText('bitcoin').closest('div');
    expect(cardElement).toHaveClass('border-white bg-black');
  });
});