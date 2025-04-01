
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    } else if (responseData && action === 'chart' && symbol) {
      await storeChartData(supabaseAdmin, responseData, symbol);
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
  console.log(`Fetching quote data from: ${yahooUrl}`);
  
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
  
  console.log(`Fetching market summary data`);
  
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
  console.log(`Fetching trending stocks from: ${yahooUrl}`);
  
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trending stocks: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Get quotes for the trending symbols
  if (data?.finance?.result?.[0]?.quotes) {
    const symbols = data.finance.result[0].quotes
      .slice(0, 10)
      .map((quote: any) => quote.symbol)
      .join(',');
    
    return await fetchQuote(symbols);
  }
  
  return [];
}

async function fetchMarketNews(symbol?: string) {
  let yahooUrl = `https://query1.finance.yahoo.com/v2/finance/news`;
  if (symbol) {
    yahooUrl = `https://query1.finance.yahoo.com/v2/finance/news?symbol=${symbol}`;
  }
  
  console.log(`Fetching market news from: ${yahooUrl}`);
  
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market news: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processNewsData(data);
}

async function fetchChartData(symbol: string, interval: string, range: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
  console.log(`Fetching chart data from: ${yahooUrl}`);
  
  const response = await fetch(yahooUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.statusText}`);
  }
  
  const data = await response.json();
  return processChartData(data);
}

async function fetchOptionChain(symbol: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`;
  console.log(`Fetching option chain from: ${yahooUrl}`);
  
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
  const indices = [];
  
  // S&P 500
  if (data[0]?.quoteSummary?.result?.[0]) {
    indices.push({
      symbol: '^GSPC',
      name: 'S&P 500',
      value: data[0].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[0].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[0].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[0].quoteSummary.result[0].summaryDetail.open?.raw || 0,
      high: data[0].quoteSummary.result[0].summaryDetail.dayHigh?.raw || 0,
      low: data[0].quoteSummary.result[0].summaryDetail.dayLow?.raw || 0
    });
  }
  
  // Dow Jones
  if (data[1]?.quoteSummary?.result?.[0]) {
    indices.push({
      symbol: '^DJI',
      name: 'Dow Jones',
      value: data[1].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[1].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[1].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[1].quoteSummary.result[0].summaryDetail.open?.raw || 0,
      high: data[1].quoteSummary.result[0].summaryDetail.dayHigh?.raw || 0,
      low: data[1].quoteSummary.result[0].summaryDetail.dayLow?.raw || 0
    });
  }
  
  // NASDAQ
  if (data[2]?.quoteSummary?.result?.[0]) {
    indices.push({
      symbol: '^IXIC',
      name: 'NASDAQ',
      value: data[2].quoteSummary.result[0].price.regularMarketPrice.raw,
      change: data[2].quoteSummary.result[0].price.regularMarketChange.raw,
      changePercent: data[2].quoteSummary.result[0].price.regularMarketChangePercent.raw,
      open: data[2].quoteSummary.result[0].summaryDetail.open?.raw || 0,
      high: data[2].quoteSummary.result[0].summaryDetail.dayHigh?.raw || 0,
      low: data[2].quoteSummary.result[0].summaryDetail.dayLow?.raw || 0
    });
  }
  
  return indices;
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
    if (quote.open[i] !== null && quote.close[i] !== null) {
      chartData.push({
        timestamp: timestamps[i] * 1000, // Convert to milliseconds
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i]
      });
    }
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
    change: call.change || 0,
    changePercent: call.change && call.lastPrice ? (call.change / (call.lastPrice - call.change)) * 100 : 0,
    volume: call.volume || 0,
    openInterest: call.openInterest || 0,
    impliedVolatility: call.impliedVolatility || 0
  }));
  
  const puts = (options.puts || []).map((put: any) => ({
    strikePrice: put.strike,
    expiryDate: new Date(put.expiration * 1000).toISOString().split('T')[0],
    type: 'put',
    lastPrice: put.lastPrice,
    change: put.change || 0,
    changePercent: put.change && put.lastPrice ? (put.change / (put.lastPrice - put.change)) * 100 : 0,
    volume: put.volume || 0,
    openInterest: put.openInterest || 0,
    impliedVolatility: put.impliedVolatility || 0
  }));
  
  return {
    underlyingSymbol,
    expiryDate: options.expirationDate ? new Date(options.expirationDate * 1000).toISOString().split('T')[0] : '',
    calls,
    puts
  };
}

