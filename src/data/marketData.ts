export interface SparklinePoint {
  x: number;
  y: number;
}

export interface InstrumentQuote {
  id: string;
  symbol: string;
  name: string;
  category: 'indices' | 'us-stocks' | 'world-stocks' | 'crypto' | 'futures' | 'forex' | 'bonds' | 'etfs';
  subCategory?: string;
  price: number;
  change: number;
  changePct: number;
  currency?: string;
  prefix?: string;
  suffix?: string;
  volume?: string;
  marketCap?: string;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  peRatio?: string;
  dividendYield?: string;
  week52High?: number;
  week52Low?: number;
  sparkline: number[]; // relative price points for sparkline curve
  bid?: number;
  ask?: number;
  flag?: string;
  badgeText?: string;
  badgeColor?: string;
  notes?: string;
  description?: string;
}

export interface EconomicIndicator {
  country: string;
  flag: string;
  gdpNominal: string;
  gdpGrowth: number;
  interestRate: number;
  inflationRate: number;
  unemployment: number;
  debtToGdp: number;
}

export const INITIAL_PRIMARY_INDICES: InstrumentQuote[] = [
  {
    id: 'spx',
    symbol: 'S&P 500',
    name: 'SPX • US Large Cap',
    category: 'indices',
    badgeText: '500',
    badgeColor: '#da2237',
    price: 5864.67,
    change: 18.72,
    changePct: 0.32,
    volume: '2.84B',
    high: 5871.20,
    low: 5849.10,
    open: 5850.50,
    previousClose: 5845.95,
    week52High: 5878.46,
    week52Low: 4103.78,
    sparkline: [25, 24, 22, 20, 18, 17, 15, 14, 12, 10, 7, 4],
    description: 'The Standard and Poor 500 is a stock market index tracking the stock performance of 500 of the largest companies listed on stock exchanges in the United States.'
  },
  {
    id: 'ndx',
    symbol: 'Nasdaq 100',
    name: 'NDX • US Tech Heavy',
    category: 'indices',
    badgeText: '100',
    badgeColor: '#2962ff',
    price: 20534.12,
    change: 110.88,
    changePct: 0.54,
    volume: '4.91B',
    high: 20580.40,
    low: 20412.30,
    open: 20440.00,
    previousClose: 20423.24,
    week52High: 20690.97,
    week52Low: 14058.30,
    sparkline: [22, 25, 28, 24, 18, 14, 16, 12, 10, 8, 5, 3],
    description: 'The Nasdaq-100 includes 100 of the largest domestic and international non-financial companies listed on The Nasdaq Stock Market based on market cap.'
  },
  {
    id: 'dji',
    symbol: 'Dow 30',
    name: 'DJI • Blue Chip Index',
    category: 'indices',
    badgeText: '30',
    badgeColor: '#0089ff',
    price: 43910.29,
    change: -65.90,
    changePct: -0.15,
    volume: '340M',
    high: 44020.10,
    low: 43850.40,
    open: 43980.00,
    previousClose: 43976.19,
    week52High: 44486.72,
    week52Low: 32327.39,
    sparkline: [8, 9, 11, 14, 16, 17, 19, 21, 22, 24, 26, 27],
    description: 'The Dow Jones Industrial Average is a price-weighted stock market index of 30 prominent companies listed on stock exchanges in the United States.'
  }
];

