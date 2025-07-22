import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Building2, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Pencil
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useState, useEffect } from 'react'

interface Bill {
  id: string
  company_name: string
  service_type: string
  amount: number
  bill_date: string
  analysis_status: 'pending' | 'completed' | 'error'
  savings_found?: number
  recommendations?: string
  file_url?: string
  created_at: string
  ocr_confidence?: number
  // Enhanced OCR fields
  account_number?: string
  due_date?: string
  previous_balance?: number
  current_charges?: number
  tax_amount?: number
  contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  service_details?: {
    plan_name?: string
    usage_data?: string
    billing_period?: string
  }
}

interface BillDetailsModalProps {
  bill: Bill | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillDetailsModal({ bill, open, onOpenChange }: BillDetailsModalProps) {
  if (!bill) return null

  // ---------------------------------------------------------------------------
  // Editing state and handlers
  // The manual override feature allows users to correct misidentified fields
  // captured during OCR. When editMode is enabled, input fields are shown to
  // modify the company name, service type, amount, and bill date. Upon save,
  // the updated values are persisted to Supabase and the local bill object is
  // updated so the UI reflects the changes immediately.
  // ---------------------------------------------------------------------------
  const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editData, setEditData] = useState({
    company_name: bill.company_name,
    service_type: bill.service_type,
    amount: bill.amount,
    bill_date: bill.bill_date
  })

  useEffect(() => {
    // When the bill changes, reset the edit form and hide edit mode
    setEditData({
      company_name: bill.company_name,
      service_type: bill.service_type,
      amount: bill.amount,
      bill_date: bill.bill_date
    })
    setEditMode(false)
  }, [bill])

