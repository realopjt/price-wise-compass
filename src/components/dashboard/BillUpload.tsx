
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, DollarSign, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { extractTextFromImage, parseBillData } from '@/utils/billOCR'

interface BillUploadProps {
  userId: string
  onUploadSuccess: () => void
}

export function BillUpload({ userId, onUploadSuccess }: BillUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [amount, setAmount] = useState('')
  const [billDate, setBillDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number>(0)
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set())
  const [ocrAttempted, setOcrAttempted] = useState(false)
  const { toast } = useToast()

  const serviceTypes = [
    'Internet/Telecom',
    'Utilities',
    'Insurance',
    'Software/SaaS',
    'Office Supplies',
    'Professional Services',
    'Marketing/Advertising',
    'Maintenance/Repairs',
    'Other'
  ]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Reset previous OCR state
      setOcrAttempted(false)
      setExtractedFields(new Set())
      setOcrConfidence(0)
      
      console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type)
      
      // Only analyze image files
      if (selectedFile.type.startsWith('image/')) {
        await analyzeFile(selectedFile)
      } else {
        console.log('Non-image file selected, skipping OCR')
        toast({
          title: "File uploaded",
          description: "Non-image file selected. Please enter bill details manually.",
          variant: "default"
        })
        setOcrAttempted(true) // Allow manual entry
      }
    }
  }

  const analyzeFile = async (file: File) => {
    setAnalyzing(true)
    
    try {
      console.log('Starting OCR analysis for:', file.name)
      toast({
        title: "Analyzing bill...",
        description: "Extracting information from your bill image. This may take a moment.",
      })

      const extractedText = await extractTextFromImage(file)
      console.log('OCR text extracted, length:', extractedText.length)
      
      const billData = parseBillData(extractedText)
      console.log('Parsed bill data:', billData)
      
      const newExtractedFields = new Set<string>()
      
      // Auto-populate fields with extracted data
      if (billData.companyName && billData.companyName !== 'Auto-detected from file') {
        setCompanyName(billData.companyName)
        newExtractedFields.add('companyName')
        console.log('Company name auto-populated:', billData.companyName)
      }
      
      if (billData.amount > 0) {
        setAmount(billData.amount.toString())
        newExtractedFields.add('amount')
        console.log('Amount auto-populated:', billData.amount)
      }
      
      if (billData.billDate) {
        setBillDate(billData.billDate)
        newExtractedFields.add('billDate')
        console.log('Bill date auto-populated:', billData.billDate)
      }
      
      if (billData.serviceType !== 'Other') {
        setServiceType(billData.serviceType)
        newExtractedFields.add('serviceType')
        console.log('Service type auto-populated:', billData.serviceType)
      }
      
      setExtractedFields(newExtractedFields)
      setOcrConfidence(billData.confidence)
      
      if (billData.confidence > 0.3 && newExtractedFields.size > 0) {
        toast({
          title: "Bill analyzed successfully!",
          description: `Information extracted with ${Math.round(billData.confidence * 100)}% confidence. Auto-filled ${newExtractedFields.size} field(s).`,
        })
      } else {
        toast({
          title: "Analysis completed",
          description: "Limited information could be extracted. Please fill in or verify the details below.",
          variant: "default"
        })
      }
      
    } catch (error: any) {
      console.error('Bill analysis failed:', error)
      toast({
        title: "Analysis failed",
        description: "Could not extract information automatically. Please enter details manually.",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
      setOcrAttempted(true) // Always allow manual entry after OCR attempt
    }
  }

  // Validation function
  const validateForm = () => {
    const errors: string[] = []
    
    if (!file) {
      errors.push("Please select a bill file to upload.")
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      errors.push("Please enter a valid bill amount.")
    }
    
    if (!billDate) {
      errors.push("Please enter the bill date.")
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('User ID:', userId)
    console.log('Form data:', { companyName, serviceType, amount, billDate, file: file?.name })
    
    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Please fix the following errors:",
        description: validationErrors.join(" "),
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      console.log('Starting file upload to Supabase storage...')
      
      // Upload file to Supabase storage
      const fileExt = file!.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bills')
        .upload(fileName, file!)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      console.log('File uploaded successfully:', uploadData)

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('bills')
        .getPublicUrl(fileName)

      console.log('File URL generated:', urlData.publicUrl)

      // Prepare enhanced bill data for database
      let billDataToInsert: any = {
        user_id: userId,
        company_name: companyName || 'Auto-detected from file',
        service_type: serviceType || 'Other',
        amount: parseFloat(amount),
        bill_date: billDate,
        file_url: urlData.publicUrl,
        analysis_status: 'completed',
        ocr_confidence: ocrConfidence
      }

      // Add enhanced OCR data if available and file is an image
      if (file!.type.startsWith('image/') && ocrConfidence > 0) {
        try {
          console.log('Re-parsing OCR data for enhanced fields...')
          const extractedText = await extractTextFromImage(file!)
          const enhancedBillData = parseBillData(extractedText)
          
          // Add enhanced fields to database insert
          billDataToInsert = {
            ...billDataToInsert,
            account_number: enhancedBillData.accountNumber || null,
            due_date: enhancedBillData.dueDate || null,
            previous_balance: enhancedBillData.previousBalance || null,
            current_charges: enhancedBillData.currentCharges || null,
            tax_amount: enhancedBillData.taxAmount || null,
            contact_info: enhancedBillData.contactInfo ? JSON.stringify(enhancedBillData.contactInfo) : null,
            service_details: enhancedBillData.serviceDetails ? JSON.stringify(enhancedBillData.serviceDetails) : null
          }
          
          console.log('Enhanced bill data prepared:', billDataToInsert)
        } catch (error) {
          console.error('Failed to extract enhanced OCR data:', error)
          // Continue with basic data if enhanced extraction fails
        }
      }

      console.log('Inserting bill data to database:', billDataToInsert)

      // Save bill data to database
      const { data: billData, error: dbError } = await supabase
        .from('bills')
        .insert(billDataToInsert)
        .select()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('Bill data saved successfully:', billData)

      toast({
        title: "Bill uploaded successfully!",
        description: "Your bill has been saved and is ready for analysis.",
      })

      // Reset form
      setFile(null)
      setCompanyName('')
      setServiceType('')
      setAmount('')
      setBillDate('')
      setOcrConfidence(0)
      setOcrAttempted(false)
      setExtractedFields(new Set())
      
      // Clear file input
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      
      onUploadSuccess()

    } catch (error: any) {
      console.error('Upload process failed:', error)
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred during upload.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const getFieldIcon = (fieldName: string) => {
    if (extractedFields.has(fieldName)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return null
  }

  const getFieldClassName = (fieldName: string) => {
    if (extractedFields.has(fieldName)) {
      return "border-green-500/50 bg-green-50/50"
    }
    return ""
  }

  // Check if form can be submitted
  const canSubmit = !uploading && !analyzing && file !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload New Bill
          {analyzing && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
        </CardTitle>
        <CardDescription>
          Upload your business expenses - information will be automatically extracted from images
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Bill Document *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                disabled={analyzing}
              />
              {file && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Analyzing bill content...
              </div>
            )}
            {ocrAttempted && extractedFields.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Auto-filled {extractedFields.size} field(s) with {Math.round(ocrConfidence * 100)}% confidence
                </span>
              </div>
            )}
            {ocrAttempted && extractedFields.size === 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>
                  No information could be automatically extracted. Please enter details manually.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                Company/Provider Name
                {getFieldIcon('companyName')}
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Verizon, Microsoft, etc."
                className={getFieldClassName('companyName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="flex items-center gap-2">
                Service Type
                {getFieldIcon('serviceType')}
              </Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className={getFieldClassName('serviceType')}>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                Amount *
                {getFieldIcon('amount')}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`pl-10 ${getFieldClassName('amount')}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billDate" className="flex items-center gap-2">
                Bill Date *
                {getFieldIcon('billDate')}
              </Label>
              <Input
                id="billDate"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className={getFieldClassName('billDate')}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!canSubmit} 
            className="w-full"
          >
            {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Save Bill'}
          </Button>
          
          {!canSubmit && !analyzing && !uploading && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a file to enable upload
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
