import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle, Bot, Zap, X, Info, AlertTriangle, RefreshCw, FileImage } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { extractTextFromImage, parseBillData } from '@/utils/billOCR'
import { categorizeExpense } from '@/utils/smartCategorization'

interface EnhancedBillUploadProps {
  userId: string
  onUploadSuccess: () => void
}

interface UploadProgress {
  file: string
  progress: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
  stage?: string
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function EnhancedBillUpload({ userId, onUploadSuccess }: EnhancedBillUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [bulkUploadProgress, setBulkUploadProgress] = useState<UploadProgress[]>([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [processingStage, setProcessingStage] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [lastError, setLastError] = useState<string>('')
  const { toast } = useToast()

  const validateFileType = (file: File): { isValid: boolean; error?: string } => {
    console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size)
    
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Please upload JPG, PNG, or WebP images.`
      }
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size too large (${Math.round(file.size / 1024 / 1024)}MB). Please upload files smaller than 10MB.`
      }
    }
    
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File appears to be empty. Please select a valid file.'
      }
    }
    
    return { isValid: true }
  }

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      console.log('Single file selected:', file.name, file.type, file.size)
      
      const validation = validateFileType(file)
      
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        })
        e.target.value = ''
        return
      }
      
      setFiles([file])
      setProcessingStage('')
      setProcessingProgress(0)
      setLastError('')
    }
  }

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      console.log('Multiple files selected:', selectedFiles.length)
      
      const validFiles: File[] = []
      const invalidFiles: string[] = []
      
      selectedFiles.forEach(file => {
        const validation = validateFileType(file)
        if (validation.isValid) {
          validFiles.push(file)
        } else {
          invalidFiles.push(`${file.name}: ${validation.error}`)
        }
      })
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Some files were skipped",
          description: invalidFiles.slice(0, 3).join('\n') + (invalidFiles.length > 3 ? `\n...and ${invalidFiles.length - 3} more` : ''),
          variant: "destructive"
        })
      }
      
      if (validFiles.length > 0) {
        setFiles(validFiles)
        
        const progress = validFiles.map(file => ({
          file: file.name,
          progress: 0,
          status: 'pending' as const,
          stage: 'Ready'
        }))
        setBulkUploadProgress(progress)
        
        toast({
          title: "Files ready",
          description: `${validFiles.length} valid files selected for processing.`,
        })
      }
    }
  }

  const processSingleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setProcessingProgress(0)
    setLastError('')
    const file = files[0]

    try {
      console.log('Starting single file upload for:', file.name, file.type)
      
      // Stage 1: Extract text
      setProcessingStage('Extracting text from image...')
      setProcessingProgress(10)
      
      const extractedText = await extractTextFromImage(file)
      console.log('Text extraction completed, length:', extractedText.length)
      setProcessingProgress(30)
      
      // Stage 2: Parse bill data
      setProcessingStage('Analyzing bill content...')
      const billData = parseBillData(extractedText)
      console.log('Bill data parsed:', billData)
      setProcessingProgress(50)
      
      // Stage 3: Smart categorization
      setProcessingStage('Applying smart categorization...')
      const categoryResult = categorizeExpense(extractedText, billData.companyName)
      const smartCategory = categoryResult.category
      console.log('Smart categorization result:', smartCategory)
      setProcessingProgress(70)
      
      // Stage 4: Upload to storage
      setProcessingStage('Uploading file to storage...')
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/single/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bills')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
      }
      setProcessingProgress(85)

      const { data: urlData } = supabase.storage
        .from('bills')
        .getPublicUrl(fileName)

      // Stage 5: Save to database
      setProcessingStage('Saving bill information...')
      const { error: dbError } = await supabase
        .from('bills')
        .insert({
          user_id: userId,
          company_name: billData.companyName || `Auto-detected from ${file.name}`,
          service_type: smartCategory,
          amount: billData.amount || 0,
          bill_date: billData.billDate || new Date().toISOString().split('T')[0],
          file_url: urlData.publicUrl,
          analysis_status: 'completed',
          ocr_confidence: billData.confidence,
          account_number: billData.accountNumber,
          due_date: billData.dueDate,
          previous_balance: billData.previousBalance,
          current_charges: billData.currentCharges,
          tax_amount: billData.taxAmount,
          contact_info: billData.contactInfo ? JSON.stringify(billData.contactInfo) : null,
          service_details: billData.serviceDetails ? JSON.stringify(billData.serviceDetails) : null
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      setProcessingStage('Completed!')
      setProcessingProgress(100)
      
      toast({
        title: "Bill uploaded successfully!",
        description: `${billData.companyName} - $${billData.amount} (${Math.round(billData.confidence * 100)}% confidence)`,
      })

      onUploadSuccess()
      setFiles([])
      setProcessingStage('')
      setProcessingProgress(0)

      // Clear file input
      const fileInput = document.getElementById('single-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (error: any) {
      console.error('Single upload error:', error)
      setProcessingStage('Failed')
      setLastError(error.message || 'Unknown error occurred')
      
      let errorMessage = "Failed to process the bill. Please try again."
      let errorTitle = "Upload failed"
      
      if (error.message) {
        errorMessage = error.message
        
        if (error.message.includes('image')) {
          errorTitle = "Image Processing Failed"
        } else if (error.message.includes('text')) {
          errorTitle = "Text Extraction Failed"
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setTimeout(() => {
        if (processingStage === 'Completed!' || processingStage === 'Failed') {
          setProcessingStage('')
          setProcessingProgress(0)
        }
      }, 3000)
    }
  }

  const retryUpload = () => {
    setLastError('')
    setProcessingStage('')
    setProcessingProgress(0)
    processSingleUpload()
  }


  const processBulkUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const results = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      setBulkUploadProgress(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing', progress: 10, stage: 'Starting...' } : item
      ))

      try {
        console.log(`Processing bulk file ${i + 1}/${files.length}:`, file.name)
        
        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 25, stage: 'Extracting text...' } : item
        ))
        
        const extractedText = await extractTextFromImage(file)
        const billData = parseBillData(extractedText)
        
        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 50, stage: 'Analyzing content...' } : item
        ))

        const categoryResult = categorizeExpense(extractedText, billData.companyName)
        const smartCategory = categoryResult.category
        
        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 70, stage: 'Uploading...' } : item
        ))
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/bulk/${Date.now()}-${i}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bills')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('bills')
          .getPublicUrl(fileName)

        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, progress: 90, stage: 'Saving...' } : item
        ))

        const { error: dbError } = await supabase
          .from('bills')
          .insert({
            user_id: userId,
            company_name: billData.companyName || `Auto-detected from ${file.name}`,
            service_type: smartCategory,
            amount: billData.amount || 0,
            bill_date: billData.billDate || new Date().toISOString().split('T')[0],
            file_url: urlData.publicUrl,
            analysis_status: 'completed',
            ocr_confidence: billData.confidence,
            account_number: billData.accountNumber,
            due_date: billData.dueDate,
            previous_balance: billData.previousBalance,
            current_charges: billData.currentCharges,
            tax_amount: billData.taxAmount,
            contact_info: billData.contactInfo ? JSON.stringify(billData.contactInfo) : null,
            service_details: billData.serviceDetails ? JSON.stringify(billData.serviceDetails) : null
          })

        if (dbError) throw dbError

        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'completed', progress: 100, stage: 'Completed' } : item
        ))

        results.push({ file: file.name, success: true })

      } catch (error: any) {
        console.error(`Bulk processing error for ${file.name}:`, error)
        setBulkUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'error', error: error.message || 'Processing failed', stage: 'Failed' } : item
        ))
        results.push({ file: file.name, success: false, error: error.message })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    toast({
      title: "Bulk upload completed",
      description: `${successful} files processed successfully${failed > 0 ? `, ${failed} failed` : ''}.`,
      variant: successful > 0 ? "default" : "destructive"
    })

    if (successful > 0) {
      onUploadSuccess()
    }

    setUploading(false)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setBulkUploadProgress(bulkUploadProgress.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setFiles([])
    setBulkUploadProgress([])
    setProcessingStage('')
    setProcessingProgress(0)
    setLastError('')
    
    const singleInput = document.getElementById('single-file') as HTMLInputElement
    const bulkInput = document.getElementById('bulk-files') as HTMLInputElement
    if (singleInput) singleInput.value = ''
    if (bulkInput) bulkInput.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Bills
        </CardTitle>
        <CardDescription>
          Upload bill images for automatic text extraction and categorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Best results:</strong> Use JPG, PNG, or WebP images. For PDFs, convert to image format first for better text extraction.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Upload</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="single-file">Select Bill Image</Label>
                <Input
                  id="single-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleSingleFileChange}
                  disabled={uploading}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{files[0].name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(files[0].size / 1024)}KB)
                      </span>
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFiles}
                          className="ml-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {processingStage && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {processingStage === 'Failed' ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : processingStage === 'Completed!' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                          )}
                          <span className={
                            processingStage === 'Failed' ? 'text-destructive' : 
                            processingStage === 'Completed!' ? 'text-green-600' : 
                            'text-primary'
                          }>
                            {processingStage}
                          </span>
                        </div>
                        
                        {uploading && processingProgress > 0 && (
                          <Progress value={processingProgress} className="h-2" />
                        )}
                        
                        {lastError && (
                          <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <p className="text-destructive font-medium">Error Details:</p>
                              <p className="text-muted-foreground">{lastError}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={processSingleUpload} 
                      disabled={uploading} 
                      className="flex-1"
                    >
                      {uploading ? 'Processing...' : 'Upload & Analyze'}
                    </Button>
                    
                    {lastError && !uploading && (
                      <Button 
                        onClick={retryUpload}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm">Upload multiple bills at once for batch processing</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-files">Select Multiple Bill Documents</Label>
                <Input
                  id="bulk-files"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleMultipleFileChange}
                  disabled={uploading}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{files.length} files selected</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFiles}
                      disabled={uploading}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files.map((file, index) => {
                      const progress = bulkUploadProgress[index]
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <FileText className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(file.size / 1024)}KB
                            </p>
                            {progress && (
                              <div className="space-y-1 mt-1">
                                <Progress value={progress.progress} className="h-1" />
                                <p className="text-xs text-muted-foreground">
                                  {progress.status === 'pending' && 'Waiting...'}
                                  {progress.status === 'processing' && (
                                    <span className="text-primary">{progress.stage}</span>
                                  )}
                                  {progress.status === 'completed' && (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Completed
                                    </span>
                                  )}
                                  {progress.status === 'error' && (
                                    <span className="text-destructive flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      Error: {progress.error}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>

                  <Button 
                    onClick={processBulkUpload} 
                    disabled={uploading} 
                    className="w-full"
                  >
                    {uploading ? 'Processing Bulk Upload...' : `Process ${files.length} Bills`}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