export const INITIAL_SECONDARY_INDICES: InstrumentQuote[] = [
  {
    id: 'rut',
    symbol: 'Russell 2000',
    name: 'RUT • Small Cap',
    category: 'indices',
    price: 2324.90,
    change: 18.01,
    changePct: 0.78,
    sparkline: [20, 18, 15, 12, 10, 6]
  },
  {
    id: 'ixic',
    symbol: 'Nasdaq Comp',
    name: 'COMP • Composite',
    category: 'indices',
    price: 19281.40,
    change: 94.10,
    changePct: 0.49,
    sparkline: [18, 16, 14, 11, 8, 5]
  },
  {
    id: 'nya',
    symbol: 'NYSE Comp',
    name: 'NYA • All NYSE',
    category: 'indices',
    price: 19650.15,
    change: -15.70,
    changePct: -0.08,
    sparkline: [8, 10, 12, 14, 15, 16]
  },
  {
    id: 'vix',
    symbol: 'VIX Volatility',
    name: 'CBOE Volatility Index',
    category: 'indices',
    price: 14.62,
    change: -0.48,
    changePct: -3.20,
    sparkline: [5, 8, 12, 16, 20, 24]
  },
  {
    id: 'uk100',
    symbol: 'Cboe UK 100',
    name: 'UK100 • London',
    category: 'indices',
    price: 824.11,
    change: 1.81,
    changePct: 0.22,
    sparkline: [16, 15, 13, 11, 9, 8]
  },
  {
    id: 'sx5e',
    symbol: 'Euro Stoxx 50',
    name: 'SX5E • Pan-Europe',
    category: 'indices',
    price: 4812.90,
    change: 19.65,
    changePct: 0.41,
    sparkline: [19, 17, 14, 12, 9, 7]
  }
];

export const INITIAL_WORLD_INDICES: InstrumentQuote[] = [
  {
    id: 'n225',
    symbol: 'Nikkei 225',
    name: 'Japan Tokyo Exchange',
    category: 'world-stocks',
    flag: '🇯🇵',
    price: 38720.47,
    change: 261.20,
    changePct: 0.68,
    sparkline: [15, 12, 14, 9, 6, 4]
  },
  {
    id: 'ukx',
    symbol: 'FTSE 100',
    name: 'United Kingdom London',
    category: 'world-stocks',
    flag: '🇬🇧',
    price: 8102.30,
    change: -8.90,
    changePct: -0.11,
    sparkline: [8, 10, 11, 13, 14, 15]
  },
  {
    id: 'dax',
    symbol: 'DAX Index',
    name: 'Germany Frankfurt',
    category: 'world-stocks',
    flag: '🇩🇪',
    price: 19418.50,
    change: 75.40,
    changePct: 0.39,
    sparkline: [16, 15, 12, 10, 8, 6]
  },
  {
    id: 'px1',
    symbol: 'CAC 40',
    name: 'France Euronext Paris',
    category: 'world-stocks',
    flag: '🇫🇷',
    price: 7229.80,
    change: -17.40,
    changePct: -0.24,
    sparkline: [7, 9, 12, 14, 15, 17]
  },
  {
    id: 'hsi',
    symbol: 'Hang Seng',
    name: 'Hong Kong Exchange',
    category: 'world-stocks',
    flag: '🇭🇰',
    price: 19620.10,
    change: 223.10,
    changePct: 1.15,
    sparkline: [22, 19, 16, 12, 8, 4]
  },
  {
    id: 'nifty',
    symbol: 'Nifty 50',
    name: 'India National Stock Exch',
    category: 'world-stocks',
    flag: '🇮🇳',
    price: 23907.25,
    change: 194.50,
    changePct: 0.82,
    sparkline: [18, 16, 13, 10, 7, 5]
  }
];

