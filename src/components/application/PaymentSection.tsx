import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentSectionProps {
  data: any;
  updateData: (section: string, data: any) => void;
}

export function PaymentSection({ data, updateData }: PaymentSectionProps) {
  const { toast } = useToast();
  const [utrNumber, setUtrNumber] = useState(data.payment?.utrNumber || '');
  const [paymentConfirmed, setPaymentConfirmed] = useState(data.payment?.confirmed || false);

  const processingFee = 144000; // Fixed fee as per the document
  const paidAmount = data.payment?.paidAmount || 0;
  const balanceAmount = processingFee - paidAmount;

  const handleUtrSubmit = () => {
    if (!utrNumber || utrNumber.length < 10) {
      toast({
        title: "Invalid UTR Number",
        description: "Please enter a valid UTR number (minimum 10 digits)",
        variant: "destructive",
      });
      return;
    }

    // Simulate payment verification
    setPaymentConfirmed(true);
    updateData('payment', { 
      utrNumber, 
      confirmed: true, 
      paidAmount: processingFee,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'Bank Transfer'
    });

    toast({
      title: "Payment Verified",
      description: "Your payment has been successfully verified",
    });
  };

  const handleUtrChange = (value: string) => {
    setUtrNumber(value);
    updateData('payment', { utrNumber: value });
  };

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">₹{processingFee.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Processing Fee</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Amount Paid</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">₹{balanceAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Balance Amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2">Bank Transfer Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Account Name</Label>
                <p className="font-medium">All India Council for Technical Education</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Number</Label>
                <p className="font-medium">12345678901234</p>
              </div>
              <div>
                <Label className="text-muted-foreground">IFSC Code</Label>
                <p className="font-medium">SBIN0001234</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Bank Name</Label>
                <p className="font-medium">State Bank of India</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Make payment only after completing all previous sections</li>
              <li>Use your institution name as reference while making payment</li>
              <li>Keep the transaction receipt for your records</li>
              <li>Processing will begin only after payment verification</li>
              <li>Enter the correct UTR number to avoid delays</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* UTR Number Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentConfirmed ? (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Payment Verified Successfully</p>
                <p className="text-sm text-green-600">
                  UTR: {utrNumber} • Verified on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Payment Pending</p>
                  <p className="text-sm text-orange-600">
                    Please complete the payment and enter your UTR number below
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="utrNumber">UTR/Transaction Reference Number *</Label>
                  <Input
                    id="utrNumber"
                    placeholder="Enter 12-digit UTR number from your bank"
                    value={utrNumber}
                    onChange={(e) => handleUtrChange(e.target.value)}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    This number is provided by your bank after successful transaction
                  </p>
                </div>

                <Button 
                  onClick={handleUtrSubmit}
                  disabled={!utrNumber || utrNumber.length < 10}
                  className="w-full md:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Payment
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant={paymentConfirmed ? "default" : "secondary"}>
              {paymentConfirmed ? "Verified" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {paymentConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{utrNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₹{processingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">Bank Transfer</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}