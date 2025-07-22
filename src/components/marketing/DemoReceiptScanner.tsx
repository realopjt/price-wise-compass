import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Receipt, Sparkles, CheckCircle, DollarSign, Package, TrendingDown, Camera } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DemoReceiptItem {
  name: string
  quantity: number
  price: number
  category: string
}

interface DemoRecommendation {
  item_name: string
  current_price: number
  recommended_vendor: string
  recommended_price: number
  savings: number
}

export function DemoReceiptScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<DemoReceiptItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [storeName, setStoreName] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [recommendations, setRecommendations] = useState<DemoRecommendation[]>([])
  const [showCamera, setShowCamera] = useState(false)
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
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Capture Error",
        description: "Camera not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Wait for video data to be available
    const ready = await waitForVideoReady();
    if (!ready) {
      toast({
        title: "Capture Error",
        description: "Video is not ready. Please wait a moment and try again.",
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
          description: "Processing your demo receipt...",
        });
        
        await scanReceipt(file);
        setFile(file);
        stopCamera();
      } else {
        toast({
          title: "Capture Failed",
          description: "Failed to create image from camera. Please try again.",
          variant: "destructive"
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
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
        description: "Extracting items and prices from your receipt. This is a demo.",
      })

      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Demo data
      const demoItems: DemoReceiptItem[] = [
        { name: "Organic Bananas", quantity: 2, price: 4.99, category: "Produce" },
        { name: "Whole Milk", quantity: 1, price: 3.49, category: "Dairy" },
        { name: "Greek Yogurt", quantity: 3, price: 12.97, category: "Dairy" },
        { name: "Chicken Breast", quantity: 2, price: 15.98, category: "Meat" },
        { name: "Bread", quantity: 1, price: 2.99, category: "Bakery" }
      ]

      const demoTotal = demoItems.reduce((sum, item) => sum + item.price, 0)
      
      setStoreName('Demo Grocery Store')
      setReceiptDate(new Date().toISOString().split('T')[0])
      setTotalAmount(demoTotal)
      setItems(demoItems)
      
      toast({
        title: "Receipt scanned successfully!",
        description: `Found ${demoItems.length} items. This is a demo showing PriceWise capabilities.`,
      })
      
      // Generate demo recommendations
      setTimeout(() => {
        const demoRecommendations: DemoRecommendation[] = [
          {
            item_name: "Organic Bananas",
            current_price: 4.99,
            recommended_vendor: "Walmart",
            recommended_price: 3.99,
            savings: 1.00
          },
          {
            item_name: "Greek Yogurt",
            current_price: 12.97,
            recommended_vendor: "Amazon Fresh",
            recommended_price: 10.99,
            savings: 1.98
          },
          {
            item_name: "Chicken Breast",
            current_price: 15.98,
            recommended_vendor: "Costco",
            recommended_price: 12.99,
            savings: 2.99
          }
        ]
        
        setRecommendations(demoRecommendations)
        
        const totalSavings = demoRecommendations.reduce((sum, rec) => sum + rec.savings, 0)
        toast({
          title: "Recommendations generated!",
          description: `Found ${demoRecommendations.length} money-saving opportunities worth $${totalSavings.toFixed(2)}.`,
        })
      }, 1000)
      
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

  const actOnRecommendation = (recommendation: DemoRecommendation) => {
    toast({
      title: "Demo Mode",
      description: `In the full version, this would open ${recommendation.recommended_vendor} to purchase ${recommendation.item_name}. Sign up to access real recommendations!`,
    })
  }

  const handleSignup = () => {
    toast({
      title: "Sign up to continue",
      description: "Create an account to save your receipts and get real recommendations.",
    })
    // Scroll to auth section or redirect
    const authElement = document.getElementById('auth-section')
    if (authElement) {
      authElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (showCamera) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Camera Scanner (Demo)
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
          <Badge variant="outline" className="ml-auto">Demo</Badge>
        </CardTitle>
        <CardDescription>
          Try our receipt scanning technology - upload a receipt to see how PriceWise analyzes items and finds savings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="demo-receipt-file">Receipt Image</Label>
          <div className="flex items-center gap-2">
            <Input
              id="demo-receipt-file"
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

        {/* Demo Notice */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
          <strong>Demo Mode:</strong> Upload any receipt image to see how our AI analyzes items and finds better prices. 
          Real scanning requires an account.
        </div>

        {/* Receipt Info */}
        {items.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Store Name</Label>
                <Input value={storeName} disabled />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={receiptDate} disabled />
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
                            <Badge variant="outline" className="text-xs">Demo</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => actOnRecommendation(rec)}
                          className="ml-4"
                          variant="outline"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Try Demo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-success">
                    Total Potential Savings: ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign up to access real recommendations and save on your actual purchases
                  </p>
                </div>
              </div>
            )}

            {/* Sign Up Button */}
            <Button 
              onClick={handleSignup} 
              className="w-full"
              disabled={!file || items.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sign Up to Save Receipts & Get Real Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}