import { useState, useEffect } from "react";
import VendorLayout from "@/components/layout/VendorLayout";
import StatCard from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface VendorStats {
  totalSales: number;
  ordersCount: number;
  customersCount: number;
  productViews: number;
}

interface VendorSubscription {
  plan: string;
  renewalDate: string;
  pricePerMonth: number;
  productsUsed: number;
  productsLimit: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
}

export default function VendorDashboard() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<VendorStats>({
    totalSales: 0,
    ordersCount: 0,
    customersCount: 0,
    productViews: 0
  });
  const [subscription, setSubscription] = useState<VendorSubscription>({
    plan: "Premium",
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    pricePerMonth: 49.99,
    productsUsed: 75,
    productsLimit: 100
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch this data from Firebase
        // For now, we'll use mock data
        
        // Stats
        setStats({
          totalSales: 12835.00,
          ordersCount: 184,
          customersCount: 129,
          productViews: 5342
        });
        
        // Recent Orders
        setRecentOrders([
          {
            id: "1",
            orderNumber: "ORD-498",
            customerName: "John Doe",
            date: "2023-06-12",
            status: "shipped",
            total: 129.99
          },
          {
            id: "2",
            orderNumber: "ORD-497",
            customerName: "Jane Smith",
            date: "2023-06-11",
            status: "delivered",
            total: 89.99
          },
          {
            id: "3",
            orderNumber: "ORD-496",
            customerName: "Robert Johnson",
            date: "2023-06-10",
            status: "processing",
            total: 249.99
          },
          {
            id: "4",
            orderNumber: "ORD-495",
            customerName: "Emily Davis",
            date: "2023-06-09",
            status: "cancelled",
            total: 75.00
          },
          {
            id: "5",
            orderNumber: "ORD-494",
            customerName: "Michael Brown",
            date: "2023-06-08",
            status: "delivered",
            total: 189.99
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  const getStatusBadgeClasses = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Vendor Dashboard</h1>
        <p className="text-sm text-gray-600">{userData?.storeName || 'Your store dashboard'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sales" 
          value={`$${stats.totalSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          change={8.2} 
          trend="up" 
        />
        <StatCard 
          title="Orders" 
          value={stats.ordersCount.toLocaleString()} 
          change={5.1} 
          trend="up" 
        />
        <StatCard 
          title="Customers" 
          value={stats.customersCount.toLocaleString()} 
          change={12.4} 
          trend="up" 
        />
        <StatCard 
          title="Product Views" 
          value={stats.productViews.toLocaleString()} 
          change={33} 
          trend="up" 
        />
      </div>

      {/* Subscription Status */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Subscription Status</h3>
            <Button>
              Upgrade Plan
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">{subscription.plan}</span>
              <span className="ml-4 text-sm text-gray-600">
                Your subscription renews in {Math.ceil((new Date(subscription.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
              <span className="ml-auto text-sm font-medium text-gray-800">${subscription.pricePerMonth}/month</span>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Usage this month</p>
              <Progress value={(subscription.productsUsed / subscription.productsLimit) * 100} className="h-2.5" />
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((subscription.productsUsed / subscription.productsLimit) * 100)}% ({subscription.productsUsed}/{subscription.productsLimit} products)
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Unlimited orders</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">{subscription.productsLimit} product listings</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">3% transaction fee</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-800">Recent Orders</CardTitle>
          <Button variant="link" className="text-sm font-medium text-primary hover:text-blue-600">
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" className="text-primary hover:text-blue-800">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </VendorLayout>
  );
}
