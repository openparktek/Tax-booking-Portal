import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Building2,
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "../../contexts/CurrencyContext";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { companiesApi } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useUser } from "../../contexts/UserContext";

export default function ProcessSettlement() {
  const { currency } = useCurrency();
  const { isCompanyRestricted, userCompany, userCompanyName } = useUser();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      if (response.success) {
        let companiesList = response.data || [];
        
        // Filter companies if user is company-restricted
        if (isCompanyRestricted && userCompany) {
          companiesList = companiesList.filter((c: any) => c.id === userCompany);
        }
        
        setCompanies(companiesList);
        console.log("Companies loaded for settlement:", companiesList);
        
        // Auto-select company for restricted users
        if (isCompanyRestricted && userCompany && companiesList.length > 0) {
          setSelectedCompanyId(userCompany);
        }
      } else {
        toast.error("Failed to load companies");
      }
    } catch (error: any) {
      console.error("Error loading companies:", error);
      toast.error(error.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies.find(c => c.id === selectedCompanyId);
      setSelectedCompany(company || null);
      if (company) {
        // Use outstandingBalance if available, otherwise default to 0
        const balance = company.outstandingBalance || 0;
        setPaymentAmount(balance.toString());
      }
    } else {
      setSelectedCompany(null);
      setPaymentAmount("");
    }
  }, [selectedCompanyId, companies]);

  const handleConfirmSettlement = () => {
    if (!selectedCompany || !paymentMethod || !paymentAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedCompany.outstandingBalance) {
      toast.error("Payment amount cannot exceed outstanding balance");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleProcessSettlement = async () => {
    setProcessingPayment(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const settlementData = {
        companyId: selectedCompany?.id,
        companyName: selectedCompany?.name,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        referenceNumber,
        notes,
        date: new Date().toISOString(),
        previousBalance: selectedCompany?.outstandingBalance,
        remainingBalance: (selectedCompany?.outstandingBalance || 0) - parseFloat(paymentAmount),
      };

      console.log("Settlement processed:", settlementData);

      // Store in localStorage for history
      const settlements = JSON.parse(localStorage.getItem('openpark_settlements') || '[]');
      settlements.unshift({
        ...settlementData,
        id: Date.now(),
        status: "Completed",
      });
      localStorage.setItem('openpark_settlements', JSON.stringify(settlements));

      toast.success(`Settlement of ${currency} ${paymentAmount} processed successfully!`);
      
      // Reset form
      if (!isCompanyRestricted) {
        setSelectedCompanyId("");
      }
      // For restricted users, keep company selected but reset other fields
      setPaymentMethod("");
      setPaymentAmount("");
      setReferenceNumber("");
      setNotes("");
      setConfirmDialogOpen(false);
      
    } catch (error) {
      toast.error("Failed to process settlement");
      console.error("Settlement error:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Wallet },
    { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
    { value: "credit_card", label: "Credit Card", icon: CreditCard },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Process Settlement</h1>
          <p className="text-gray-600">
            Register company account settlements with the airport
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/settlement-dashboard">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </Link>
          <Link to="/settlement-reports">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Settlement Form */}
        <div className="col-span-2 space-y-6">
          {/* Company Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900">Select Company</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Select 
                  value={selectedCompanyId} 
                  onValueChange={setSelectedCompanyId} 
                  disabled={loading || isCompanyRestricted}
                >
                  <SelectTrigger id="company" className="mt-1.5">
                    <SelectValue placeholder={loading ? "Loading companies..." : companies.length === 0 ? "No companies found" : "Choose a company to settle..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{company.name}</span>
                          <span className="ml-4 text-xs text-gray-500">
                            Balance: {currency} {(company.outstandingBalance || 0).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCompanyRestricted && userCompanyName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Restricted to your company: {userCompanyName}
                  </p>
                )}
              </div>

              {selectedCompany && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Trips</p>
                    <p className="text-gray-900">{selectedCompany.totalTrips || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Gross Revenue</p>
                    <p className="text-gray-900">
                      <CurrencyDisplay amount={selectedCompany.grossRevenue || 0} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Airport Share</p>
                    <p className="text-gray-900">
                      <CurrencyDisplay amount={selectedCompany.airportShare || 0} />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Details */}
          {selectedCompany && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">Payment Details</h2>
              </div>

              <div className="space-y-4">
                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method" className="mt-1.5">
                      <SelectValue placeholder="Select payment method..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="w-4 h-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Amount */}
                <div>
                  <Label htmlFor="amount">Payment Amount ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Outstanding balance: <CurrencyDisplay amount={selectedCompany.outstandingBalance || 0} />
                  </p>
                </div>

                {/* Reference Number */}
                <div>
                  <Label htmlFor="reference">
                    Reference Number
                    {(paymentMethod === "bank_transfer" || paymentMethod === "credit_card") && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={
                      paymentMethod === "bank_transfer"
                        ? "Transaction ID or Transfer Number"
                        : paymentMethod === "credit_card"
                        ? "Authorization Code"
                        : "Optional reference number"
                    }
                    className="mt-1.5"
                    required={paymentMethod === "bank_transfer" || paymentMethod === "credit_card"}
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes about this settlement..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900">Settlement Summary</h2>
            </div>

            {!selectedCompany ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Select a company to view settlement details
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="text-gray-900">{selectedCompany.name}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Settlement Cycle</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedCompany.settlementCycle || "N/A"}
                  </Badge>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Last Settlement</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedCompany.lastSettlement || "No settlements yet"}
                  </div>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Outstanding Balance</p>
                  <p className="text-2xl text-red-600">
                    <CurrencyDisplay amount={selectedCompany.outstandingBalance || 0} />
                  </p>
                </div>

                {paymentAmount && !isNaN(parseFloat(paymentAmount)) && parseFloat(paymentAmount) > 0 && (
                  <>
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                      <p className="text-2xl text-blue-600">
                        <CurrencyDisplay amount={parseFloat(paymentAmount) || 0} />
                      </p>
                    </div>

                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Remaining Balance</p>
                      <p className="text-xl text-gray-900">
                        <CurrencyDisplay
                          amount={(selectedCompany.outstandingBalance || 0) - (parseFloat(paymentAmount) || 0)}
                        />
                      </p>
                    </div>
                  </>
                )}

                {paymentMethod && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <div className="flex items-center gap-2">
                      {paymentMethod === "cash" && <Wallet className="w-4 h-4 text-gray-600" />}
                      {paymentMethod === "bank_transfer" && <Banknote className="w-4 h-4 text-gray-600" />}
                      {paymentMethod === "credit_card" && <CreditCard className="w-4 h-4 text-gray-600" />}
                      <span className="text-gray-900">
                        {paymentMethods.find(m => m.value === paymentMethod)?.label}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleConfirmSettlement}
                  disabled={!paymentMethod || !paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Settlement
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  This action will record the settlement and update the company balance
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Settlement</DialogTitle>
            <DialogDescription>
              Please review the settlement details before confirming
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="text-gray-900">{selectedCompany?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Amount:</span>
              <span className="text-gray-900 font-medium">
                <CurrencyDisplay amount={parseFloat(paymentAmount) || 0} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-gray-900">
                {paymentMethods.find(m => m.value === paymentMethod)?.label}
              </span>
            </div>
            {referenceNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="text-gray-900">{referenceNumber}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="text-gray-600">Remaining Balance:</span>
              <span className="text-gray-900 font-medium">
                <CurrencyDisplay
                  amount={(selectedCompany?.outstandingBalance || 0) - (parseFloat(paymentAmount) || 0)}
                />
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleProcessSettlement}
              disabled={processingPayment}
            >
              {processingPayment ? "Processing..." : "Confirm & Process"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}