import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlaceSearchRequest {
  query: string
  location: string
  type: string
  radius?: number
}

interface LocationAutocompleteRequest {
  input: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    if (action === 'autocomplete') {
      const { input }: LocationAutocompleteRequest = await req.json()
      
      // Google Places Autocomplete API
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`
      
      const response = await fetch(autocompleteUrl)
      const data = await response.json()
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`)
      }
      
      const suggestions = data.predictions?.map((prediction: any) => ({
        description: prediction.description,
        place_id: prediction.place_id,
        structured_formatting: prediction.structured_formatting
      })) || []
      
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'search') {
      const { query, location, type, radius = 5000 }: PlaceSearchRequest = await req.json()
      
      // First geocode the location to get coordinates
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
      const geocodeResponse = await fetch(geocodeUrl)
      const geocodeData = await geocodeResponse.json()
      
      if (geocodeData.status !== 'OK') {
        throw new Error(`Geocoding failed: ${geocodeData.status}`)
      }
      
      const { lat, lng } = geocodeData.results[0].geometry.location
      
      // Map search types to Google Places types
      const placeTypes = {
        restaurant: 'restaurant',
        gym: 'gym',
        coffee: 'cafe',
        hotel: 'lodging',
        service: 'establishment'
      }
      
      const placeType = placeTypes[type as keyof typeof placeTypes] || 'establishment'
      
      // Search for places using Google Places Nearby Search API
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&keyword=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`
      
      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()
      
      if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        throw new Error(`Places search failed: ${searchData.status}`)
      }
      
      // Get detailed information for each place
      const places = await Promise.all(
        (searchData.results || []).slice(0, 5).map(async (place: any) => {
          try {
            // Get place details
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,price_level,opening_hours,reviews&key=${GOOGLE_MAPS_API_KEY}`
            const detailsResponse = await fetch(detailsUrl)
            const detailsData = await detailsResponse.json()
            
            if (detailsData.status !== 'OK') {
              console.warn(`Failed to get details for place ${place.place_id}:`, detailsData.status)
              return null
            }
            
            const details = detailsData.result
            
            // Calculate distance from search location
            const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
            
            // Calculate scores based on available data
            const priceScore = calculatePriceScore(details.price_level)
            const qualityScore = calculateQualityScore(details.rating, details.reviews?.length || 0)
            const serviceScore = calculateServiceScore(details.rating, details.opening_hours?.open_now, details.reviews)
            
            return {
              id: place.place_id,
              name: details.name,
              type: place.types?.[0]?.replace(/_/g, ' ') || type,
              rating: details.rating || 0,
              price: formatPriceLevel(details.price_level),
              distance: `${distance.toFixed(1)} km`,
              address: details.formatted_address,
              phone: details.formatted_phone_number || 'N/A',
              website: details.website,
              priceScore,
              qualityScore,
              serviceScore,
              openNow: details.opening_hours?.open_now,
              reviews: details.reviews?.slice(0, 3) || []
            }
          } catch (error) {
            console.error('Error getting place details:', error)
            return null
          }
        })
      )
      
      const validPlaces = places.filter(place => place !== null)
      
      return new Response(JSON.stringify({ places: validPlaces }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

function calculatePriceScore(priceLevel?: number): number {
  // Higher score for lower price levels (better value)
  if (priceLevel === undefined) return 70
  const scores = [95, 85, 70, 55, 40] // 0-4 price levels
  return scores[priceLevel] || 70
}

function calculateQualityScore(rating?: number, reviewCount?: number): number {
  if (!rating) return 60
  
  // Base score from rating (0-5 -> 0-100)
  let score = (rating / 5) * 100
  
  // Boost for higher review counts (credibility)
  if (reviewCount > 100) score = Math.min(score + 10, 100)
  else if (reviewCount > 50) score = Math.min(score + 5, 100)
  
  return Math.round(score)
}

function calculateServiceScore(rating?: number, openNow?: boolean, reviews?: any[]): number {
  if (!rating) return 60
  
  let score = (rating / 5) * 100
  
  // Bonus for being open now
  if (openNow) score = Math.min(score + 5, 100)
  
  // Analyze recent reviews for service mentions
  if (reviews && reviews.length > 0) {
    const serviceKeywords = ['service', 'staff', 'friendly', 'helpful', 'quick', 'fast']
    const positiveServiceReviews = reviews.filter(review => 
      serviceKeywords.some(keyword => 
        review.text?.toLowerCase().includes(keyword) && review.rating >= 4
      )
    )
    
    if (positiveServiceReviews.length > 0) {
      score = Math.min(score + 5, 100)
    }
  }
  
  return Math.round(score)
}

function formatPriceLevel(priceLevel?: number): string {
  if (priceLevel === undefined) return 'N/A'
  const levels = ['Free', '$', '$$', '$$$', '$$$$']
  return levels[priceLevel] || 'N/A'
}