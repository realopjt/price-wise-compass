import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { MapPin, Search, Star, DollarSign, Clock, Phone, Navigation } from 'lucide-react'

interface LocationFinderProps {
  userId: string
}

export function LocationFinder({ userId }: LocationFinderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('restaurant')
  const [location, setLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle location input change and fetch Google Places autocomplete
  const handleLocationChange = async (value: string) => {
    setLocation(value)
    
    if (value.length > 2) {
      setLoadingSuggestions(true)
      try {
        const { data, error } = await supabase.functions.invoke('google-places/autocomplete', {
          body: { input: value }
        })
        
        if (error) {
          throw new Error(error.message)
        }
        
        setLocationSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
        // Fallback to local suggestions if API fails
        const fallbackSuggestions = [
          { description: `${value}, United States` },
          { description: `${value}, United Kingdom` },
          { description: `${value}, Canada` },
          { description: `${value}, Australia` },
          { description: `${value}, Germany` }
        ]
        setLocationSuggestions(fallbackSuggestions)
        setShowSuggestions(true)
      } finally {
        setLoadingSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    setLocation(suggestion.description)
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get current location using GPS
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      })
      return
    }

    setGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use a simpler approach with OpenStreetMap (free) for reverse geocoding
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            
            if (response.ok) {
              const data = await response.json()
              if (data && data.display_name) {
                setLocation(data.display_name)
                toast({
                  title: "Location found!",
                  description: `Using your current location: ${data.display_name}`,
                })
                return
              }
            }
          } catch (reverseError) {
            console.log('Reverse geocoding failed, using coordinates')
          }
          
          // Fallback: use coordinates
          setLocation(`${latitude}, ${longitude}`)
          toast({
            title: "Location found!",
            description: "Using your GPS coordinates",
          })
        } catch (error) {
          console.error('Error getting location:', error)
          toast({
            title: "Location error",
            description: "Failed to get your location. Please enter manually.",
            variant: "destructive"
          })
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let message = "Failed to get your location. Please enter manually."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please allow location access and try again."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable. Please enter manually."
            break
          case error.TIMEOUT:
            message = "Location request timed out. Please try again."
            break
        }
        
        toast({
          title: "Location error",
          description: message,
          variant: "destructive"
        })
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Missing location",
        description: "Please enter your location to search for nearby options.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    setResults([])
    
    try {
      const { data, error } = await supabase.functions.invoke('google-places/search', {
        body: {
          query: searchQuery.trim() || searchType, // Use category if no specific search term
          location: location,
          type: searchType,
          radius: 5000
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setResults(data.places || [])
      
      if (data.places && data.places.length > 0) {
        const searchTerm = searchQuery.trim() || `${searchType}s`
        toast({
          title: "Search completed!",
          description: `Found ${data.places.length} ${searchTerm} near ${location}`,
        })
      } else {
        const searchTerm = searchQuery.trim() || searchType
        toast({
          title: "No results found",
          description: searchQuery.trim() 
            ? `No ${searchType}s found matching "${searchQuery}" near ${location}. Try different search terms or a broader location.`
            : `No ${searchType}s found near ${location}. Try a different location or category.`,
          variant: "default"
        })
      }
      
    } catch (error: any) {
      console.error('Search error:', error)
      toast({
        title: "Search failed",
        description: error.message || "Please check your internet connection and try again.",
        variant: "destructive"
      })
      
      // Show sample data as fallback
      const sampleResults = {
        restaurant: [
          {
            id: 'sample-1',
            name: "Rosemary's Kitchen",
            type: "Italian Restaurant",
            rating: 4.8,
            price: "$$",
            distance: "0.3 km",
            address: "Sample address - Google Maps integration needed",
            phone: "(555) 123-4567",
            priceScore: 85,
            qualityScore: 92,
            serviceScore: 89
          }
        ],
        gym: [
          {
            id: 'sample-2',
            name: "FitZone Premium",
            type: "Fitness Center",
            rating: 4.7,
            price: "$45/month",
            distance: "0.5 km",
            address: "Sample address - Google Maps integration needed",
            phone: "(555) 456-7890",
            priceScore: 90,
            qualityScore: 85,
            serviceScore: 88
          }
        ]
      }
      
      setResults(sampleResults[searchType as keyof typeof sampleResults] || [])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Intelligent Location Finder
          </CardTitle>
          <CardDescription>
            Find the best restaurants, gyms, and services based on price, quality, and reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">What are you looking for?</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="gym">Gym/Fitness</SelectItem>
                  <SelectItem value="coffee">Coffee Shop</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="service">Professional Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search Term (optional)</label>
              <Input
                placeholder={`e.g. ${searchType === 'restaurant' ? 'Italian food' : searchType === 'gym' ? 'CrossFit gym' : searchType === 'other' ? 'bookstore, pharmacy, etc.' : 'local business'} (optional)`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={locationInputRef}>
              <label className="text-sm font-medium mb-2 block">Your location (worldwide)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city, country or use GPS"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => location.length > 2 && setShowSuggestions(true)}
                  disabled={loadingSuggestions || gettingLocation}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation || loadingSuggestions}
                  title="Use my current location"
                >
                  <Navigation className={`h-4 w-4 ${gettingLocation ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              {loadingSuggestions && (
                <div className="absolute right-3 top-9 text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {suggestion.description || suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !location.trim()} 
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Find Best Options'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended {searchType}s near you</h3>
          {results.map((result) => (
            <Card key={result.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{result.name}</h3>
                      <Badge variant="secondary">{result.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{result.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{result.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{result.distance}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.address}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{result.phone}</span>
                    </div>
                  </div>
                  
                  <div className="ml-6 text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-lg font-bold ${getScoreColor(result.priceScore)}`}>
                          {result.priceScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Price</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${getScoreColor(result.qualityScore)}`}>
                          {result.qualityScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Quality</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${getScoreColor(result.serviceScore)}`}>
                          {result.serviceScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Service</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (result.phone && result.phone !== 'N/A') {
                        // Try to initiate a phone call
                        const phoneNumber = result.phone.replace(/\D/g, '') // Remove non-digits
                        window.open(`tel:+${phoneNumber}`, '_self')
                        
                        toast({
                          title: "Calling...",
                          description: `Attempting to call ${result.name}`,
                        })
                      } else {
                        toast({
                          title: "Phone not available",
                          description: "No phone number available for this business.",
                          variant: "destructive"
                        })
                      }
                    }}
                    disabled={!result.phone || result.phone === 'N/A'}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      if (result.address) {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}`
                        window.open(mapsUrl, '_blank')
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Create a comprehensive booking experience
                      const businessName = encodeURIComponent(result.name)
                      const businessAddress = encodeURIComponent(result.address)
                      
                      // Try different booking platforms based on business type
                      if (searchType === 'restaurant') {
                        // Try OpenTable first, then generic search
                        const openTableUrl = `https://www.opentable.com/s?restaurantName=${businessName}&covers=2&dateTime=2024-01-01T19%3A00%3A00`
                        window.open(openTableUrl, '_blank')
                        
                        toast({
                          title: "Opening reservation system",
                          description: `Searching for reservations at ${result.name}`,
                        })
                      } else if (searchType === 'gym') {
                        // Try ClassPass or gym's website
                        const searchUrl = `https://classpass.com/search?query=${businessName}`
                        window.open(searchUrl, '_blank')
                        
                        toast({
                          title: "Opening booking system",
                          description: `Searching for classes at ${result.name}`,
                        })
                      } else if (searchType === 'hotel') {
                        // Try major booking sites
                        const bookingUrl = `https://www.booking.com/searchresults.html?ss=${businessAddress}&checkin=2024-01-01&checkout=2024-01-02`
                        window.open(bookingUrl, '_blank')
                        
                        toast({
                          title: "Opening hotel booking",
                          description: `Searching for availability at ${result.name}`,
                        })
                      } else {
                        // For other services, try to find their website or booking page
                        if (result.website) {
                          window.open(result.website, '_blank')
                          toast({
                            title: "Opening website",
                            description: `Visit ${result.name}'s website to book services`,
                          })
                        } else {
                          // Fallback to Google search for booking
                          const googleSearchUrl = `https://www.google.com/search?q=${businessName}+${businessAddress}+book+appointment+reservation`
                          window.open(googleSearchUrl, '_blank')
                          
                          toast({
                            title: "Searching for booking options",
                            description: `Finding ways to book with ${result.name}`,
                          })
                        }
                      }
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Book/Reserve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results message */}
      {!loading && results.length === 0 && location && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {searchQuery.trim() 
                    ? `We couldn't find any ${searchType}s matching "${searchQuery}" near ${location}.`
                    : `We couldn't find any ${searchType}s near ${location}.`
                  } Try adjusting your search terms, using a broader location, or selecting a different category.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation('')}>
                  Change location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}