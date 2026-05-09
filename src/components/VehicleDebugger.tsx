import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { vehiclesApi } from "../lib/api";

export function VehicleDebugger() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await vehiclesApi.getAll();
      if (response.success) {
        setKeys(response.data);
      } else {
        console.error("Failed to fetch vehicles:", response.error);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Vehicle Database Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchKeys} disabled={loading}>
          {loading ? "Loading..." : "Fetch All Vehicles"}
        </Button>

        {keys.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2">Found {keys.length} vehicles in database:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {keys.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div><strong>ID:</strong> {item.id}</div>
                  <div><strong>Plate:</strong> {item.plate || "N/A"}</div>
                  <div><strong>Brand:</strong> {item.brand || "N/A"}</div>
                  <div><strong>Company:</strong> {item.company?.name || "N/A"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
