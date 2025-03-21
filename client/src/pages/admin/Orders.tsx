import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, MoreVertical, Eye, CheckCircle, TruckIcon, XCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  paymentStatus: "paid" | "unpaid" | "refunded";
  items: number;
  vendorName: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, we would fetch from Firebase
        // For now, we'll use mock data
        const mockOrders: Order[] = [
          {
            id: "1",
            orderNumber: "ORD-498",
            customerName: "John Doe",
            customerEmail: "john.doe@example.com",
            date: "2023-06-12",
            status: "shipped",
            total: 129.99,
            paymentStatus: "paid",
            items: 2,
            vendorName: "AudioTech"
          },
          {
            id: "2",
            orderNumber: "ORD-497",
            customerName: "Jane Smith",
            customerEmail: "jane.smith@example.com",
            date: "2023-06-11",
            status: "delivered",
            total: 89.99,
            paymentStatus: "paid",
            items: 1,
            vendorName: "TechWorld"
          },
          {
            id: "3",
            orderNumber: "ORD-496",
            customerName: "Robert Johnson",
            customerEmail: "robert.johnson@example.com",
            date: "2023-06-10",
            status: "processing",
            total: 249.99,
            paymentStatus: "paid",
            items: 3,
            vendorName: "HomeDecor"
          },
          {
            id: "4",
            orderNumber: "ORD-495",
            customerName: "Emily Davis",
            customerEmail: "emily.davis@example.com",
            date: "2023-06-09",
            status: "cancelled",
            total: 75.00,
            paymentStatus: "refunded",
            items: 1,
            vendorName: "Fashionista"
          },
          {
            id: "5",
            orderNumber: "ORD-494",
            customerName: "Michael Brown",
            customerEmail: "michael.brown@example.com",
            date: "2023-06-08",
            status: "delivered",
            total: 189.99,
            paymentStatus: "paid",
            items: 2,
            vendorName: "TechWorld"
          },
          {
            id: "6",
            orderNumber: "ORD-493",
            customerName: "Sarah Wilson",
            customerEmail: "sarah.wilson@example.com",
            date: "2023-06-07",
            status: "pending",
            total: 124.50,
            paymentStatus: "unpaid",
            items: 2,
            vendorName: "Fashionista"
          }
        ];
        
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [toast]);
  
  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders, activeTab]);
  
  const filterOrders = () => {
    let result = [...orders];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order => 
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab/status
    if (activeTab !== "all") {
      result = result.filter(order => order.status === activeTab);
    }
    
    setFilteredOrders(result);
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // In a real app, we would call Firebase here to update the order status
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      toast({
        title: "Order Updated",
        description: `Order status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const getPaymentStatusBadgeClasses = (status: Order['paymentStatus']) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-600">View and manage customer orders</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                Track, update, and manage customer orders
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-2">No orders found</p>
              <p className="text-sm text-gray-400">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : activeTab !== "all" 
                  ? `No orders with status: ${activeTab}` 
                  : "There are no orders yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClasses(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {/* Status update options based on current status */}
                            {order.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "processing")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Processing
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === "processing" && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "shipped")}>
                                <TruckIcon className="h-4 w-4 mr-2" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === "shipped" && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "delivered")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            
                            {(order.status === "pending" || order.status === "processing") && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
