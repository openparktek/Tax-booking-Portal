import { useState, useRef, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import {
  QrCode,
  Scan,
  DollarSign,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Hash,
} from "lucide-react";
import { bookingsApi } from "../../lib/api";
import { toast } from "sonner";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function CashierTerminal() {
  const { formatCurrency, convertAmount, currency } = useCurrency();
  const [scanning, setScanning] = useState(false);
  const [manualBookingId, setManualBookingId] = useState("");
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  
  // Calculate the actual fare amount in the current currency
  const actualFareAmount = currentBooking 
    ? convertAmount(currentBooking.fare, "USD", currency)
    : 0;
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [queueNumber, setQueueNumber] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate queue number for the day
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const queueKey = `cashier_queue_${today}`;
    const currentQueue = parseInt(localStorage.getItem(queueKey) || "0");
    setQueueNumber(currentQueue);
  }, []);

  const getNextQueueNumber = () => {
    const today = new Date().toISOString().split("T")[0];
    const queueKey = `cashier_queue_${today}`;
    const currentQueue = parseInt(localStorage.getItem(queueKey) || "0");
    const nextQueue = currentQueue + 1;
    localStorage.setItem(queueKey, nextQueue.toString());
    setQueueNumber(nextQueue);
    return nextQueue;
  };

  // Start QR code scanner
  const startScanner = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera. Please check permissions.");
      setScanning(false);
    }
  };

  // Stop scanner
  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  // Scan QR code from video
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection (in production, use a library like jsQR)
      // For now, we'll use manual entry
      
      // Continue scanning
      if (scanning) {
        requestAnimationFrame(scanQRCode);
      }
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Load booking by ID
  const loadBooking = async (bookingId: string) => {
    try {
      setProcessing(true);
      const response = await bookingsApi.getById(bookingId);
      
      if (response.success && response.data) {
        const booking = response.data;
        
        // Check if booking is in correct status
        if (booking.status !== "Confirmed" && booking.status !== "Confirmed at Airport") {
          toast.error(`Booking status is "${booking.status}". Only Confirmed bookings can be processed.`);
          return;
        }

        // Check if already paid
        if (booking.paymentStatus === "Paid") {
          toast.error("This booking has already been paid.");
          return;
        }

        setCurrentBooking(booking);
        setPaymentDialogOpen(true);
        stopScanner();
      } else {
        toast.error("Booking not found");
      }
    } catch (error: any) {
      console.error("Error loading booking:", error);
      toast.error(error.message || "Failed to load booking");
    } finally {
      setProcessing(false);
    }
  };

  // Handle manual booking ID entry
  const handleManualEntry = () => {
    if (!manualBookingId.trim()) {
      toast.error("Please enter a booking ID");
      return;
    }
    loadBooking(manualBookingId.trim());
    setManualBookingId("");
  };

  // Process payment
  const processPayment = async () => {
    if (!currentBooking) return;

    // Validate payment
    if (paymentMethod === "cash") {
      const received = parseFloat(amountReceived);
      if (!received || received < actualFareAmount) {
        toast.error("Amount received must be at least the fare amount");
        return;
      }
    } else if (paymentMethod === "card") {
      if (!cardLastFour || cardLastFour.length !== 4) {
        toast.error("Please enter the last 4 digits of the card");
        return;
      }
    }

    try {
      setProcessing(true);

      const queue = getNextQueueNumber();
      const change = paymentMethod === "cash" 
        ? parseFloat(amountReceived) - actualFareAmount 
        : 0;

      // Update booking with payment info
      const updatedBooking = {
        ...currentBooking,
        paymentStatus: "Paid",
        paymentMethod: paymentMethod === "cash" ? "Cash" : "Credit Card",
        paymentDate: new Date().toISOString(),
        amountPaid: currentBooking.fare,
        amountReceived: paymentMethod === "cash" ? parseFloat(amountReceived) : currentBooking.fare,
        change: change,
        queueNumber: queue,
        status: "Waiting", // Change from Confirmed to Waiting
        cardLastFour: paymentMethod === "card" ? cardLastFour : undefined,
      };

      await bookingsApi.update(currentBooking.id, updatedBooking);

      // Store transaction for receipt
      setLastTransaction({
        ...updatedBooking,
        processedAt: new Date().toISOString(),
        cashierName: "Cashier", // In production, get from logged-in user
      });

      toast.success("Payment processed successfully!");
      setPaymentDialogOpen(false);
      setReceiptDialogOpen(true);
      setCurrentBooking(null);
      setAmountReceived("");
      setCardLastFour("");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !lastTransaction) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${lastTransaction.id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
          .receipt {
            border: 2px dashed #333;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .queue-number {
            text-align: center;
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
            padding: 20px;
            border: 3px solid #000;
            background: #f0f0f0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .label {
            font-weight: bold;
          }
          .divider {
            border-bottom: 1px dashed #333;
            margin: 15px 0;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>OpenPark</h1>
            <p>Airport Limousine Service</p>
            <p>Payment Receipt</p>
          </div>

          <div class="queue-number">
            Queue #${lastTransaction.queueNumber}
          </div>

          <div class="row">
            <span class="label">Booking ID:</span>
            <span>${lastTransaction.id}</span>
          </div>
          <div class="row">
            <span class="label">Date & Time:</span>
            <span>${new Date(lastTransaction.processedAt).toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Passenger:</span>
            <span>${lastTransaction.passenger}</span>
          </div>
          <div class="row">
            <span class="label">Company:</span>
            <span>${lastTransaction.company}</span>
          </div>

          <div class="divider"></div>

          <div class="row">
            <span class="label">Pickup:</span>
            <span>${lastTransaction.pickupLocation}</span>
          </div>
          <div class="row">
            <span class="label">Drop-off:</span>
            <span>${lastTransaction.dropoffLocation}</span>
          </div>
          <div class="row">
            <span class="label">Pickup Time:</span>
            <span>${new Date(lastTransaction.scheduledTime).toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Vehicle:</span>
            <span>${lastTransaction.vehicleType}</span>
          </div>
          <div class="row">
            <span class="label">Driver:</span>
            <span>${lastTransaction.driverName || 'Assigned'}</span>
          </div>

          <div class="divider"></div>

          <div class="row total">
            <span class="label">Fare Amount:</span>
            <span>${formatCurrency(lastTransaction.fare)}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span>${lastTransaction.paymentMethod}${lastTransaction.cardLastFour ? ' ****' + lastTransaction.cardLastFour : ''}</span>
          </div>
          ${lastTransaction.paymentMethod === 'Cash' ? `
          <div class="row">
            <span class="label">Amount Received:</span>
            <span>${formatCurrency(lastTransaction.amountReceived)}</span>
          </div>
          <div class="row">
            <span class="label">Change:</span>
            <span>${formatCurrency(lastTransaction.change)}</span>
          </div>
          ` : ''}
          
          <div class="divider"></div>

          <div class="footer">
            <p><strong>Please proceed to the pickup area</strong></p>
            <p>Show this queue number to your driver</p>
            <p>Cashier: ${lastTransaction.cashierName}</p>
            <p>Thank you for choosing OpenPark!</p>
          </div>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Print Receipt
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900">Cashier Terminal</h1>
        <p className="text-gray-600">Scan booking QR code or enter booking ID to process payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Scan QR Code</h2>
              <p className="text-sm text-gray-600">Scan booking QR code from kiosk</p>
            </div>
          </div>

          {/* Scanner */}
          <div className="space-y-4">
            {scanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full aspect-square object-cover rounded-lg bg-gray-900"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-blue-500 rounded-lg"></div>
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  onClick={stopScanner}
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full h-64 bg-gradient-to-br from-blue-600 to-blue-700"
                onClick={startScanner}
                disabled={processing}
              >
                <div className="text-center">
                  <Scan className="w-16 h-16 mx-auto mb-4" />
                  <span className="text-lg">Start QR Scanner</span>
                </div>
              </Button>
            )}
          </div>
        </Card>

        {/* Manual Entry Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-gray-900">Manual Entry</h2>
              <p className="text-sm text-gray-600">Enter booking ID manually</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                placeholder="Enter booking ID... (e.g., BK-12345)"
                value={manualBookingId}
                onChange={(e) => setManualBookingId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualEntry();
                  }
                }}
                className="mt-1.5"
                disabled={processing}
              />
            </div>
            <Button
              size="lg"
              className="w-full bg-gradient-to-br from-green-600 to-green-700"
              onClick={handleManualEntry}
              disabled={processing || !manualBookingId.trim()}
            >
              {processing ? "Loading..." : "Load Booking"}
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Scan the QR code from the kiosk confirmation</li>
                  <li>Or enter the booking ID manually</li>
                  <li>Process payment (Cash or Credit Card)</li>
                  <li>Print receipt with queue number</li>
                  <li>Direct passenger to pickup area</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Queue</p>
              <p className="text-2xl text-gray-900 mt-1">{queueNumber}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Payments</p>
              <p className="text-2xl text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Card Payments</p>
              <p className="text-2xl text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receipts Printed</p>
              <p className="text-2xl text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Printer className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Collect payment and print receipt for the passenger
            </DialogDescription>
          </DialogHeader>

          {currentBooking && (
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking ID:</span>
                  <span className="text-gray-900 font-medium">{currentBooking.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passenger:</span>
                  <span className="text-gray-900 font-medium">{currentBooking.passenger}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-gray-900">{currentBooking.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Company:</span>
                  <Badge variant="outline">{currentBooking.company}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pickup:</span>
                  <span className="text-gray-900">{currentBooking.pickupLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Drop-off:</span>
                  <span className="text-gray-900">{currentBooking.dropoffLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vehicle:</span>
                  <span className="text-gray-900">{currentBooking.vehicleType}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-gray-900">Total Fare:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(currentBooking.fare)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <Button
                    type="button"
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    className={paymentMethod === "cash" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className={paymentMethod === "card" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit Card
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              {paymentMethod === "cash" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amountReceived">Amount Received</Label>
                    <Input
                      id="amountReceived"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount..."
                      value={amountReceived}
                      onChange={(e) => {
                        setAmountReceived(e.target.value);
                      }}
                      className="mt-1.5 text-lg h-12"
                    />
                  </div>
                  
                  {amountReceived && parseFloat(amountReceived) >= actualFareAmount && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-green-900">Change to Return:</span>
                        <span className="text-4xl font-bold text-green-600">
                          {formatCurrency(parseFloat(amountReceived) - actualFareAmount, currency)}
                        </span>
                      </div>
                    </div>
                  )}
                  {amountReceived && parseFloat(amountReceived) < actualFareAmount && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <p className="text-red-600 font-medium">
                        Amount received is less than the fare. 
                        Short by: {formatCurrency(actualFareAmount - parseFloat(amountReceived), currency)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="cardLastFour">Last 4 Digits of Card</Label>
                  <Input
                    id="cardLastFour"
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={cardLastFour}
                    onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={processPayment}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? "Processing..." : "Process Payment & Print Receipt"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Payment Successful
            </DialogTitle>
            <DialogDescription>
              Receipt is ready to print
            </DialogDescription>
          </DialogHeader>

          {lastTransaction && (
            <div className="space-y-6">
              {/* Queue Number */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Queue Number</p>
                <p className="text-6xl font-bold text-gray-900">{lastTransaction.queueNumber}</p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="text-gray-900 font-medium">{lastTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passenger:</span>
                  <span className="text-gray-900">{lastTransaction.passenger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="text-gray-900">{lastTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(lastTransaction.fare)}</span>
                </div>
                {lastTransaction.paymentMethod === "Cash" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change:</span>
                    <span className="text-gray-900">{formatCurrency(lastTransaction.change)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={printReceipt}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptDialogOpen(false);
                    setLastTransaction(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}