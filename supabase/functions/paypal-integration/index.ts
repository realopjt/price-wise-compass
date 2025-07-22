
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalTransaction {
  transaction_info: {
    transaction_id: string;
    transaction_amount: {
      currency_code: string;
      value: string;
    };
    transaction_initiation_date: string;
    transaction_updated_date: string;
    transaction_status: string;
  };
  payer_info?: {
    account_id: string;
    email_address?: string;
  };
  cart_info?: {
    item_details?: Array<{
      item_name?: string;
      item_description?: string;
    }>;
  };
}

const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal token request failed:', errorText);
    throw new Error(`PayPal token request failed: ${response.statusText}`);
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
};

const createPayPalOrder = async (amount: number, currency: string = 'USD'): Promise<PayPalOrderResponse> => {
  const accessToken = await getPayPalAccessToken();
  
  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      },
      description: 'PriceWise Subscription Payment'
    }],
    application_context: {
      return_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/paypal-integration?action=success`,
      cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/paypal-integration?action=cancel`,
      brand_name: 'PriceWise',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW'
    }
  };

  const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal order creation failed:', errorText);
    throw new Error(`PayPal order creation failed: ${response.statusText}`);
  }

  return await response.json();
};

const capturePayPalOrder = async (orderId: string): Promise<any> => {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal order capture failed:', errorText);
    throw new Error(`PayPal order capture failed: ${response.statusText}`);
  }

  return await response.json();
};

const generatePayPalOAuthUrl = (): string => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '');

  if (!clientId) {
    throw new Error('PayPal Client ID not configured in Supabase secrets');
  }

  // Construct redirect URI dynamically based on Supabase URL. This avoids hardcoding
  // a specific project domain and prevents invalid redirect_uri errors when the
  // project changes. See https://developer.paypal.com/docs/api/ for details.
  const redirectUri = `${baseUrl}/functions/v1/paypal-integration?action=oauth_callback`;
  
  const scopes = [
    'openid',
    'profile',
    'email',
    'https://uri.paypal.com/services/payments/payment/read'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    nonce: crypto.randomUUID(),
    state: crypto.randomUUID()
  });

  console.log('Generated PayPal OAuth URL with redirect_uri:', redirectUri);
  return `https://www.sandbox.paypal.com/signin/authorize?${params.toString()}`;
};

const exchangeCodeForTokens = async (code: string): Promise<any> => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '');

  const credentials = btoa(`${clientId}:${clientSecret}`);
  // Use dynamic redirect URI to match the OAuth URL generator
  const redirectUri = `${baseUrl}/functions/v1/paypal-integration?action=oauth_callback`;

  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json();
};