export const INITIAL_US_STOCKS: InstrumentQuote[] = [
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'us-stocks',
    price: 141.54,
    change: 3.02,
    changePct: 2.18,
    marketCap: '$3.47T',
    volume: '68.1M',
    high: 143.20,
    low: 139.10,
    open: 139.80,
    previousClose: 138.52,
    week52High: 149.77,
    week52Low: 45.01,
    peRatio: '62.4',
    sparkline: [18, 17, 15, 12, 8, 7, 6, 4, 3, 2],
    description: 'NVIDIA Corporation pioneers accelerated computing to solve problems that normal computers cannot. Inventor of the GPU in 1999 and the leading architect of AI computing platforms.'
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'us-stocks',
    price: 232.10,
    change: 1.04,
    changePct: 0.45,
    marketCap: '$3.52T',
    volume: '48.9M',
    high: 233.40,
    low: 230.80,
    open: 231.20,
    previousClose: 231.06,
    week52High: 237.23,
    week52Low: 164.08,
    peRatio: '34.8',
    sparkline: [12, 13, 14, 13, 11, 9, 8, 6, 5, 4],
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.'
  },
  {
    id: 'amzn',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'us-stocks',
    price: 208.75,
    change: 2.31,
    changePct: 1.12,
    marketCap: '$2.19T',
    volume: '38.2M',
    high: 209.60,
    low: 206.40,
    open: 207.00,
    previousClose: 206.44,
    week52High: 214.10,
    week52Low: 118.35,
    peRatio: '43.2',
    sparkline: [16, 14, 12, 10, 8, 8, 6, 5, 3, 2],
    description: 'Amazon.com, Inc. focuses on retail sale of consumer products, cloud computing infrastructure through AWS, online advertising, digital streaming, and AI development.'
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'us-stocks',
    price: 181.20,
    change: -0.55,
    changePct: -0.30,
    marketCap: '$2.24T',
    volume: '22.4M',
    high: 183.10,
    low: 180.40,
    open: 182.00,
    previousClose: 181.75,
    week52High: 191.75,
    week52Low: 120.21,
    peRatio: '24.1',
    sparkline: [4, 6, 7, 8, 10, 12, 13, 15, 16, 18],
    description: 'Alphabet Inc. is a multinational technology conglomerate holding company created through a restructuring of Google, including Google Search, YouTube, Android, Google Cloud, and Waymo.'
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'us-stocks',
    price: 320.40,
    change: 11.75,
    changePct: 3.80,
    marketCap: '$1.02T',
    volume: '89.4M',
    high: 324.90,
    low: 312.20,
    open: 314.00,
    previousClose: 308.65,
    week52High: 358.64,
    week52Low: 138.80,
    peRatio: '98.5',
    sparkline: [19, 18, 17, 14, 11, 9, 8, 6, 3, 1],
    description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles, energy storage systems, solar panels, and solar roof tiles, as well as AI robotics.'
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'us-stocks',
    price: 428.15,
    change: 3.74,
    changePct: 0.88,
    marketCap: '$3.18T',
    volume: '41.5M',
    high: 430.50,
    low: 424.80,
    open: 425.00,
    previousClose: 424.41,
    week52High: 468.35,
    week52Low: 309.45,
    peRatio: '35.6',
    sparkline: [14, 13, 12, 11, 9, 8, 7, 6, 5, 3],
    description: 'Microsoft Corporation is a multinational technology company that produces computer software, consumer electronics, personal computers, cloud infrastructure Azure, and related services.'
  }
];

