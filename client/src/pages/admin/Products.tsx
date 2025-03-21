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
import { approveProduct, getProducts } from "@/lib/firebase";
import { Search, MoreVertical, Check, X, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  vendorName: string;
  vendorId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  stockQuantity: number;
  imageUrl: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, we would fetch from Firebase
        // For now, we'll use mock data
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Premium Wireless Headphones",
            price: 129.99,
            category: "Electronics",
            vendorName: "AudioTech",
            vendorId: "v1",
            status: "approved",
            createdAt: "2023-04-15",
            stockQuantity: 45,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
          },
          {
            id: "2",
            name: "Smart Watch Series 3",
            price: 149.99,
            category: "Electronics",
            vendorName: "TechWorld",
            vendorId: "v2",
            status: "pending",
            createdAt: "2023-05-10",
            stockQuantity: 32,
            imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a"
          },
          {
            id: "3",
            name: "Minimalist Chair (Grey)",
            price: 79.99,
            category: "Home & Garden",
            vendorName: "HomeDecor",
            vendorId: "v3",
            status: "approved",
            createdAt: "2023-03-22",
            stockQuantity: 15,
            imageUrl: "https://images.unsplash.com/photo-1567538096621-38d2284b23ff"
          },
          {
            id: "4",
            name: "Professional DSLR Camera",
            price: 899.99,
            category: "Electronics",
            vendorName: "TechWorld",
            vendorId: "v2",
            status: "rejected",
            createdAt: "2023-04-28",
            stockQuantity: 0,
            imageUrl: "https://images.unsplash.com/photo-1576786672534-638cf93d0e4a"
          },
          {
            id: "5",
            name: "Designer Sunglasses",
            price: 129.99,
            category: "Fashion",
            vendorName: "Fashionista",
            vendorId: "v4",
            status: "pending",
            createdAt: "2023-05-28",
            stockQuantity: 25,
            imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f"
          }
        ];
        
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);
  
  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, activeTab]);
  
  const filterProducts = () => {
    let result = [...products];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.vendorName.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab/status
    if (activeTab !== "all") {
      result = result.filter(product => product.status === activeTab);
    }
    
    setFilteredProducts(result);
  };
  
  const handleApproveProduct = async (productId: string) => {
    try {
      // In a real app, we would call Firebase here
      // await approveProduct(productId);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: "approved" } 
            : product
        )
      );
      
      toast({
        title: "Product Approved",
        description: "The product has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving product:", error);
      toast({
        title: "Error",
        description: "Failed to approve product. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectProduct = async (productId: string) => {
    try {
      // In a real app, we would call Firebase here
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: "rejected" } 
            : product
        )
      );
      
      toast({
        title: "Product Rejected",
        description: "The product has been rejected successfully.",
      });
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast({
        title: "Error",
        description: "Failed to reject product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <p className="text-sm text-gray-600">Manage products on your platform</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>
                Review, approve, and manage product listings
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-2">No products found</p>
              <p className="text-sm text-gray-400">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : activeTab !== "all" 
                  ? `No products with status: ${activeTab}` 
                  : "There are no products yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.vendorName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : product.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.stockQuantity}</TableCell>
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
                            {product.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveProduct(product.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectProduct(product.id)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {product.status === "rejected" && (
                              <DropdownMenuItem onClick={() => handleApproveProduct(product.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
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