const getPayPalTransactions = async (accessToken: string): Promise<PayPalTransaction[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

  const params = new URLSearchParams({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    fields: 'all',
    page_size: '100'
  });

  const response = await fetch(`https://api-m.sandbox.paypal.com/v1/reporting/transactions?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transaction fetch failed:', errorText);
    throw new Error(`Transaction fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.transaction_details || [];
};

const analyzeTransactions = (transactions: PayPalTransaction[]): any => {
  const analyzedTransactions = transactions.map(transaction => {
    const amount = parseFloat(transaction.transaction_info.transaction_amount.value);
    const itemName = transaction.cart_info?.item_details?.[0]?.item_name || 'Unknown Purchase';
    
    // Simple savings calculation logic
    let potentialSavings = 0;
    let alternativeFound = false;
    
    // Mock analysis - in real implementation, this would call external APIs
    if (itemName.toLowerCase().includes('netflix') || itemName.toLowerCase().includes('streaming')) {
      potentialSavings = Math.min(amount * 0.3, 5.99);
      alternativeFound = true;
    } else if (itemName.toLowerCase().includes('subscription')) {
      potentialSavings = Math.min(amount * 0.2, 10.00);
      alternativeFound = true;
    } else if (amount > 50) {
      potentialSavings = Math.min(amount * 0.15, 25.00);
      alternativeFound = true;
    }

    return {
      id: transaction.transaction_info.transaction_id,
      date: transaction.transaction_info.transaction_initiation_date.split('T')[0],
      merchant: itemName,
      amount: amount,
      category: itemName.toLowerCase().includes('subscription') ? 'Subscription' : 'Purchase',
      potential_savings: potentialSavings,
      alternative_found: alternativeFound
    };
  });

  const totalSavings = analyzedTransactions.reduce((sum, t) => sum + (t.potential_savings || 0), 0);

  return {
    transactions: analyzedTransactions,
    totalSavings: totalSavings
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`PayPal Integration function called with method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  // Handle PayPal OAuth callback
  if (action === 'oauth_callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      return new Response(
        `<html><body><script>
          window.opener.postMessage({
            type: 'paypal_oauth_error',
            error: '${error}'
          }, '*');
          window.close();
        </script></body></html>`,
        {
          headers: { 'Content-Type': 'text/html', ...corsHeaders }
        }
      );
    }

    if (code) {
      try {
        const tokens = await exchangeCodeForTokens(code);
        const transactions = await getPayPalTransactions(tokens.access_token);
        const analysis = analyzeTransactions(transactions);
        
        console.log('PayPal OAuth successful, found transactions:', transactions.length);
        
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'paypal_oauth_success',
              data: ${JSON.stringify(analysis)}
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'paypal_oauth_error',
              error: '${error.message}'
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      }
    }
  }

  // Handle PayPal return callbacks for payments
  if (action === 'success') {
    const token = url.searchParams.get('token');
    
    if (token) {
      try {
        const captureResult = await capturePayPalOrder(token);
        console.log('Payment captured successfully:', captureResult);
        
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'paypal_payment_success',
              data: ${JSON.stringify(captureResult)}
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      } catch (error: any) {
        console.error('Error capturing payment:', error);
        return new Response(
          `<html><body><script>
            window.opener.postMessage({
              type: 'paypal_payment_error',
              error: '${error.message}'
            }, '*');
            window.close();
          </script></body></html>`,
          {
            headers: { 'Content-Type': 'text/html', ...corsHeaders }
          }
        );
      }
    }
  }

  if (action === 'cancel') {
    return new Response(
      `<html><body><script>
        window.opener.postMessage({
          type: 'paypal_payment_cancelled'
        }, '*');
        window.close();
      </script></body></html>`,
      {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      }
    );
  }

  // Handle API requests
  try {
    const body = await req.json();
    const { action: requestAction, planId, amount, billingCycle, userId, transactions } = body;
    
    console.log('Processing request:', { requestAction, planId, amount, billingCycle, userId });

    if (requestAction === 'get_oauth_url') {
      try {
        const oauthUrl = generatePayPalOAuthUrl();
        
        return new Response(
          JSON.stringify({
            success: true,
            oauth_url: oauthUrl
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      } catch (error: any) {
        console.error('OAuth URL generation failed:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

    if (requestAction === 'analyze') {
      if (!transactions || !Array.isArray(transactions)) {
        return new Response(
          JSON.stringify({ error: 'Invalid transactions data' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Re-analyze the transactions with updated logic
      const analysis = analyzeTransactions(transactions);
      
      return new Response(
        JSON.stringify({
          success: true,
          totalSavings: analysis.totalSavings,
          transactions: analysis.transactions
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (requestAction === 'create_subscription') {
      if (!planId || !amount || !userId) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Create PayPal order
      const order = await createPayPalOrder(amount);
      
      // Find the approval URL
      const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;
      
      if (!approvalUrl) {
        throw new Error('No approval URL found in PayPal response');
      }

      console.log('PayPal order created:', order.id);
      
      return new Response(
        JSON.stringify({
          success: true,
          orderId: order.id,
          approvalUrl
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in PayPal integration function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