// Supabase storage functions
async function storeStockData(supabase: any, stocks: any[], symbol?: string) {
  try {
    console.log(`Storing ${stocks.length} stocks in database`);
    
    for (const stock of stocks) {
      // Check if stock exists
      const { data: existingStock } = await supabase
        .from('stocks')
        .select('id')
        .eq('symbol', stock.symbol)
        .single();
      
      if (existingStock) {
        // Update existing stock
        const { error } = await supabase
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
        
        if (error) {
          console.error(`Error updating stock ${stock.symbol}:`, error);
        }
      } else {
        // Insert new stock
        const { error } = await supabase
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
        
        if (error) {
          console.error(`Error inserting stock ${stock.symbol}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in storeStockData:", error);
  }
}

async function storeMarketIndices(supabase: any, indices: any[]) {
  try {
    console.log(`Storing ${indices.length} indices in database`);
    
    for (const index of indices) {
      // Check if index exists
      const { data: existingIndex } = await supabase
        .from('market_indices')
        .select('id')
        .eq('symbol', index.symbol)
        .single();
      
      if (existingIndex) {
        // Update existing index
        const { error } = await supabase
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
        
        if (error) {
          console.error(`Error updating index ${index.symbol}:`, error);
        }
      } else {
        // Insert new index
        const { error } = await supabase
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
        
        if (error) {
          console.error(`Error inserting index ${index.symbol}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in storeMarketIndices:", error);
  }
}

async function storeNewsData(supabase: any, newsItems: any[], symbol?: string) {
  try {
    console.log(`Storing ${newsItems.length} news items in database`);
    
    for (const item of newsItems) {
      // Check if news exists
      const { data: existingNews } = await supabase
        .from('news')
        .select('id')
        .eq('headline', item.headline)
        .single();
      
      if (!existingNews) {
        // Insert new news
        const { data: news, error } = await supabase
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
        
        if (error) {
          console.error(`Error inserting news item "${item.headline}":`, error);
          continue;
        }
        
        // Insert news-stock relations
        if (news && item.relatedSymbols.length > 0) {
          const newsStockRelations = item.relatedSymbols.map((symbol: string) => ({
            news_id: news.id,
            symbol
          }));
          
          const { error: relError } = await supabase
            .from('news_stocks')
            .insert(newsStockRelations);
          
          if (relError) {
            console.error(`Error inserting news-stock relations for news ${news.id}:`, relError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in storeNewsData:", error);
  }
}

async function storeChartData(supabase: any, chartData: any[], symbol: string) {
  try {
    console.log(`Storing ${chartData.length} chart data points for ${symbol}`);
    
    for (const dataPoint of chartData) {
      const timestamp = new Date(dataPoint.timestamp).toISOString();
      
      // Check if data point exists
      const { data: existingPoint } = await supabase
        .from('chart_data')
        .select('id')
        .eq('symbol', symbol)
        .eq('timestamp', timestamp)
        .single();
      
      if (existingPoint) {
        // Update existing data point
        const { error } = await supabase
          .from('chart_data')
          .update({
            open: dataPoint.open,
            high: dataPoint.high,
            low: dataPoint.low,
            close: dataPoint.close,
            volume: dataPoint.volume
          })
          .eq('id', existingPoint.id);
        
        if (error) {
          console.error(`Error updating chart data point for ${symbol} at ${timestamp}:`, error);
        }
      } else {
        // Insert new data point
        const { error } = await supabase
          .from('chart_data')
          .insert({
            symbol,
            timestamp,
            open: dataPoint.open,
            high: dataPoint.high,
            low: dataPoint.low,
            close: dataPoint.close,
            volume: dataPoint.volume
          });
        
        if (error) {
          console.error(`Error inserting chart data point for ${symbol} at ${timestamp}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in storeChartData:", error);
  }
}
