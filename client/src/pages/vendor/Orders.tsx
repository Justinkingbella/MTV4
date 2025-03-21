import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import VendorLayout from "@/components/layout/VendorLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Search, MoreVertical, Eye, CheckCircle, TruckIcon, XCircle, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  paymentStatus: "paid" | "unpaid" | "refunded";
  items: OrderItem[];
  shippingDetails: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function VendorOrders() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        if (!userData?.id) {
          return;
        }
        
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
            items: [
              {
                id: "item1",
                productId: "prod1",
                name: "Premium Wireless Headphones",
                price: 129.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
              }
            ],
            shippingDetails: {
              address: "123 Main St",
              city: "Anytown",
              state: "NY",
              postalCode: "12345",
              country: "USA"
            }
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
            items: [
              {
                id: "item2",
                productId: "prod2",
                name: "Bluetooth Speaker",
                price: 89.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab"
              }
            ],
            shippingDetails: {
              address: "456 Oak Ave",
              city: "Big City",
              state: "CA",
              postalCode: "90210",
              country: "USA"
            }
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
            items: [
              {
                id: "item3",
                productId: "prod3",
                name: "Smart Watch Series 3",
                price: 149.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a"
              },
              {
                id: "item4",
                productId: "prod4",
                name: "USB-C Fast Charger",
                price: 29.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1628815113969-0484c8f0626d"
              },
              {
                id: "item5",
                productId: "prod5",
                name: "Wireless Earbuds",
                price: 69.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605"
              }
            ],
            shippingDetails: {
              address: "789 Pine Rd",
              city: "Smallville",
              state: "TX",
              postalCode: "75001",
              country: "USA"
            }
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
            items: [
              {
                id: "item6",
                productId: "prod6",
                name: "Phone Stand",
                price: 24.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07"
              },
              {
                id: "item7",
                productId: "prod7",
                name: "Screen Protector Pack",
                price: 12.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1621330396173-e41b1cafd17f"
              },
              {
                id: "item8",
                productId: "prod8",
                name: "Phone Case",
                price: 19.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1541877590-a11549c6540b"
              }
            ],
            shippingDetails: {
              address: "321 Cedar Ln",
              city: "Metropolis",
              state: "IL",
              postalCode: "60007",
              country: "USA"
            }
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
            items: [
              {
                id: "item9",
                productId: "prod9",
                name: "Portable External SSD",
                price: 129.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1597331900882-f7124ef1b5f8"
              },
              {
                id: "item10",
                productId: "prod10",
                name: "Wireless Mouse",
                price: 59.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1624072213576-86d722c8cf0e"
              }
            ],
            shippingDetails: {
              address: "654 Spruce St",
              city: "New Town",
              state: "WA",
              postalCode: "98001",
              country: "USA"
            }
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
            items: [
              {
                id: "item11",
                productId: "prod11",
                name: "Wireless Keyboard",
                price: 84.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1616244013240-227c9154a04d"
              },
              {
                id: "item12",
                productId: "prod12",
                name: "USB Hub",
                price: 39.99,
                quantity: 1,
                imageUrl: "https://images.unsplash.com/photo-1661255815831-3a5dd5b06369"
              }
            ],
            shippingDetails: {
              address: "987 Maple Dr",
              city: "Old City",
              state: "FL",
              postalCode: "33101",
              country: "USA"
            }
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
  }, [userData?.id, toast]);
  
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
      
      // If we're currently viewing this order, update the selected order too
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
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
  
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
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
    <VendorLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-600">View and manage your orders</p>
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
                  : "You don't have any orders yet"
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
                    <TableHead>Items</TableHead>
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
                      <TableCell>{order.items.length}</TableCell>
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
                            <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
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
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Report Issue
                            </DropdownMenuItem>
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
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Review and manage order information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Status</h3>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeClasses(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Order Date</h3>
                  <p className="mt-1 text-sm">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Total</h3>
                  <p className="mt-1 text-lg font-bold">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Customer Information */}
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                    <p className="text-sm">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                    <p className="text-sm">{selectedOrder.shippingDetails.address}</p>
                    <p className="text-sm">
                      {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} {selectedOrder.shippingDetails.postalCode}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingDetails.country}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-md divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <DialogFooter className="flex gap-2">
                {selectedOrder.status === "pending" && (
                  <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "processing")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Order
                  </Button>
                )}
                {selectedOrder.status === "processing" && (
                  <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "shipped")}>
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </Button>
                )}
                {selectedOrder.status === "shipped" && (
                  <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "delivered")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
                {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </VendorLayout>
  );
}
