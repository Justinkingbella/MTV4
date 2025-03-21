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
import { Search, MoreVertical, Check, X, Eye } from "lucide-react";
import { approveVendor, getVendors } from "@/lib/firebase";

interface Vendor {
  id: string;
  displayName: string;
  email: string;
  storeName: string;
  status: "pending" | "approved" | "suspended";
  productsCount: number;
  totalSales: number;
  registeredDate: string;
  approved: boolean;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        
        // Get all vendors from Firestore
        const vendorsData = await getVendors(undefined); // Pass undefined to get all vendors regardless of approval status
        
        // Get products per vendor
        const vendorsWithStats = await Promise.all(
          vendorsData.map(async (vendor) => {
            // Count products for this vendor
            const productsRef = collection(db, "products");
            const productsQuery = query(productsRef, where("vendorId", "==", vendor.id));
            const productsSnapshot = await getDocs(productsQuery);
            
            // Count total sales for this vendor
            const ordersRef = collection(db, "orders");
            const ordersQuery = query(
              ordersRef, 
              where("vendorId", "==", vendor.id),
              where("status", "in", ["delivered", "completed"]),
              where("paymentStatus", "==", "paid")
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            
            let totalSales = 0;
            ordersSnapshot.forEach((doc) => {
              const orderData = doc.data();
              totalSales += parseFloat(orderData.total || 0);
            });
            
            return {
              id: vendor.id,
              displayName: vendor.displayName || "",
              email: vendor.email || "",
              storeName: vendor.storeName || vendor.displayName || "",
              status: vendor.approved ? "approved" : vendor.suspended ? "suspended" : "pending",
              productsCount: productsSnapshot.size,
              totalSales,
              registeredDate: vendor.createdAt || new Date().toISOString(),
              approved: vendor.approved || false
            };
          })
        );
        
        setVendors(vendorsWithStats);
        setFilteredVendors(vendorsWithStats);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast({
          title: "Error",
          description: "Failed to load vendors. Please try again.",
          variant: "destructive",
        });
        
        // If there's an error loading from Firebase, provide fallback UI data
        // This ensures the UI doesn't break if Firestore is unavailable
        const fallbackVendors: Vendor[] = [
          {
            id: "pending-setup",
            displayName: "Pending Setup",
            email: "setup@example.com",
            storeName: "Pending Firebase Setup",
            status: "pending",
            productsCount: 0,
            totalSales: 0,
            registeredDate: new Date().toISOString(),
            approved: false
          }
        ];
        
        setVendors(fallbackVendors);
        setFilteredVendors(fallbackVendors);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendors();
  }, [toast]);
  
  useEffect(() => {
    filterVendors();
  }, [searchQuery, vendors, activeTab]);
  
  const filterVendors = () => {
    let result = [...vendors];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        vendor => 
          vendor.displayName.toLowerCase().includes(query) ||
          vendor.email.toLowerCase().includes(query) ||
          vendor.storeName.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab/status
    if (activeTab !== "all") {
      result = result.filter(vendor => vendor.status === activeTab);
    }
    
    setFilteredVendors(result);
  };
  
  const handleApproveVendor = async (vendorId: string) => {
    try {
      // Call Firebase to approve vendor
      await approveVendor(vendorId);
      
      // Update local state
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: "approved", approved: true } 
            : vendor
        )
      );
      
      // Add approval activity to the activities collection
      const vendorToApprove = vendors.find(v => v.id === vendorId);
      if (vendorToApprove) {
        await addActivity({
          type: "vendor_approve",
          title: `Approved vendor "${vendorToApprove.storeName || vendorToApprove.displayName}"`,
          createdAt: new Date().toISOString(),
          icon: "Check",
          iconBg: "bg-green-100",
          iconColor: "text-green-600"
        });
      }
      
      toast({
        title: "Vendor Approved",
        description: "The vendor has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving vendor:", error);
      toast({
        title: "Error",
        description: "Failed to approve vendor. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSuspendVendor = async (vendorId: string) => {
    try {
      // Update vendor in Firestore
      await updateDoc(doc(db, "users", vendorId), {
        suspended: true,
        suspendedAt: new Date().toISOString(),
      });
      
      // Update local state
      setVendors(prevVendors => 
        prevVendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: "suspended" } 
            : vendor
        )
      );
      
      // Add suspension activity to the activities collection
      const vendorToSuspend = vendors.find(v => v.id === vendorId);
      if (vendorToSuspend) {
        await addActivity({
          type: "vendor_suspend",
          title: `Suspended vendor "${vendorToSuspend.storeName || vendorToSuspend.displayName}"`,
          createdAt: new Date().toISOString(),
          icon: "X",
          iconBg: "bg-red-100",
          iconColor: "text-red-600"
        });
      }
      
      toast({
        title: "Vendor Suspended",
        description: "The vendor has been suspended successfully.",
      });
    } catch (error) {
      console.error("Error suspending vendor:", error);
      toast({
        title: "Error",
        description: "Failed to suspend vendor. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to add activities to Firestore
  const addActivity = async (activityData: any) => {
    try {
      const activitiesRef = collection(db, "activities");
      const newActivityRef = doc(activitiesRef);
      
      await setDoc(newActivityRef, {
        id: newActivityRef.id,
        ...activityData
      });
      
      return newActivityRef.id;
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Vendors</h1>
        <p className="text-sm text-gray-600">Manage vendors on your platform</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Vendors Management</CardTitle>
              <CardDescription>
                View, approve, and manage vendor accounts
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search vendors..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>Add Vendor</Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Vendors</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-2">No vendors found</p>
              <p className="text-sm text-gray-400">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : activeTab !== "all" 
                  ? `No vendors with status: ${activeTab}` 
                  : "There are no vendors yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{vendor.displayName}</p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{vendor.storeName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : vendor.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{vendor.productsCount}</TableCell>
                      <TableCell className="text-right">${vendor.totalSales.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {new Date(vendor.registeredDate).toLocaleDateString()}
                      </TableCell>
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
                            {vendor.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleApproveVendor(vendor.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {vendor.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleSuspendVendor(vendor.id)}>
                                <X className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {vendor.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleApproveVendor(vendor.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Reinstate
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