export const HIGHEST_VOLUME_STOCKS = [
  { symbol: 'MU', name: 'Micron Tech', price: 103.80, changePct: 4.20, volume: '92.4M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 141.54, changePct: 2.18, volume: '68.1M' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 428.15, changePct: 0.88, volume: '41.5M' },
  { symbol: 'META', name: 'Meta Platforms', price: 589.30, changePct: 1.45, volume: '34.0M' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 320.40, changePct: 3.80, volume: '29.8M' }
];

export const MOST_VOLATILE_STOCKS = [
  { symbol: 'AXG', name: 'Solowin Hldgs', price: 16.40, changePct: 38.4 },
  { symbol: 'MSGY', name: 'Masonglory Ltd', price: 2.94, changePct: -24.1 },
  { symbol: 'IPEX', name: 'Inflection Point', price: 11.18, changePct: 21.3 },
  { symbol: 'WYY', name: 'WidePoint Corp', price: 4.52, changePct: 17.8 },
  { symbol: 'IFBD', name: 'Infobird Co.', price: 0.82, changePct: -19.5 }
];

export const TOP_GAINERS_STOCKS = [
  { symbol: 'SNDK', name: 'Sandisk Storage', price: 64.20, changePct: 18.42 },
  { symbol: 'TDIC', name: 'Dreamland Ltd', price: 8.12, changePct: 14.20 },
  { symbol: 'ALAR', name: 'Alarum Tech', price: 22.65, changePct: 11.90 },
  { symbol: 'COIN', name: 'Coinbase Global', price: 314.50, changePct: 9.84 },
  { symbol: 'AMD', name: 'Adv Micro Devices', price: 148.90, changePct: 7.35 }
];

export const EARNINGS_TODAY = [
  { symbol: 'KNDI', name: 'Kandi Tech', est: '—', act: 'Post-market', status: 'pending' },
  { symbol: 'TAYD', name: 'Taylor Devices', est: '$0.92', act: '$1.04', status: 'beat' },
  { symbol: 'MTN', name: 'Vail Resorts', est: '-$5.35', act: 'Post-market', status: 'pending' },
  { symbol: 'TRAK', name: 'ReposiTrak', est: '$0.09', act: '$0.11', status: 'beat' },
  { symbol: 'NCPL', name: 'Netcapital', est: '—', act: 'After close', status: 'pending' }
];

export const INITIAL_CRYPTO: InstrumentQuote[] = [
  {
    id: 'btc',
    symbol: 'Bitcoin',
    name: 'BTC/USD',
    category: 'crypto',
    badgeText: '₿',
    badgeColor: '#f7931a',
    price: 96420.00,
    change: 2259.00,
    changePct: 2.40,
    marketCap: '$1.67T',
    volume: '$48.2B',
    high: 97100.00,
    low: 94050.00,
    open: 94161.00,
    previousClose: 94161.00,
    week52High: 99800.00,
    week52Low: 38500.00,
    sparkline: [18, 17, 16, 14, 12, 10, 8, 6, 4, 2],
    description: 'Bitcoin is the first decentralized digital currency, enabling peer-to-peer transfers across the globe without intermediaries through a cryptographic proof-of-work blockchain.'
  },
  {
    id: 'eth',
    symbol: 'Ethereum',
    name: 'ETH/USD',
    category: 'crypto',
    badgeText: 'Ξ',
    badgeColor: '#627eea',
    price: 2780.45,
    change: 49.15,
    changePct: 1.80,
    marketCap: '$322.7B',
    volume: '$24.6B',
    high: 2815.00,
    low: 2720.00,
    open: 2731.30,
    previousClose: 2731.30,
    week52High: 4093.00,
    week52Low: 1520.00,
    sparkline: [15, 14, 13, 11, 9, 8, 7, 5, 4, 2],
    description: 'Ethereum is a decentralized open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform, powering decentralized finance and dApps.'
  },
  {
    id: 'sol',
    symbol: 'Solana',
    name: 'SOL/USD',
    category: 'crypto',
    badgeText: '◎',
    badgeColor: '#14f195',
    price: 218.60,
    change: 10.65,
    changePct: 5.12,
    marketCap: '$103.2B',
    volume: '$8.9B',
    high: 222.00,
    low: 206.50,
    open: 207.95,
    previousClose: 207.95,
    week52High: 260.06,
    week52Low: 21.10,
    sparkline: [19, 18, 16, 13, 10, 8, 6, 4, 2, 1],
    description: 'Solana is a high-performance public blockchain platform with proof-of-history consensus, designed to support decentralized applications and crypto-native commerce at web-scale speeds.'
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP/USD',
    category: 'crypto',
    badgeText: '✕',
    badgeColor: '#23292f',
    price: 1.584,
    change: 0.052,
    changePct: 3.40,
    marketCap: '$92.68B',
    volume: '$6.1B',
    high: 1.620,
    low: 1.520,
    open: 1.532,
    previousClose: 1.532,
    week52High: 1.960,
    week52Low: 0.485,
    sparkline: [14, 13, 11, 10, 8, 7, 6, 5, 4, 3],
    description: 'XRP is the native cryptocurrency of the XRP Ledger, an open-source, public blockchain designed to facilitate fast, low-cost cross-border currency transfers and financial settlement.'
  }
];

export const CRYPTO_MARKET_CAP_RANKING = [
  { rank: 1, name: 'Bitcoin', symbol: 'BTCUSD', mcap: '$1.67 T', changePct: 2.40 },
  { rank: 2, name: 'Ethereum', symbol: 'ETHUSD', mcap: '$322.7 B', changePct: 1.80 },
  { rank: 3, name: 'Tether USDt', symbol: 'USDTUSD', mcap: '$183.73 B', changePct: 0.00 },
  { rank: 4, name: 'BNB', symbol: 'BNBUSD', mcap: '$101.31 B', changePct: 0.95 },
  { rank: 5, name: 'USDC', symbol: 'USDCUSD', mcap: '$75.14 B', changePct: 0.01 }
];

export const CRYPTO_TVL_RANKING = [
  { rank: 1, name: 'Aave', symbol: 'AAVEUSD', tvl: '$32.83 B', changePct: 4.10 },
  { rank: 2, name: 'Lido DAO', symbol: 'LDOUSD', tvl: '$26.49 B', changePct: 1.90 },
  { rank: 3, name: 'Ethena', symbol: 'ENAUSD', tvl: '$5.43 B', changePct: 8.25 },
  { rank: 4, name: 'Uniswap', symbol: 'UNIUSD', tvl: '$3.99 B', changePct: 3.15 },
  { rank: 5, name: 'Babylon', symbol: 'BABYLUSD', tvl: '$3.42 B', changePct: 5.40 }
];

export const CRYPTO_MOVERS = [
  { name: 'Quant', symbol: 'QNTUSD', changePct: 54.83 },
  { name: 'The Graph', symbol: 'GRTUSD', changePct: 15.00 },
  { name: 'XDC Network', symbol: 'XDCUSD', changePct: 12.41 },
  { name: 'Pons', symbol: 'PONS2USD', changePct: -15.88 },
  { name: 'Useless Coin', symbol: 'USELESSUSD', changePct: -12.88 }
];

export const INITIAL_COMMODITIES: InstrumentQuote[] = [
  {
    id: 'gold',
    symbol: 'Gold',
    name: 'GC1! • COMEX',
    category: 'futures',
    price: 2748.20,
    change: 17.80,
    changePct: 0.65,
    suffix: 'USD / oz',
    sparkline: [15, 14, 12, 10, 8, 5]
  },
  {
    id: 'silver',
    symbol: 'Silver',
    name: 'SI1! • COMEX',
    category: 'futures',
    price: 31.85,
    change: 0.38,
    changePct: 1.20,
    suffix: 'USD / oz',
    sparkline: [17, 15, 13, 10, 8, 4]
  },
  {
    id: 'oil',
    symbol: 'Crude Oil',
    name: 'CL1! • NYMEX',
    category: 'futures',
    price: 70.45,
    change: -0.57,
    changePct: -0.80,
    suffix: 'USD / bbl',
    sparkline: [5, 7, 9, 12, 15, 18]
  },
  {
    id: 'gas',
    symbol: 'Natural Gas',
    name: 'NG1! • NYMEX',
    category: 'futures',
    price: 3.142,
    change: 0.066,
    changePct: 2.15,
    suffix: 'USD / MMBtu',
    sparkline: [18, 16, 14, 11, 8, 4]
  },
  {
    id: 'copper',
    symbol: 'Copper',
    name: 'HG1! • COMEX',
    category: 'futures',
    price: 4.189,
    change: 0.020,
    changePct: 0.48,
    suffix: 'USD / lb',
    sparkline: [14, 13, 11, 9, 7, 5]
  },
  {
    id: 'coffee',
    symbol: 'Coffee C',
    name: 'KC1! • ICEUS',
    category: 'futures',
    price: 284.10,
    change: 8.55,
    changePct: 3.10,
    suffix: 'USc / lb',
    sparkline: [20, 18, 15, 11, 7, 3]
  }
];

export const ENERGY_FUTURES = [
  { name: 'Brent crude oil', symbol: 'BRN1! • ICEEUR', price: 74.15, changePct: -0.72 },
  { name: 'RBOB gasoline', symbol: 'RB1! • NYMEX', price: 2.041, changePct: -0.45 },
  { name: 'NY Harbor ULSD', symbol: 'HO1! • NYMEX', price: 2.285, changePct: 0.18 }
];

export const AGRICULTURAL_FUTURES = [
  { name: 'Soybean', symbol: 'ZS1! • CBOT', price: 998.50, changePct: -0.35 },
  { name: 'Corn', symbol: 'ZC1! • CBOT', price: 428.25, changePct: 0.82 },
  { name: 'Sugar No. 11', symbol: 'SB1! • ICEUS', price: 21.48, changePct: 1.30 }
];

export const INDEX_FUTURES = [
  { name: 'E-mini NASDAQ-100', symbol: 'NQ1! • CME', price: 20592.50, changePct: 0.58 },
  { name: 'E-mini S&P 500', symbol: 'ES1! • CME', price: 5882.25, changePct: 0.35 },
  { name: 'E-mini Dow Jones', symbol: 'YM1! • CBOT', price: 43995.00, changePct: -0.12 }
];

export const INITIAL_FOREX: InstrumentQuote[] = [
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    price: 1.0542,
    change: -0.0013,
    changePct: -0.12,
    bid: 1.0541,
    ask: 1.0543,
    sparkline: [6, 8, 10, 13, 15, 17]
  },
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Yen',
    category: 'forex',
    price: 154.20,
    change: 0.58,
    changePct: 0.38,
    bid: 154.19,
    ask: 154.21,
    sparkline: [16, 14, 12, 10, 8, 5]
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'Pound / US Dollar',
    category: 'forex',
    price: 1.2610,
    change: -0.0028,
    changePct: -0.22,
    bid: 1.2609,
    ask: 1.2611,
    sparkline: [7, 9, 11, 13, 14, 16]
  },
  {
    id: 'audusd',
    symbol: 'AUD/USD',
    name: 'Aussie / US Dollar',
    category: 'forex',
    price: 0.6508,
    change: -0.0003,
    changePct: -0.05,
    bid: 0.6507,
    ask: 0.6509,
    sparkline: [9, 10, 11, 12, 13, 14]
  },
  {
    id: 'usdcad',
    symbol: 'USD/CAD',
    name: 'US Dollar / Loonie',
    category: 'forex',
    price: 1.4012,
    change: 0.0021,
    changePct: 0.15,
    bid: 1.4011,
    ask: 1.4013,
    sparkline: [14, 13, 12, 10, 9, 7]
  },
  {
    id: 'usdchf',
    symbol: 'USD/CHF',
    name: 'US Dollar / Franc',
    category: 'forex',
    price: 0.8872,
    change: 0.0016,
    changePct: 0.18,
    bid: 0.8871,
    ask: 0.8873,
    sparkline: [15, 14, 12, 10, 8, 6]
  }
];

