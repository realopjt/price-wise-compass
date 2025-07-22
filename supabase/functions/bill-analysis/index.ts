import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BillData {
  amount: number;
  billDate: string;
  companyName: string;
  serviceType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName } = await req.json();
    console.log(`Processing file: ${fileName}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Download the file from Supabase storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file from storage');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Determine file type from filename
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      mimeType = 'image/jpeg';
    }

    console.log(`File type detected: ${mimeType}`);

    // Use OpenAI Vision API to extract text and analyze the bill
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a bill analysis expert. Extract key information from bills and invoices. Return a JSON object with these exact fields:
            - amount: number (the total amount due or billed, no currency symbols)
            - billDate: string (in YYYY-MM-DD format)
            - companyName: string (the company/provider name)
            - serviceType: string (choose from: Internet/Telecom, Utilities, Insurance, Software/SaaS, Office Supplies, Professional Services, Marketing/Advertising, Maintenance/Repairs, Other)
            
            If you cannot find a specific field, use these defaults:
            - amount: 0
            - billDate: current date in YYYY-MM-DD format
            - companyName: "Unknown Provider"
            - serviceType: "Other"
            
            Return ONLY valid JSON, no other text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this bill and extract the amount, bill date, company name, and service type.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64File}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', extractedText);

    // Parse the JSON response
    let billData: BillData;
    try {
      billData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', extractedText);
      // Fallback to default values
      billData = {
        amount: 0,
        billDate: new Date().toISOString().split('T')[0],
        companyName: "Unknown Provider",
        serviceType: "Other"
      };
    }

    // Validate and sanitize the extracted data
    const sanitizedData = {
      amount: typeof billData.amount === 'number' ? Math.max(0, billData.amount) : 0,
      billDate: billData.billDate || new Date().toISOString().split('T')[0],
      companyName: billData.companyName || "Unknown Provider",
      serviceType: billData.serviceType || "Other"
    };

    console.log('Extracted bill data:', sanitizedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: sanitizedData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in bill-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis failed' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});