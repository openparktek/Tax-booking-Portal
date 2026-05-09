import { useState } from "react";
import { Button } from "./ui/button";
import { Database } from "lucide-react";
import { seedInitialData } from "../utils/seedData";
import { toast } from "sonner";

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedInitialData();
      if (result.success) {
        toast.info("No sample data to load - add data manually through the UI");
      } else {
        toast.error("Error in seed function");
      }
    } catch (error) {
      toast.error("Error in seed function");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Database className="w-4 h-4 mr-2" />
      {loading ? "Checking..." : "Load Sample Data (Disabled)"}
    </Button>
  );
}
