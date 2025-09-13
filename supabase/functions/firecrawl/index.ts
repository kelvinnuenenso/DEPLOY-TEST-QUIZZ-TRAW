import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Firecrawl API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { pathname } = new URL(req.url);
    
    // Handle API key validation
    if (pathname.endsWith('/validate')) {
      console.log('Validating Firecrawl API key');
      
      // Simple validation - check if key format is correct
      const authHeader = req.headers.get('Authorization');
      const apiKey = authHeader?.replace('Bearer ', '') || '';
      
      if (!apiKey.startsWith('fc-')) {
        return new Response(JSON.stringify({ valid: false, error: 'Invalid API key format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Test with a simple request to Firecrawl
      const testResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          limit: 1,
          scrapeOptions: {
            formats: ['markdown'],
          }
        })
      });

      const isValid = testResponse.ok;
      console.log(`API key validation result: ${isValid}`);

      return new Response(JSON.stringify({ valid: isValid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle scraping requests
    if (pathname.endsWith('/scrape')) {
      const requestData = await req.json();
      const { url, formats = ['markdown', 'html'], includeTags, waitFor } = requestData;
      
      console.log(`Scraping URL: ${url}`);

      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats,
          includeTags,
          waitFor: waitFor || 2000,
          onlyMainContent: false,
          screenshot: false,
        })
      });

      if (!scrapeResponse.ok) {
        const errorText = await scrapeResponse.text();
        console.error(`Firecrawl API error: ${scrapeResponse.status} - ${errorText}`);
        return new Response(JSON.stringify({ 
          error: `Firecrawl API error: ${scrapeResponse.status}`,
          details: errorText
        }), {
          status: scrapeResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await scrapeResponse.json();
      console.log('Scraping successful');

      return new Response(JSON.stringify(result.data || result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle crawling requests (for batch processing)
    if (pathname.endsWith('/crawl')) {
      const requestData = await req.json();
      const { url, limit = 10, formats = ['markdown', 'html'] } = requestData;
      
      console.log(`Crawling URL: ${url} with limit: ${limit}`);

      const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          limit,
          scrapeOptions: {
            formats,
            onlyMainContent: false,
          }
        })
      });

      if (!crawlResponse.ok) {
        const errorText = await crawlResponse.text();
        console.error(`Firecrawl crawl API error: ${crawlResponse.status} - ${errorText}`);
        return new Response(JSON.stringify({ 
          error: `Firecrawl crawl API error: ${crawlResponse.status}`,
          details: errorText
        }), {
          status: crawlResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await crawlResponse.json();
      console.log('Crawling initiated successfully');

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in firecrawl function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});