export const US_TREASURY_YIELDS = [
  { maturity: '1 Year (US01Y)', yield: '4.499%', change: '-0.02%', isHighlighted: false },
  { maturity: '2 Years (US02Y)', yield: '4.908%', change: '-0.09%', isHighlighted: false },
  { maturity: '5 Years (US05Y)', yield: '5.046%', change: '-0.23%', isHighlighted: false },
  { maturity: '10 Years (US10Y)', yield: '5.205%', change: '-0.29%', isHighlighted: true },
  { maturity: '30 Years (US30Y)', yield: '5.515%', change: '-0.37%', isHighlighted: false }
];

export const GLOBAL_10Y_BENCHMARK = [
  { country: 'United States', flag: '🇺🇸', yield: '5.205%' },
  { country: 'United Kingdom (Gilt)', flag: '🇬🇧', yield: '5.398%' },
  { country: 'Germany (Bund)', flag: '🇩🇪', yield: '3.625%' },
  { country: 'France (OAT)', flag: '🇫🇷', yield: '4.725%' },
  { country: 'Italy (BTP)', flag: '🇮🇹', yield: '4.560%' }
];

export const CORPORATE_BONDS = [
  { name: 'Pemex 6.95% 2060', sub: 'Fixed • Mat 2060', badge: '7.51% YTM' },
  { name: 'Oracle 6.125% 2065', sub: 'Fixed • Mat 2065', badge: '6.13% YTM' },
  { name: 'MetLife 10.75% 2039', sub: 'Floating • Mat 2039', badge: '10.75% Cpn' },
  { name: 'Walmart 4.1% 2027', sub: 'Short-term • 2027', badge: '4.30% YTM' }
];

