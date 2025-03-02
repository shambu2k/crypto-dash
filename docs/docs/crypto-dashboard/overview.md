# Cryptocurrency Dashboard Overview

This cryptocurrency dashboard is a modern application that provides real-time price tracking for major cryptocurrencies. Built with Next.js and React Query, it offers a seamless user experience with efficient state management and real-time updates.

## Project Setup

### Web Application Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/shambu2k/crypto-dash
   ```
2. Navigate to the web-app directory:
   ```bash
   cd crypto-dash/web-app
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Documentation Setup
1. Navigate to the docs directory:
   ```bash
   cd crypto-dash/docs
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the documentation server:
   ```bash
   npm run start
   ```

## API Integration

The dashboard integrates with CoinCap API to fetch real-time cryptocurrency data:

### Endpoints Used
- Assets API (`/v2/assets`): Fetches current price data for cryptocurrencies
- History API (`/v2/assets/{id}/history`): Retrieves historical price data

### Data Fetching Strategy
- Real-time price updates through periodic API calls
- Efficient data caching using React Query
- Error handling and retry mechanisms
- Rate limiting compliance

## State Management

### Why React Query?

We chose React Query over alternatives like Zustand or Context API for several reasons:

1. **Built-in Caching**
   - Automatic caching of API responses
   - Configurable cache invalidation
   - Background data updates

2. **Server State Management**
   - Optimized for handling server-side data
   - Automatic background refetching
   - Built-in loading and error states

3. **Developer Experience**
   - Minimal boilerplate code
   - Declarative data fetching
   - Powerful devtools for debugging

## Challenges & Solutions

### 1. Real-time Data Updates
**Challenge**: Maintaining real-time price updates without overwhelming the API or the client (got a lot of 429s).
**Solution**: Implemented smart polling with React Query's `staleTime` options to balance data freshness with performance.

### 2. State Management Complexity
**Challenge**: Managing complex state interactions between price updates, filtering, and historical data.
**Solution**: Leveraged React Query's powerful caching and query invalidation system to handle data dependencies efficiently.

### 3. Performance Optimization
**Challenge**: Preventing unnecessary re-renders with frequent data updates.
**Solution**: Utilized React Query's built-in memoization and selective updates to minimize component re-renders.

### 4. Error Handling
**Challenge**: Gracefully handling API failures and rate limits.
**Solution**: Implemented comprehensive error boundaries and retry logic using React Query's error handling capabilities.

## Core Features

### Real-time Price Display
- Shows current prices for major cryptocurrencies
- Manual and automatic refresh options
- Historical price data visualization

### User Interface
- Clean and focused design
- Responsive layout for all devices
- Intuitive search and filtering
- Loading indicators for better UX

### Technical Implementation
- Next.js for the framework
- React Query for state management
- CoinCap API integration
- TypeScript for type safety