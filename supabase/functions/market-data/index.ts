
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const symbol = url.searchParams.get('symbol');
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    let responseData;

    switch(action) {
      case 'quote':
        if (!symbol) {
          return new Response(
            JSON.stringify({ error: 'Missing symbol parameter' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        responseData = await fetchQuote(symbol);
        break;
      
      case 'marketSummary':
        responseData = await fetchMarketSummary();
        break;
      
      case 'trending':
        responseData = await fetchTrendingStocks();
        break;
      
      case 'news':
        responseData = await fetchMarketNews(symbol);
        break;
      
      case 'chart':
        if (!symbol) {
          return new Response(
            JSON.stringify({ error: 'Missing symbol parameter' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        const interval = url.searchParams.get('interval') || '1d';
        const range = url.searchParams.get('range') || '1mo';
        responseData = await fetchChartData(symbol, interval, range);
        break;
      
      case 'options':
        if (!symbol) {
          return new Response(
            JSON.stringify({ error: 'Missing symbol parameter' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        responseData = await fetchOptionChain(symbol);
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action parameter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    // Store data in Supabase if needed
    if (responseData && action === 'quote' && symbol) {
      await storeStockData(supabaseAdmin, responseData, symbol);
    } else if (responseData && action === 'marketSummary') {
      await storeMarketIndices(supabaseAdmin, responseData);
    } else if (responseData && action === 'news') {
      await storeNewsData(supabaseAdmin, responseData, symbol);
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during processing' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Yahoo Finance API helper functions
async function fetchQuote(symbol: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote data: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processQuoteData(data);
}

async function fetchMarketSummary() {
  const yahooUrl = `https://query1.finance.yahoo.com/v6/finance/quoteSummary/%5EGSPC?modules=summaryDetail,price`;
  const dowUrl = `https://query1.finance.yahoo.com/v6/finance/quoteSummary/%5EDJI?modules=summaryDetail,price`;
  const nasdaqUrl = `https://query1.finance.yahoo.com/v6/finance/quoteSummary/%5EIXIC?modules=summaryDetail,price`;
  
  const responses = await Promise.all([
    fetch(yahooUrl),
    fetch(dowUrl),
    fetch(nasdaqUrl)
  ]);
  
  const data = await Promise.all(responses.map(response => response.json()));
  return processMarketSummaryData(data);
}

async function fetchTrendingStocks() {
  const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/trending/US`;
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trending stocks: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Get quotes for the trending symbols
  const symbols = data.finance.result[0].quotes
    .slice(0, 10)
    .map((quote: any) => quote.symbol)
    .join(',');
  
  return await fetchQuote(symbols);
}

async function fetchMarketNews(symbol?: string) {
  let yahooUrl = `https://query1.finance.yahoo.com/v2/finance/news`;
  if (symbol) {
    yahooUrl = `https://query1.finance.yahoo.com/v2/finance/news?symbol=${symbol}`;
  }
  
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market news: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processNewsData(data);
}

async function fetchChartData(symbol: string, interval: string, range: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processChartData(data);
}

async function fetchOptionChain(symbol: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`;
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch option chain: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processOptionChainData(data);
}

// Data processing functions
function processQuoteData(data: any) {
  const quotes = data?.quoteResponse?.result || [];
  
  return quotes.map((quote: any) => ({
    symbol: quote.symbol,
    name: quote.shortName || quote.longName || quote.symbol,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    high: quote.regularMarketDayHigh,
    low: quote.regularMarketDayLow,
    open: quote.regularMarketOpen,
    close: quote.regularMarketPreviousClose,
    volume: quote.regularMarketVolume,
    marketCap: quote.marketCap,
    sector: quote.sector
  }));
}

function processMarketSummaryData(data: any) {
  return [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      value: data[0].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[0].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[0].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[0].quoteSummary.result[0].summaryDetail.open.raw,
      high: data[0].quoteSummary.result[0].summaryDetail.dayHigh.raw,
      low: data[0].quoteSummary.result[0].summaryDetail.dayLow.raw
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      value: data[1].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[1].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[1].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[1].quoteSummary.result[0].summaryDetail.open.raw,
      high: data[1].quoteSummary.result[0].summaryDetail.dayHigh.raw,
      low: data[1].quoteSummary.result[0].summaryDetail.dayLow.raw
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ',
      value: data[2].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[2].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[2].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[2].quoteSummary.result[0].summaryDetail.open.raw,
      high: data[2].quoteSummary.result[0].summaryDetail.dayHigh.raw,
      low: data[2].quoteSummary.result[0].summaryDetail.dayLow.raw
    }
  ];
}

function processNewsData(data: any) {
  const items = data?.items?.result || [];
  
  return items.map((item: any) => {
    const relatedSymbols = (item.entities || [])
      .filter((entity: any) => entity.type === 'ticker')
      .map((entity: any) => entity.term);
    
    // Guess sentiment based on title keywords (very simple approach)
    let sentiment = 'neutral';
    const lowerTitle = item.title.toLowerCase();
    if (/rise|gain|jump|surge|higher|up|rally|rebound|growth|profit|positive/g.test(lowerTitle)) {
      sentiment = 'positive';
    } else if (/fall|drop|plunge|tumble|lower|down|decline|negative|loss|sell-off/g.test(lowerTitle)) {
      sentiment = 'negative';
    }
    
    return {
      id: item.uuid,
      headline: item.title,
      summary: item.summary || '',
      url: item.link,
      source: item.publisher,
      publishedAt: new Date(item.published_at * 1000).toISOString(),
      relatedSymbols,
      sentiment,
      isImportant: relatedSymbols.length > 0 // Consider news with ticker references as important
    };
  });
}

function processChartData(data: any) {
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  
  const timestamps = result.timestamp || [];
  const quote = result.indicators.quote[0];
  const chartData = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    chartData.push({
      timestamp: timestamps[i] * 1000, // Convert to milliseconds
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i]
    });
  }
  
  return chartData;
}

function processOptionChainData(data: any) {
  const result = data?.optionChain?.result?.[0];
  if (!result) return { calls: [], puts: [] };
  
  const underlyingSymbol = result.underlyingSymbol;
  const expirationDates = result.expirationDates || [];
  const strikes = result.strikes || [];
  
  // For simplicity, process only the first expiration date
  const options = result.options[0] || {};
  const calls = (options.calls || []).map((call: any) => ({
    strikePrice: call.strike,
    expiryDate: new Date(call.expiration * 1000).toISOString().split('T')[0],
    type: 'call',
    lastPrice: call.lastPrice,
    change: call.change,
    changePercent: (call.change / (call.lastPrice - call.change)) * 100,
    volume: call.volume || 0,
    openInterest: call.openInterest || 0,
    impliedVolatility: call.impliedVolatility
  }));
  
  const puts = (options.puts || []).map((put: any) => ({
    strikePrice: put.strike,
    expiryDate: new Date(put.expiration * 1000).toISOString().split('T')[0],
    type: 'put',
    lastPrice: put.lastPrice,
    change: put.change,
    changePercent: (put.change / (put.lastPrice - put.change)) * 100,
    volume: put.volume || 0,
    openInterest: put.openInterest || 0,
    impliedVolatility: put.impliedVolatility
  }));
  
  return {
    underlyingSymbol,
    expiryDate: new Date(options.expirationDate * 1000).toISOString().split('T')[0],
    calls,
    puts
  };
}

// Supabase storage functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.41.0';

async function storeStockData(supabase: any, stocks: any[], symbol?: string) {
  for (const stock of stocks) {
    // Check if stock exists
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', stock.symbol)
      .single();
    
    if (existingStock) {
      // Update existing stock
      await supabase
        .from('stocks')
        .update({
          price: stock.price,
          change: stock.change,
          change_percent: stock.changePercent,
          high: stock.high,
          low: stock.low,
          open: stock.open,
          close: stock.close,
          volume: stock.volume,
          market_cap: stock.marketCap,
          updated_at: new Date().toISOString()
        })
        .eq('symbol', stock.symbol);
    } else {
      // Insert new stock
      await supabase
        .from('stocks')
        .insert({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          change_percent: stock.changePercent,
          high: stock.high,
          low: stock.low,
          open: stock.open,
          close: stock.close,
          volume: stock.volume,
          market_cap: stock.marketCap,
          sector: stock.sector
        });
    }
  }
}

async function storeMarketIndices(supabase: any, indices: any[]) {
  for (const index of indices) {
    // Check if index exists
    const { data: existingIndex } = await supabase
      .from('market_indices')
      .select('id')
      .eq('symbol', index.symbol)
      .single();
    
    if (existingIndex) {
      // Update existing index
      await supabase
        .from('market_indices')
        .update({
          value: index.value,
          change: index.change,
          change_percent: index.changePercent,
          high: index.high,
          low: index.low,
          open: index.open,
          updated_at: new Date().toISOString()
        })
        .eq('symbol', index.symbol);
    } else {
      // Insert new index
      await supabase
        .from('market_indices')
        .insert({
          symbol: index.symbol,
          name: index.name,
          value: index.value,
          change: index.change,
          change_percent: index.changePercent,
          high: index.high,
          low: index.low,
          open: index.open
        });
    }
  }
}

async function storeNewsData(supabase: any, newsItems: any[], symbol?: string) {
  for (const item of newsItems) {
    // Check if news exists
    const { data: existingNews } = await supabase
      .from('news')
      .select('id')
      .eq('headline', item.headline)
      .single();
    
    if (!existingNews) {
      // Insert new news
      const { data: news } = await supabase
        .from('news')
        .insert({
          headline: item.headline,
          summary: item.summary,
          url: item.url,
          source: item.source,
          published_at: item.publishedAt,
          sentiment: item.sentiment,
          is_important: item.isImportant
        })
        .select('id')
        .single();
      
      // Insert news-stock relations
      if (news && item.relatedSymbols.length > 0) {
        const newsStockRelations = item.relatedSymbols.map((symbol: string) => ({
          news_id: news.id,
          symbol
        }));
        
        await supabase
          .from('news_stocks')
          .insert(newsStockRelations);
      }
    }
  }
}
