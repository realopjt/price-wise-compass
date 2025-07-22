import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateCheckRequest {
  action: string;
  currentVersion: string;
  browser: string;
}

interface UpdateInfo {
  updateAvailable: boolean;
  latestVersion: string;
  downloadUrl?: string;
  releaseNotes?: string;
  critical?: boolean;
}

// Version information for different browsers
const EXTENSION_VERSIONS = {
  chrome: {
    latest: "1.2.0",
    downloadUrl: "https://chrome.google.com/webstore/detail/pricewise/",
    releaseNotes: "• Enhanced price detection\n• Better cross-browser support\n• Auto-update system\n• Performance improvements"
  },
  firefox: {
    latest: "1.2.0", 
    downloadUrl: "https://addons.mozilla.org/en-US/firefox/addon/pricewise/",
    releaseNotes: "• Enhanced price detection\n• Better cross-browser support\n• Auto-update system\n• Performance improvements"
  },
  edge: {
    latest: "1.2.0",
    downloadUrl: "https://microsoftedge.microsoft.com/addons/detail/pricewise/",
    releaseNotes: "• Enhanced price detection\n• Better cross-browser support\n• Auto-update system\n• Performance improvements"
  },
  safari: {
    latest: "1.2.0",
    downloadUrl: "https://apps.apple.com/us/app/pricewise/",
    releaseNotes: "• Enhanced price detection\n• Better cross-browser support\n• Auto-update system\n• Performance improvements"
  }
};

function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

function checkForUpdates(currentVersion: string, browser: string): UpdateInfo {
  const browserInfo = EXTENSION_VERSIONS[browser as keyof typeof EXTENSION_VERSIONS];
  
  if (!browserInfo) {
    return {
      updateAvailable: false,
      latestVersion: currentVersion
    };
  }
  
  const isUpdateAvailable = compareVersions(currentVersion, browserInfo.latest) < 0;
  
  return {
    updateAvailable: isUpdateAvailable,
    latestVersion: browserInfo.latest,
    downloadUrl: browserInfo.downloadUrl,
    releaseNotes: browserInfo.releaseNotes,
    critical: false // Set to true for security updates
  };
}

async function handler(req: Request): Promise<Response> {
  console.log('Extension Updates function called with method:', req.method);
  console.log('Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const requestData: UpdateCheckRequest = await req.json();
      console.log('Update check request:', requestData);

      if (requestData.action === 'check_version') {
        const updateInfo = checkForUpdates(
          requestData.currentVersion, 
          requestData.browser
        );
        
        console.log('Update check result:', updateInfo);
        
        return new Response(
          JSON.stringify({
            success: true,
            ...updateInfo
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }

    if (req.method === 'GET') {
      // Serve update manifest for automatic updates
      const url = new URL(req.url);
      const browser = url.searchParams.get('browser') || 'chrome';
      const browserInfo = EXTENSION_VERSIONS[browser as keyof typeof EXTENSION_VERSIONS];
      
      if (browserInfo) {
        return new Response(
          JSON.stringify({
            addons: {
              'pricewise@extension': {
                updates: [
                  {
                    version: browserInfo.latest,
                    update_link: browserInfo.downloadUrl
                  }
                ]
              }
            }
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid request' 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Extension updates error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}

serve(handler);