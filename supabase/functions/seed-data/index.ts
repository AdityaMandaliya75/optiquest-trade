
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.41.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    await Promise.all([
      seedStocks(supabase),
      seedIndices(supabase),
      seedOptions(supabase)
    ]);

    return new Response(
      JSON.stringify({ message: 'Database seeded successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during seeding' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function seedStocks(supabase: any) {
  const stocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.34,
      change: 2.56,
      change_percent: 1.48,
      high: 176.82,
      low: 174.21,
      open: 174.94,
      close: 172.78,
      volume: 54321789,
      market_cap: 2890000000000,
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 339.21,
      change: 3.45,
      change_percent: 1.03,
      high: 340.12,
      low: 336.05,
      open: 337.15,
      close: 335.76,
      volume: 32145678,
      market_cap: 2520000000000,
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.56,
      change: -1.23,
      change_percent: -0.85,
      high: 144.12,
      low: 141.98,
      open: 143.75,
      close: 143.79,
      volume: 21345678,
      market_cap: 1790000000000,
      sector: 'Technology'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 178.23,
      change: 2.67,
      change_percent: 1.52,
      high: 179.45,
      low: 176.89,
      open: 177.12,
      close: 175.56,
      volume: 25678901,
      market_cap: 1850000000000,
      sector: 'Consumer Cyclical'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 243.56,
      change: -6.78,
      change_percent: -2.71,
      high: 249.32,
      low: 242.11,
      open: 250.34,
      close: 250.34,
      volume: 87654321,
      market_cap: 775000000000,
      sector: 'Auto Manufacturers'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 876.45,
      change: 23.78,
      change_percent: 2.79,
      high: 880.12,
      low: 856.34,
      open: 857.23,
      close: 852.67,
      volume: 43215678,
      market_cap: 2150000000000,
      sector: 'Technology'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: 483.12,
      change: 8.65,
      change_percent: 1.82,
      high: 485.67,
      low: 479.34,
      open: 480.45,
      close: 474.47,
      volume: 19876543,
      market_cap: 1230000000000,
      sector: 'Technology'
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      price: 198.34,
      change: 1.23,
      change_percent: 0.62,
      high: 199.45,
      low: 197.56,
      open: 197.89,
      close: 197.11,
      volume: 12345678,
      market_cap: 570000000000,
      sector: 'Financial Services'
    },
    {
      symbol: 'V',
      name: 'Visa Inc.',
      price: 276.45,
      change: 0.89,
      change_percent: 0.32,
      high: 277.23,
      low: 275.56,
      open: 275.78,
      close: 275.56,
      volume: 8765432,
      market_cap: 580000000000,
      sector: 'Financial Services'
    },
    {
      symbol: 'WMT',
      name: 'Walmart Inc.',
      price: 68.23,
      change: -0.34,
      change_percent: -0.5,
      high: 68.89,
      low: 67.95,
      open: 68.56,
      close: 68.57,
      volume: 9876543,
      market_cap: 550000000000,
      sector: 'Consumer Defensive'
    }
  ];

  // Batch insert stocks
  const { error } = await supabase
    .from('stocks')
    .upsert(stocks, { onConflict: 'symbol' });

  if (error) throw error;
  
  console.log(`Seeded ${stocks.length} stocks`);
}

async function seedIndices(supabase: any) {
  const indices = [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      value: 5123.45,
      change: 15.67,
      change_percent: 0.31,
      open: 5110.23,
      high: 5130.45,
      low: 5102.67
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      value: 38765.34,
      change: 105.34,
      change_percent: 0.27,
      open: 38670.12,
      high: 38790.23,
      low: 38650.45
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ',
      value: 16234.56,
      change: 89.23,
      change_percent: 0.55,
      open: 16150.45,
      high: 16250.34,
      low: 16120.78
    }
  ];

  // Batch insert indices
  const { error } = await supabase
    .from('market_indices')
    .upsert(indices, { onConflict: 'symbol' });

  if (error) throw error;
  
  console.log(`Seeded ${indices.length} indices`);
}

async function seedOptions(supabase: any) {
  // First check if AAPL exists
  const { data: appleStock } = await supabase
    .from('stocks')
    .select('symbol')
    .eq('symbol', 'AAPL')
    .single();

  if (!appleStock) {
    console.log('AAPL stock not found, seeding stock data first');
    await seedStocks(supabase);
  }

  const currentDate = new Date();
  const expiryDate = new Date(currentDate);
  expiryDate.setDate(currentDate.getDate() + 30); // 30 days from now
  const expiryDateStr = expiryDate.toISOString().split('T')[0];

  const options = [
    {
      underlying_symbol: 'AAPL',
      strike_price: 170,
      expiry_date: expiryDateStr,
      type: 'call',
      last_price: 8.45,
      change: 0.65,
      change_percent: 8.32,
      volume: 12345,
      open_interest: 45678,
      implied_volatility: 0.32
    },
    {
      underlying_symbol: 'AAPL',
      strike_price: 175,
      expiry_date: expiryDateStr,
      type: 'call',
      last_price: 5.67,
      change: 0.43,
      change_percent: 8.21,
      volume: 23456,
      open_interest: 34567,
      implied_volatility: 0.31
    },
    {
      underlying_symbol: 'AAPL',
      strike_price: 180,
      expiry_date: expiryDateStr,
      type: 'call',
      last_price: 3.45,
      change: 0.32,
      change_percent: 10.23,
      volume: 34567,
      open_interest: 23456,
      implied_volatility: 0.305
    },
    {
      underlying_symbol: 'AAPL',
      strike_price: 170,
      expiry_date: expiryDateStr,
      type: 'put',
      last_price: 3.21,
      change: -0.45,
      change_percent: -12.3,
      volume: 45678,
      open_interest: 12345,
      implied_volatility: 0.33
    },
    {
      underlying_symbol: 'AAPL',
      strike_price: 175,
      expiry_date: expiryDateStr,
      type: 'put',
      last_price: 5.67,
      change: -0.23,
      change_percent: -3.9,
      volume: 56789,
      open_interest: 23456,
      implied_volatility: 0.34
    },
    {
      underlying_symbol: 'AAPL',
      strike_price: 180,
      expiry_date: expiryDateStr,
      type: 'put',
      last_price: 8.90,
      change: -0.12,
      change_percent: -1.33,
      volume: 67890,
      open_interest: 34567,
      implied_volatility: 0.35
    }
  ];

  // Check for duplicates before inserting
  for (const option of options) {
    const { data: existingOption } = await supabase
      .from('options')
      .select('id')
      .eq('underlying_symbol', option.underlying_symbol)
      .eq('strike_price', option.strike_price)
      .eq('expiry_date', option.expiry_date)
      .eq('type', option.type)
      .maybeSingle();

    if (!existingOption) {
      const { error } = await supabase
        .from('options')
        .insert(option);

      if (error) throw error;
    }
  }
  
  console.log(`Seeded options for AAPL`);
}