export const INITIAL_ETFS: InstrumentQuote[] = [
  {
    id: 'spy',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    category: 'etfs',
    price: 586.20,
    change: 1.98,
    changePct: 0.34,
    notes: 'AUM: $590B • High Liquidity',
    sparkline: [16, 14, 12, 10, 8, 5]
  },
  {
    id: 'qqq',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust Series 1',
    category: 'etfs',
    price: 501.40,
    change: 2.79,
    changePct: 0.56,
    notes: 'AUM: $290B • Tech Benchmark',
    sparkline: [17, 15, 13, 10, 8, 4]
  },
  {
    id: 'ibit',
    symbol: 'IBIT',
    name: 'iShares Bitcoin Trust',
    category: 'etfs',
    price: 54.12,
    change: 1.24,
    changePct: 2.35,
    notes: 'AUM: $43B • Crypto Spot ETF',
    sparkline: [19, 17, 14, 11, 8, 3]
  },
  {
    id: 'soxl',
    symbol: 'SOXL',
    name: 'Direxion Semiconductor 3X',
    category: 'etfs',
    price: 32.80,
    change: 1.99,
    changePct: 6.45,
    notes: '3X Bull Leveraged',
    sparkline: [22, 18, 14, 10, 6, 2]
  }
];

export const ECONOMIC_INDICATORS: EconomicIndicator[] = [
  {
    country: 'USA',
    flag: '🇺🇸',
    gdpNominal: '$27.36 T',
    gdpGrowth: 2.8,
    interestRate: 4.75,
    inflationRate: 2.6,
    unemployment: 4.1,
    debtToGdp: 122.3
  },
  {
    country: 'China',
    flag: '🇨🇳',
    gdpNominal: '$17.79 T',
    gdpGrowth: 4.6,
    interestRate: 3.10,
    inflationRate: 0.3,
    unemployment: 5.1,
    debtToGdp: 77.1
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    gdpNominal: '$4.45 T',
    gdpGrowth: -0.2,
    interestRate: 3.40,
    inflationRate: 2.0,
    unemployment: 6.0,
    debtToGdp: 63.6
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    gdpNominal: '$4.21 T',
    gdpGrowth: 0.9,
    interestRate: 0.25,
    inflationRate: 2.5,
    unemployment: 2.4,
    debtToGdp: 261.3
  },
  {
    country: 'India',
    flag: '🇮🇳',
    gdpNominal: '$3.55 T',
    gdpGrowth: 6.7,
    interestRate: 6.50,
    inflationRate: 6.2,
    unemployment: 7.8,
    debtToGdp: 82.5
  }
];
