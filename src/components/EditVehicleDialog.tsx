import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { carDatabase, getModelsForBrand, getBrandName } from "../data/carDatabase";
import { companiesApi, vehiclesApi } from "../lib/api";
import { VEHICLE_TYPES, VEHICLE_STATUSES } from "../utils/constants";

interface EditVehicleDialogProps {
  vehicle: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isAddMode?: boolean;
}

export default function EditVehicleDialog({
  vehicle,
  open,
  onOpenChange,
  onSuccess,
  isAddMode = false,
}: EditVehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [inspectionDate, setInspectionDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    type: "",
    capacity: 4,
    company: "",
    status: "Available",
    lastInspection: "",
  });

  // Load companies from API when dialog opens
  useEffect(() => {
    if (open) {
      const loadCompanies = async () => {
        try {
          setLoadingCompanies(true);
          const response = await companiesApi.getAll();
          const companiesData = Array.isArray(response?.data) ? response.data : [];
          console.log("EditVehicleDialog - Companies loaded from API:", companiesData);
          setCompanies(companiesData);
        } catch (error) {
          console.error("EditVehicleDialog - Error loading companies:", error);
          toast.error("Failed to load companies");
          setCompanies([]);
        } finally {
          setLoadingCompanies(false);
        }
      };
      
      loadCompanies();
    }
  }, [open]);

  // Update form data when vehicle changes or dialog opens
  useEffect(() => {
    if (open) {
      if (isAddMode) {
        // Reset form for new vehicle
        console.log("Resetting form for new vehicle");
        setSelectedBrand("");
        setAvailableModels([]);
        setInspectionDate(undefined);
        setFormData({
          plate: "",
          brand: "",
          model: "",
          type: "",
          capacity: 4,
          company: "",
          status: "Available",
          lastInspection: "",
        });
      } else if (vehicle) {
        // Load existing vehicle data
        console.log("Loading vehicle data into form:", vehicle);
        const vehicleBrand = vehicle.brand || "";
        const vehicleModel = vehicle.model || "";
        
        console.log("Vehicle brand:", vehicleBrand);
        console.log("Vehicle model:", vehicleModel);
        
        // Set the brand first
        setSelectedBrand(vehicleBrand);
        
        // Get available models for this brand
        if (vehicleBrand) {
          const models = getModelsForBrand(vehicleBrand);
          console.log("Available models for brand:", models);
          setAvailableModels(models);
        } else {
          setAvailableModels([]);
        }
        
        // Parse the inspection date if it exists
        if (vehicle.lastInspection) {
          try {
            const parsedDate = new Date(vehicle.lastInspection);
            if (!isNaN(parsedDate.getTime())) {
              setInspectionDate(parsedDate);
            }
          } catch (error) {
            console.error("Error parsing inspection date:", error);
          }
        }
        
        // Set form data with all vehicle information
        setFormData({
          plate: vehicle.plate || vehicle.plateNumber || "",
          brand: vehicleBrand,
          model: vehicleModel,
          type: vehicle.type || "",
          capacity: vehicle.capacity || 4,
          company: vehicle.company || "",
          status: vehicle.status || "Available",
          lastInspection: vehicle.lastInspection || "",
        });
      }
    }
  }, [vehicle, open, isAddMode]);

  // Update available models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      const models = getModelsForBrand(selectedBrand);
      setAvailableModels(models);
      // If current model is not in the new brand's models, reset it
      if (formData.model && !models.includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: "" }));
      }
    } else {
      setAvailableModels([]);
    }
  }, [selectedBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAddMode && !vehicle) {
      toast.error("No vehicle selected");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isAddMode) {
        console.log("Adding new vehicle with form data:", formData);
        
        // Call API to create vehicle
        const response = await vehiclesApi.create({
          ...formData,
          plateNumber: formData.plate, // Backend expects plateNumber
          driver: "Unassigned", // New vehicles don't have drivers yet
        });
        
        console.log("Vehicle added successfully:", response);
        
        toast.success("Vehicle added successfully!");
        if (onSuccess) onSuccess(); // Reload the list
        onOpenChange(false);
      } else {
        console.log("Updating vehicle ID:", vehicle.id);
        console.log("With form data:", formData);
        
        // Call API to update vehicle
        const response = await vehiclesApi.update(vehicle.id, {
          ...formData,
          plateNumber: formData.plate, // Backend expects plateNumber
          driver: vehicle.driver, // Keep existing driver assignment
        });
        
        console.log("Vehicle updated successfully:", response);
        
        toast.success("Vehicle updated successfully!");
        if (onSuccess) onSuccess(); // Reload the list
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error(isAddMode ? "Error adding vehicle:" : "Error updating vehicle:", error);
      toast.error(error?.message || (isAddMode ? "Failed to add vehicle" : "Failed to update vehicle"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setFormData(prev => ({ ...prev, brand: brandId, model: "" }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setInspectionDate(date);
    if (date) {
      // Store in ISO format for the backend
      setFormData(prev => ({ ...prev, lastInspection: date.toISOString() }));
    } else {
      setFormData(prev => ({ ...prev, lastInspection: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAddMode ? "Add New Vehicle" : "Edit Vehicle"}</DialogTitle>
          <DialogDescription>
            {isAddMode ? "Add a new vehicle to the fleet" : "Update vehicle information and status"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Plate Number */}
            <div>
              <Label htmlFor="plate">Plate Number</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => handleChange("plate", e.target.value)}
                placeholder="أ ب ج -1234"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand">Vehicle Brand</Label>
              <Select
                value={selectedBrand}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand">
                    {selectedBrand ? getBrandName(selectedBrand) : "Select brand"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {carDatabase.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div>
              <Label htmlFor="model">Vehicle Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => handleChange("model", value)}
                disabled={!selectedBrand}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder={selectedBrand ? "Select model" : "Select brand first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">Vehicle Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div>
              <Label htmlFor="capacity">Seating Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="2"
                max="12"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", parseInt(e.target.value))}
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Select
                value={formData.company}
                onValueChange={(value) => handleChange("company", value)}
                disabled={loadingCompanies}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select company"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No companies available
                    </div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Last Inspection */}
            <div className="col-span-2">
              <Label htmlFor="lastInspection">Last Inspection Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="lastInspection"
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {inspectionDate ? format(inspectionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={inspectionDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isAddMode ? "Adding..." : "Saving...") : (isAddMode ? "Add Vehicle" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
