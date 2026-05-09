import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { DollarSign, TrendingUp, Building2, Clock, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCurrency } from "../../contexts/CurrencyContext";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { Badge } from "../../components/ui/badge";
import { useUser } from "../../contexts/UserContext";

const statusColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
};

export default function SettlementDashboard() {
  const { formatCurrency } = useCurrency();
  const { isCompanyRestricted, userCompanyName } = useUser();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = () => {
    try {
      setLoading(true);
      const storedSettlements = localStorage.getItem('openpark_settlements');
      if (storedSettlements) {
        let parsedSettlements = JSON.parse(storedSettlements);
        
        // Filter settlements if user is company-restricted
        if (isCompanyRestricted && userCompanyName) {
          parsedSettlements = parsedSettlements.filter((s: any) => s.companyName === userCompanyName);
        }
        
        setSettlements(parsedSettlements);
      }
    } catch (error) {
      console.error("Error loading settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPI metrics from real data
  const totalRevenue = settlements.reduce((sum, s) => sum + (s.amount || 0), 0);
  const airportShare = totalRevenue * 0.2; // 20% airport share
  const companiesShare = totalRevenue * 0.8; // 80% companies share
  const pendingSettlements = settlements.filter(s => s.status === "Pending").length;
  const pendingAmount = settlements
    .filter(s => s.status === "Pending")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const kpiData = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: settlements.length > 0 ? `${settlements.length} settlements` : "No data",
      icon: DollarSign,
    },
    {
      title: "Airport Share",
      value: airportShare,
      change: "20%",
      icon: TrendingUp,
    },
    {
      title: "Companies Share",
      value: companiesShare,
      change: "80%",
      icon: Building2,
    },
    {
      title: "Outstanding",
      value: pendingAmount,
      change: pendingSettlements > 0 ? `${pendingSettlements} pending` : "None",
      icon: Clock,
    },
  ];

  // Generate revenue trend data from settlements
  const generateRevenueData = () => {
    if (settlements.length === 0) {
      return [];
    }

    // Group settlements by month
    const monthlyData: Record<string, { revenue: number; airport: number; companies: number }> = {};
    
    settlements.forEach(settlement => {
      const date = new Date(settlement.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, airport: 0, companies: 0 };
      }
      
      monthlyData[monthKey].revenue += settlement.amount || 0;
      monthlyData[monthKey].airport += (settlement.amount || 0) * 0.2;
      monthlyData[monthKey].companies += (settlement.amount || 0) * 0.8;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6); // Last 6 months
  };

  const revenueData = generateRevenueData();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Settlement Dashboard</h1>
        <p className="text-gray-600">
          Revenue distribution and settlement tracking
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">{kpi.change}</span>
            </div>
            <div className="text-2xl text-gray-900 mb-1">
              {formatCurrency(kpi.value)}
            </div>
            <div className="text-sm text-gray-600">{kpi.title}</div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Revenue Trend</h3>
        {revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-900 mb-1">No Revenue Data</p>
            <p className="text-sm text-gray-500">
              Process settlements to see revenue trends
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Revenue"
              />
              <Line
                type="monotone"
                dataKey="airport"
                stroke="#10b981"
                strokeWidth={2}
                name="Airport Share"
              />
              <Line
                type="monotone"
                dataKey="companies"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Companies Share"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent Settlements */}
      <Card>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Recent Settlements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Payment Method
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading settlements...
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-900 mb-1">No Settlements Yet</p>
                      <p className="text-sm text-gray-500">
                        Process your first settlement to see it here
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                settlements.slice(0, 10).map((settlement) => (
                  <tr key={settlement.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {settlement.companyName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(settlement.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <CurrencyDisplay amount={settlement.amount} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {settlement.paymentMethod === "cash" && "Cash"}
                      {settlement.paymentMethod === "bank_transfer" && "Bank Transfer"}
                      {settlement.paymentMethod === "credit_card" && "Credit Card"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[settlement.status] || statusColors.Completed}
                      >
                        {settlement.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}