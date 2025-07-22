import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Receipt, Sparkles, AlertCircle, CheckCircle, DollarSign, Package, TrendingDown, Camera } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { findCheaperAlternatives } from '@/utils/priceComparison'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { extractTextFromImage, parseReceiptData } from '@/utils/receiptOCR'

interface ReceiptScannerProps {
  userId: string
  onScanSuccess: () => void
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  category: string
  alternatives?: {
    vendor: string
    price: number
    savings: number
    url: string
  }[]
}

export function ReceiptScanner({ userId, onScanSuccess }: ReceiptScannerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [storeName, setStoreName] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [recommendations, setRecommendations] = useState<any[]>([])
  // Toggle for including global supermarket pricing when generating recommendations
  const [includeGlobal, setIncludeGlobal] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [showCameraError, setShowCameraError] = useState(false)
  const [cameraErrorMessage, setCameraErrorMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Helper function to wait until video has enough data for capture
  const waitForVideoReady = async (timeout = 2000) => {
    if (!videoRef.current) return false;
    const video = videoRef.current;
    const interval = 100;
    let elapsed = 0;
    return new Promise<boolean>((resolve) => {
      const checkReady = () => {
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
          resolve(true);
        } else if (elapsed >= timeout) {
          resolve(false);
        } else {
          elapsed += interval;
          setTimeout(checkReady, interval);
        }
      };
      checkReady();
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      if (selectedFile.type.startsWith('image/')) {
        await scanReceipt(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive"
        })
      }
    }
  }

  const startCamera = async () => {
    // Reset any previous camera errors when attempting to start the camera again
    setShowCameraError(false);
    setCameraErrorMessage('');
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera Not Supported",
          description: "Your browser doesn't support camera access. Please use file upload instead.",
          variant: "destructive",
        });
        return;
      }

      console.log('Requesting camera access...');
      
      // Progressive constraint fallback for better compatibility
      const constraintOptions = [
        // First try: Back camera with high resolution
        {
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            aspectRatio: { ideal: 16/9 }
          },
          audio: false
        },
        // Second try: Any back camera
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        },
        // Third try: Any camera with good resolution
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        },
        // Final fallback: Basic video constraints
        {
          video: true,
          audio: false
        }
      ];

      let stream = null;
      let lastError = null;

      // Try each constraint until one works
      for (const constraints of constraintOptions) {
        try {
          console.log('Trying camera constraints:', constraints);
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera access granted with constraints:', constraints);
          break;
        } catch (error: any) {
          console.warn('Camera constraints failed:', constraints, error);
          lastError = error;
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('All camera constraint options failed');
      }
      
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Enhanced video setup with better error handling
        const setupVideo = () => {
          return new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video element not available'));
              return;
            }

            const video = videoRef.current;
            let resolved = false;

            const onLoadedMetadata = () => {
              console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
              
              video.play().then(() => {
                console.log('Video playing successfully');
                if (!resolved) {
                  resolved = true;
                  resolve();
                }
              }).catch(reject);
            };

            const onError = (error: any) => {
              console.error('Video element error:', error);
              if (!resolved) {
                resolved = true;
                reject(new Error('Video setup failed'));
              }
            };

            // Set up event listeners
            video.onloadedmetadata = onLoadedMetadata;
            video.onerror = onError;

            // Timeout fallback
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                reject(new Error('Video setup timeout'));
              }
            }, 10000);

            // Force load if metadata is already available
            if (video.readyState >= video.HAVE_METADATA) {
              onLoadedMetadata();
            }
          });
        };

        try {
          await setupVideo();
          toast({
            title: "Camera Ready",
            description: "Position your receipt clearly in the frame and tap capture.",
          });
        } catch (setupError) {
          console.error('Video setup failed:', setupError);
          throw new Error('Failed to initialize camera preview');
        }
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      
      // Clean up on error
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setShowCamera(false);
      setShowCameraError(true);
      
      let errorMessage = "Unable to access camera. Please use file upload instead.";
      let errorTitle = "Camera Error";
      
      if (error.name === 'NotAllowedError') {
        errorTitle = "Permission Denied";
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError') {
        errorTitle = "No Camera Found";
        errorMessage = "No camera device found. Please connect a camera or use file upload instead.";
      } else if (error.name === 'NotSupportedError') {
        errorTitle = "Not Supported";
        errorMessage = "Camera not supported on this device. Please use file upload.";
      } else if (error.name === 'NotReadableError') {
        errorTitle = "Camera Busy";
        errorMessage = "Camera is being used by another application. Please close other apps and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorTitle = "Camera Constraints";
        errorMessage = "Camera doesn't support the required settings. Please try file upload.";
      }
      
      setCameraErrorMessage(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    console.log('Capture button clicked!');
    
    if (!videoRef.current || !canvasRef.current) {
      const errorMsg = "Camera not ready. Please try again.";
      console.error(errorMsg);
      toast({
        title: "Capture Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    // Wait for video data to be available
    const ready = await waitForVideoReady();
    if (!ready) {
      const errorMsg = "Video is not ready. Please wait a moment and try again.";
      console.error(errorMsg);
      setShowCameraError(true);
      setCameraErrorMessage("Camera failed to initialize properly. Please check your camera permissions and try again.");
      toast({
        title: "Capture Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    console.log('Starting photo capture...');
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "Canvas Error",
        description: "Failed to initialize canvas. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log('Image drawn to canvas');
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        console.log('Blob created successfully, size:', blob.size);
        const file = new File([blob], 'receipt-capture.jpg', { type: 'image/jpeg' });
        
        toast({
          title: "Photo Captured!",
          description: "Processing your receipt image...",
        });
        
        await scanReceipt(file);
        setFile(file);
        stopCamera();
      } else {
        const errorMsg = "Failed to create image from camera. Please try again.";
        console.error(errorMsg);
        toast({
          title: "Capture Failed",
          description: errorMsg,
          variant: "destructive"
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    console.log('Cancel button clicked!');
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const scanReceipt = async (file: File) => {
    setScanning(true)
    
    try {
      toast({
        title: "Scanning receipt...",
        description: "Extracting items and prices from your receipt. This may take a moment.",
      })

      const extractedText = await extractTextFromImage(file)
      const receiptData = parseReceiptData(extractedText)
      
      setStoreName(receiptData.storeName || 'Unknown Store')
      setReceiptDate(receiptData.date || new Date().toISOString().split('T')[0])
      setTotalAmount(receiptData.total || 0)
      setItems(receiptData.items || [])
      setConfidence(receiptData.confidence)
      
      if (receiptData.items && receiptData.items.length > 0) {
        toast({
          title: "Receipt scanned successfully!",
          description: `Found ${receiptData.items.length} items with ${Math.round(receiptData.confidence * 100)}% confidence.`,
        })
        
        // Generate recommendations for each item
        await generateRecommendations(receiptData.items)
      } else {
        toast({
          title: "No items found",
          description: "Could not extract item information. Please try a clearer image.",
          variant: "default"
        })
      }
      
    } catch (error: any) {
      console.error('Receipt scanning failed:', error)
      toast({
        title: "Scanning failed",
        description: "Could not process the receipt. Please try again with a clearer image.",
        variant: "destructive"
      })
    } finally {
      setScanning(false)
    }
  }

  const generateRecommendations = async (items: ReceiptItem[]) => {
    try {
      // Call recommendation engine for each item
      const itemRecommendations = []
      
      for (const item of items) {
        // Use enhanced price comparison utility to find cheaper alternatives
        const priceResult = await findCheaperAlternatives(item.name, item.price, includeGlobal)
        const alternatives = priceResult.alternatives || []
        if (alternatives.length > 0) {
          const bestAlternative = alternatives[0]
          const savings = item.price - bestAlternative.price
          // Only recommend if savings > $0.50
          if (savings > 0.5) {
            itemRecommendations.push({
              id: `rec-${item.name}-${Date.now()}`,
              item_name: item.name,
              current_price: item.price,
              recommended_vendor: bestAlternative.vendor,
              recommended_price: bestAlternative.price,
              savings: savings,
              category: item.category,
              purchase_url: bestAlternative.url,
              status: 'active'
            })
          }
        }
      }
      
      setRecommendations(itemRecommendations)
      
      if (itemRecommendations.length > 0) {
        const totalSavings = itemRecommendations.reduce((sum, rec) => sum + rec.savings, 0)
        toast({
          title: "Recommendations generated!",
          description: `Found ${itemRecommendations.length} money-saving opportunities worth $${totalSavings.toFixed(2)}.`,
        })
      }
      
    } catch (error: any) {
      console.error('Recommendation generation failed:', error)
    }
  }

  /**
   * Deprecated: Previously used a static list of alternatives for price comparisons.
   * We now use the enhanced priceComparisonUtils.findCheaperAlternatives API instead.
   */

  const saveReceipt = async () => {
    try {
      // Upload file to Supabase storage
      const fileExt = file!.name.split('.').pop()
      const fileName = `${userId}/receipts/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bills')
        .upload(fileName, file!)

      if (uploadError) throw uploadError

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('bills')
        .getPublicUrl(fileName)

      // Save receipt data to bills table
      const { data: receiptData, error: receiptError } = await supabase
        .from('bills')
        .insert({
          user_id: userId,
          company_name: storeName,
          service_type: 'Receipt Scan',
          amount: totalAmount,
          bill_date: receiptDate,
          file_url: urlData.publicUrl,
          analysis_status: 'completed',
          ocr_confidence: confidence
        })
        .select()

      if (receiptError) throw receiptError

      // Save recommendations to database
      if (recommendations.length > 0) {
        const recommendationsToSave = recommendations.map(rec => ({
          user_id: userId,
          bill_id: receiptData[0].id,
          vendor_name: rec.recommended_vendor,
          service_description: `${rec.item_name} - Better price available`,
          original_price: rec.current_price,
          recommended_price: rec.recommended_price,
          savings_amount: rec.savings,
          vendor_url: rec.purchase_url,
          status: 'active'
        }))

        const { error: recError } = await supabase
          .from('recommendations')
          .insert(recommendationsToSave)

        if (recError) {
          console.error('Failed to save recommendations:', recError)
        }
      }

      toast({
        title: "Receipt saved successfully!",
        description: `Receipt and ${recommendations.length} recommendations have been saved.`,
      })

      // Reset form
      setFile(null)
      setItems([])
      setRecommendations([])
      setStoreName('')
      setReceiptDate('')
      setTotalAmount(0)
      setConfidence(0)
      
      const fileInput = document.getElementById('receipt-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      
      onScanSuccess()

    } catch (error: any) {
      console.error('Save failed:', error)
      toast({
        title: "Save failed",
        description: error.message || "Failed to save receipt data.",
        variant: "destructive"
      })
    }
  }

  const actOnRecommendation = (recommendation: any) => {
    window.open(recommendation.purchase_url, '_blank')
    toast({
      title: "Purchase page opened",
      description: `Opened ${recommendation.recommended_vendor} to purchase ${recommendation.item_name}`,
    })
  }

  if (showCamera) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Camera Scanner
          </CardTitle>
          <CardDescription>
            Position your receipt in the camera view and tap capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => {
                console.log('Capture button clicked!');
                capturePhoto();
              }} 
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Receipt
            </Button>
            <Button 
              onClick={() => {
                console.log('Cancel button clicked!');
                stopCamera();
              }} 
              variant="outline"
            >
              Cancel
            </Button>
          </div>
          
          {/* Display camera error messages */}
          {showCameraError && cameraErrorMessage && (
            <div className="text-red-600 text-sm text-center">
              {cameraErrorMessage}
            </div>
          )}

          {/* Debug info */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Debug: Video ready state: {videoRef.current?.readyState || 'N/A'} | 
            Dimensions: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Receipt Scanner
          {scanning && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
        </CardTitle>
        <CardDescription>
          Scan receipts to analyze individual items and get personalized money-saving recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="receipt-file">Receipt Image</Label>
          <div className="flex items-center gap-2">
            <Input
              id="receipt-file"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              disabled={scanning}
            />
            <Button onClick={startCamera} variant="outline" size="sm" disabled={scanning}>
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>
          {file && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              {file.name}
            </div>
          )}
          {scanning && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Scanning receipt and analyzing items...
            </div>
          )}
        </div>

        {/* Receipt Info */}
        {items.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Store Name</Label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
              </div>
            </div>

            {/* Scanned Items */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Scanned Items ({items.length})
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {item.category}
                      </Badge>
                      {item.quantity > 1 && (
                        <span className="text-sm text-muted-foreground ml-2">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Toggle for including global stores in recommendations */}
            <div className="flex items-center gap-2">
              <Switch
                id="include-global"
                checked={includeGlobal}
                onCheckedChange={(checked: boolean) => setIncludeGlobal(checked)}
              />
              <Label htmlFor="include-global">
                Include global store data
              </Label>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  Money-Saving Recommendations ({recommendations.length})
                </h4>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-success/20 rounded-lg p-4 bg-success/5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium">{rec.item_name}</h5>
                          <p className="text-sm text-muted-foreground">
                            Currently: ${rec.current_price.toFixed(2)} → {rec.recommended_vendor}: ${rec.recommended_price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-success/10 text-success border-success/20">
                              Save ${rec.savings.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => actOnRecommendation(rec)}
                          className="ml-4"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-success">
                    Total Potential Savings: ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button 
              onClick={saveReceipt} 
              className="w-full"
              disabled={!file || items.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Receipt & Recommendations
            </Button>
          </div>
        )}

        {/* Instructions */}
        {items.length === 0 && !scanning && (
          <div className="text-center py-8 space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">How it works</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Take a clear photo of your receipt</p>
                <p>2. Upload the image using the button above</p>
                <p>3. AI will extract items and find better prices</p>
                <p>4. Get instant recommendations to save money</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Supports grocery, retail, restaurant, and office supply receipts</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}