  const handleChange = (field: keyof typeof editData, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdits = async () => {
    setSavingEdit(true)
    const { error } = await supabase
      .from('bills')
      .update({
        company_name: editData.company_name,
        service_type: editData.service_type,
        amount: editData.amount,
        bill_date: editData.bill_date
      })
      .eq('id', bill.id)

    if (error) {
      toast({
        title: 'Error updating bill',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      // update local copy so UI reflects changes immediately
      bill.company_name = editData.company_name
      bill.service_type = editData.service_type
      bill.amount = editData.amount
      bill.bill_date = editData.bill_date
      toast({
        title: 'Bill updated',
        description: 'The bill details have been updated successfully.'
      })
      setEditMode(false)
    }
    setSavingEdit(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleDownload = () => {
    if (bill.file_url) {
      // Create a download link for the bill file
      const link = document.createElement('a')
      link.href = bill.file_url
      link.download = `${bill.company_name}_${bill.bill_date}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getFileType = (url: string) => {
    if (!url) return 'unknown'
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image'
    } else if (extension === 'pdf') {
      return 'pdf'
    }
    return 'unknown'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill Details
          </DialogTitle>
          <DialogDescription>
            Detailed information and analysis for your business expense
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {bill.company_name}
                </span>
                <Badge variant={getStatusColor(bill.analysis_status)} className="flex items-center gap-1">
                  {getStatusIcon(bill.analysis_status)}
                  {bill.analysis_status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Bill Date
                  </div>
                  <p className="font-medium">{new Date(bill.bill_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                  <p className="font-medium text-lg">${bill.amount.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Enhanced Bill Information */}
              {(bill.account_number || bill.due_date || bill.previous_balance || bill.current_charges || bill.tax_amount) && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  {bill.account_number && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Account Number</div>
                      <p className="font-mono text-sm">{bill.account_number}</p>
                    </div>
                  )}
                  {bill.due_date && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <p className="font-medium">{new Date(bill.due_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {bill.previous_balance && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Previous Balance</div>
                      <p className="font-medium">${bill.previous_balance.toFixed(2)}</p>
                    </div>
                  )}
                  {bill.current_charges && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Current Charges</div>
                      <p className="font-medium">${bill.current_charges.toFixed(2)}</p>
                    </div>
                  )}
                  {bill.tax_amount && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Tax Amount</div>
                      <p className="font-medium">${bill.tax_amount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Service Type</div>
                <Badge variant="outline">{bill.service_type}</Badge>
              </div>

              {/* Service Details */}
              {bill.service_details && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Service Details</div>
                  <div className="space-y-1">
                    {bill.service_details.plan_name && (
                      <p className="text-sm"><strong>Plan:</strong> {bill.service_details.plan_name}</p>
                    )}
                    {bill.service_details.usage_data && (
                      <p className="text-sm"><strong>Usage:</strong> {bill.service_details.usage_data}</p>
                    )}
                    {bill.service_details.billing_period && (
                      <p className="text-sm"><strong>Billing Period:</strong> {bill.service_details.billing_period}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {bill.contact_info && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Contact Information</div>
                  <div className="space-y-1">
                    {bill.contact_info.phone && (
                      <p className="text-sm"><strong>Phone:</strong> {bill.contact_info.phone}</p>
                    )}
                    {bill.contact_info.email && (
                      <p className="text-sm"><strong>Email:</strong> {bill.contact_info.email}</p>
                    )}
                    {bill.contact_info.website && (
                      <p className="text-sm"><strong>Website:</strong> {bill.contact_info.website}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Uploaded</div>
                <p className="text-sm">{new Date(bill.created_at).toLocaleString()}</p>
                {bill.ocr_confidence && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">OCR Confidence:</div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(bill.ocr_confidence * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bill File Display */}
          {bill.file_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Bill
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFileType(bill.file_url) === 'image' ? (
                    <div className="border rounded-lg p-4 bg-muted/30">
                    <img 
                      src={bill.file_url} 
                      alt={`Bill from ${bill.company_name}`}
                      className="w-full max-w-md mx-auto rounded-lg shadow-soft"
                      onError={(e) => {
                        console.error('Image load error:', e)
                        const target = e.currentTarget as HTMLImageElement
                        const errorDiv = target.nextElementSibling as HTMLElement
                        if (errorDiv) {
                          target.style.display = 'none'
                          errorDiv.style.display = 'block'
                        }
                      }}
                    />
                    <div className="text-center text-muted-foreground hidden">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Unable to display bill image</p>
                    </div>
                      <div className="flex gap-3 justify-center mt-4">
                        <Button
                          onClick={() => window.open(bill.file_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Full Image
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                ) : getFileType(bill.file_url) === 'pdf' ? (
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <div className="text-center space-y-4">
                      <FileText className="h-16 w-16 text-primary mx-auto" />
                      <div>
                        <h4 className="font-semibold text-lg">PDF Bill Document</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the button below to view your bill in a new tab
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => window.open(bill.file_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Bill
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <div className="text-center space-y-4">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                      <div>
                        <h4 className="font-semibold">File Available</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the button below to view or download your bill
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => window.open(bill.file_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View File
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Edit Form */}
          {editMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Edit Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company-name">Company Name</Label>
                  <Input
                    id="edit-company-name"
                    value={editData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-service-type">Service Type</Label>
                  <Input
                    id="edit-service-type"
                    value={editData.service_type}
                    onChange={(e) => handleChange('service_type', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Bill Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editData.bill_date ? editData.bill_date.split('T')[0] : ''}
                    onChange={(e) => handleChange('bill_date', e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveEdits} disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Savings Analysis */}
          {bill.analysis_status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  Savings Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bill.savings_found && bill.savings_found > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                      <div>
                        <p className="font-semibold text-success">Potential Savings Found!</p>
                        <p className="text-sm text-muted-foreground">Based on market analysis</p>
                      </div>
                      <div className="text-2xl font-bold text-success">
                        ${bill.savings_found.toFixed(2)}
                      </div>
                    </div>
                    
                    {bill.recommendations && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Recommendations</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {bill.recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Good news!</p>
                    <p className="text-sm text-muted-foreground">
                      Your current rate appears to be competitive. No immediate savings opportunities found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Analysis */}
          {bill.analysis_status === 'pending' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-6">
                  <Clock className="h-12 w-12 text-warning mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Analysis in Progress</p>
                  <p className="text-sm text-muted-foreground">
                    We're analyzing your bill to find potential savings. This usually takes a few minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {bill.analysis_status === 'error' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground">
                    There was an issue analyzing this bill. Please try uploading it again or contact support.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onOpenChange.bind(null, false)}>
              Close
            </Button>
            {bill.file_url && (
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Bill
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? 'Cancel Edit' : 'Edit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}