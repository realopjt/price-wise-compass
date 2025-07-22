import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Edit, Copy, Trash2, File, CheckCircle, AlertCircle, DollarSign, Package, TrendingDown, Home, MapPin, Crown, CreditCard, Settings } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from '@/integrations/supabase/client'
import { ReceiptScanner } from './ReceiptScanner'
import { EnhancedBillUpload } from './EnhancedBillUpload'
import { MyPlan } from './MyPlan'
import PayPalIntegration from './PayPalIntegration'
import { LocationFinder } from './LocationFinder'
import { RecommendationsList } from './RecommendationsList'
import { CustomerSupport } from './CustomerSupport'
import { findCheaperAlternatives } from '@/utils/priceComparison'

interface Bill {
  id: string
  company_name: string
  service_type: string
  amount: number
  bill_date: string
  file_url: string
  analysis_status: string
  ocr_confidence: number
}

interface Recommendation {
  id: string
  vendor_name: string
  service_description: string
  original_price: number
  recommended_price: number
  savings_amount: number
  vendor_url: string
  status: string
}

interface DashboardProps {
  user: any
  onSignOut: () => Promise<void>
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activeTab, setActiveTab] = useState('upload')
  const { toast } = useToast()

  // Map of bill ID to best alternative (vendor and price). This allows the UI to display a "Better Alternative" column.
  const [billAlternatives, setBillAlternatives] = useState<{ [key: string]: { vendor: string; price: number } | null }>({})

  useEffect(() => {
    if (user && user.id) {
      loadBills()
      loadRecommendations()
    }
  }, [user])

  const loadBills = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('bill_date', { ascending: false })

      if (error) throw error
      const billsData = data || []
      setBills(billsData)

      // After fetching bills, compute best cheaper alternative for each bill using the price comparison utility
      const altMap: { [key: string]: { vendor: string; price: number } | null } = {}
      await Promise.all(
        billsData.map(async (bill: Bill) => {
          try {
            const result = await findCheaperAlternatives(bill.service_type || bill.company_name, bill.amount, false)
            const bestAlt = result.alternatives?.[0]
            if (bestAlt) {
              altMap[bill.id] = { vendor: bestAlt.vendor, price: bestAlt.price }
            } else {
              altMap[bill.id] = null
            }
          } catch (err) {
            console.warn('Failed to get alternative for bill', bill.id, err)
            altMap[bill.id] = null
          }
        })
      )
      setBillAlternatives(altMap)
    } catch (error: any) {
      toast({
        title: "Failed to load bills",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (error) throw error
      setRecommendations(data || [])
    } catch (error: any) {
      console.error('Failed to load recommendations:', error)
    }
  }

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ status: 'dismissed' })
        .eq('id', recommendationId)

      if (error) throw error
      setRecommendations(recommendations.filter(rec => rec.id !== recommendationId))
      toast({
        title: "Recommendation dismissed",
        description: "This recommendation will no longer be displayed.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to dismiss recommendation",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 border-b">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PriceWise</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:grid-cols-9 h-auto">
                <TabsTrigger value="upload" className="flex flex-col gap-1 py-2">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex flex-col gap-1 py-2">
                  <File className="h-4 w-4" />
                  <span className="text-xs">Scan</span>
                </TabsTrigger>
                <TabsTrigger value="bills" className="flex flex-col gap-1 py-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Bills</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex flex-col gap-1 py-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs">Savings</span>
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex flex-col gap-1 py-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">PayPal</span>
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex flex-col gap-1 py-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Places</span>
                </TabsTrigger>
                <TabsTrigger value="plan" className="flex flex-col gap-1 py-2">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs">My Plan</span>
                </TabsTrigger>
                <TabsTrigger value="extension" className="flex flex-col gap-1 py-2">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Extension</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex flex-col gap-1 py-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Support</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <EnhancedBillUpload 
                  userId={user.id} 
                  onUploadSuccess={loadBills}
                />
              </TabsContent>

              <TabsContent value="scan">
                <ReceiptScanner 
                  userId={user.id} 
                  onScanSuccess={loadBills}
                />
              </TabsContent>

              <TabsContent value="bills">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      My Bills
                    </CardTitle>
                    <CardDescription>
                      Manage your uploaded bills and track your expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[220px]" />
                      </div>
                    ) : bills.length > 0 ? (
                      <Table>
                        <TableCaption>A list of your uploaded bills.</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px]">Company</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Better Alternative</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                           {bills.map((bill) => (
                             <TableRow key={bill.id}>
                               <TableCell className="font-medium">{bill.company_name}</TableCell>
                               <TableCell>{bill.service_type}</TableCell>
                               <TableCell>${bill.amount.toFixed(2)}</TableCell>
                               <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                               <TableCell>
                                 {billAlternatives[bill.id] ? (
                                   <span>
                                     {billAlternatives[bill.id]?.vendor}: ${billAlternatives[bill.id]?.price.toFixed(2)}
                                   </span>
                                 ) : (
                                   <span className="text-muted-foreground text-sm">N/A</span>
                                 )}
                               </TableCell>
                               <TableCell className="text-right">
                                 <div className="flex gap-2 justify-end">
                                   {bill.file_url && (
                                     <Button 
                                       variant="outline" 
                                       size="sm"
                                       onClick={() => window.open(bill.file_url, '_blank')}
                                     >
                                       <File className="h-4 w-4 mr-2" />
                                       View Bill
                                     </Button>
                                   )}
                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button variant="ghost" size="sm">
                                         <Trash2 className="h-4 w-4 mr-2" />
                                         Delete
                                       </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                       <AlertDialogHeader>
                                         <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                           This action cannot be undone. This will permanently delete your bill from our servers.
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                                         <AlertDialogAction>Continue</AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>
                                 </div>
                               </TableCell>
                             </TableRow>
                           ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">No bills uploaded yet</p>
                        <p className="text-muted-foreground">Start by uploading your first bill using the form above</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <RecommendationsList userId={user.id} />
              </TabsContent>

              <TabsContent value="paypal">
                <PayPalIntegration />
              </TabsContent>

              <TabsContent value="locations">
                <LocationFinder userId={user.id} />
              </TabsContent>

              <TabsContent value="plan">
                <MyPlan userId={user.id} />
              </TabsContent>

              <TabsContent value="support">
                <CustomerSupport />
              </TabsContent>

              <TabsContent value="extension">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Browser Extension
                    </CardTitle>
                    <CardDescription>
                      Install our browser extension to find deals automatically while shopping
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-2 border-dashed border-primary/30 hover:border-primary transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="font-semibold mb-2">Chrome & Edge</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Download for Chrome and Edge browsers (Manifest V3)
                          </p>
                           <Button 
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                             onClick={() => {
                               // Create a zip of browser extension files and download
                               const link = document.createElement('a')
                               link.href = '/browser-extension.zip' // This would need to be created server-side
                               link.download = 'pricewise-chrome-extension.zip'
                               link.click()
                               toast({
                                 title: "Download Started",
                                 description: "Follow the installation instructions after download completes.",
                               })
                             }}
                           >
                             Download for Chrome
                           </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-warning/30 hover:border-warning transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Package className="w-6 h-6 text-warning" />
                          </div>
                          <h3 className="font-semibold mb-2">Firefox</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Download for Firefox browser (Manifest V2)
                          </p>
                           <Button 
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                             onClick={() => {
                               const link = document.createElement('a')
                               link.href = '/browser-extension-firefox.zip'
                               link.download = 'pricewise-firefox-extension.zip'
                               link.click()
                               toast({
                                 title: "Download Started",
                                 description: "Follow the Firefox installation instructions after download.",
                               })
                             }}
                           >
                             Download for Firefox
                           </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-success/30 hover:border-success transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Package className="w-6 h-6 text-success" />
                          </div>
                          <h3 className="font-semibold mb-2">Safari</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Download for Safari browser (requires Xcode)
                          </p>
                           <Button 
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                             onClick={() => {
                               toast({
                                 title: "Safari Extension",
                                 description: "Safari extension requires manual conversion using Xcode. Contact support for assistance.",
                               })
                             }}
                           >
                             Download for Safari
                           </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Installation Instructions</h3>
                      {/*
                        The browser extension can be installed in Chrome/Edge, Firefox and Safari.
                        Safari users currently need to convert the extension using Xcode because
                        Apple requires Safari Web Extensions to be packaged inside a signed app.
                        These instructions provide basic guidance for each browser.
                      */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">Chrome/Edge:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Download the extension file above</li>
                            <li>Open Chrome/Edge and go to Extensions</li>
                            <li>Enable "Developer mode"</li>
                            <li>Click "Load unpacked" and select the extracted folder</li>
                            <li>The extension will appear in your toolbar</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Firefox:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Download the Firefox extension file</li>
                            <li>Open Firefox and go to about:debugging</li>
                            <li>Click "This Firefox" → "Load Temporary Add-on"</li>
                            <li>Select the <code>manifest.json</code> file</li>
                            <li>The extension will be active in your browser</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Safari:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Download the Safari version or the Chrome version (to convert)</li>
                            <li>Open Safari and go to <strong>Settings → Extensions</strong></li>
                            <li>If using the Chrome build, open the project in Xcode (File → Import → Existing Extension)</li>
                            <li>Build and run the extension in Xcode to create a signed app</li>
                            <li>Enable the extension in Safari; it will now appear in the toolbar</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        What the extension does:
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Automatically detects product pages and search results</li>
                        <li>• Shows green $ icons next to products with better alternatives</li>
                        <li>• Provides instant price comparisons and reviews</li>
                        <li>• Works on Google, Amazon, eBay, Walmart, Target, and more</li>
                        <li>• Completely free with your PriceWise account</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <aside className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || "Profile"} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account ID</Label>
                  <Input id="account" value={user?.id || "N/A"} readOnly />
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/profile'}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={onSignOut} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tips & Tricks</CardTitle>
                <CardDescription>Maximize your savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upload clear bill images</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear images ensure accurate data extraction and better recommendations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Categorize expenses</h4>
                  <p className="text-sm text-muted-foreground">
                    Proper categorization helps in identifying areas where you can cut costs.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Review recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Take action on recommendations to start saving money on your bills.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}