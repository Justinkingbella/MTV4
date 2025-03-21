import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { getProductById } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { Loader2, Heart, ShoppingCart, Star, Truck, Clock, CheckCircle, User, MessageCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendor: {
    id: string;
    name: string;
    rating: number;
  };
  specifications: Record<string, string>;
  stock: number;
  rating: number;
  reviews: Review[];
  relatedProducts: RelatedProduct[];
}

interface Review {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductDetails() {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [match, params] = useRoute("/product/:id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        
        // In a real app, we would fetch from Firebase
        // const productData = await getProductById(params.id);
        
        // For now, use mock data
        const mockProduct: Product = {
          id: params.id,
          name: "Premium Wireless Headphones",
          description: "Experience superior sound quality with our Premium Wireless Headphones. Featuring advanced noise cancellation technology, these headphones deliver immersive audio while the comfortable over-ear design ensures you can enjoy your music for hours without discomfort. With a 30-hour battery life and fast-charging capability, you'll never be without your favorite tunes for long.",
          price: 129.99,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
            "https://images.unsplash.com/photo-1594386541968-10ede51d75e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80",
            "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
          ],
          category: "Electronics",
          vendor: {
            id: "v1",
            name: "AudioTech",
            rating: 4.8
          },
          specifications: {
            "Connectivity": "Bluetooth 5.0",
            "Battery Life": "30 hours",
            "Noise Cancellation": "Active",
            "Weight": "250g",
            "Color": "Matte Black",
            "Warranty": "1 Year",
          },
          stock: 45,
          rating: 4.8,
          reviews: [
            {
              id: "r1",
              userName: "John D.",
              rating: 5,
              date: "2023-05-20",
              comment: "These headphones are amazing! The sound quality is exceptional and the noise cancellation works really well. Battery life is impressive too."
            },
            {
              id: "r2",
              userName: "Sarah M.",
              rating: 4,
              date: "2023-05-15",
              comment: "Good quality headphones. Comfortable to wear for long periods and the sound is clear. Only giving 4 stars because the app is a bit buggy."
            },
            {
              id: "r3",
              userName: "Michael T.",
              rating: 5,
              date: "2023-05-10",
              comment: "Best headphones I've ever owned! The sound is crystal clear and the noise cancellation is perfect for my commute."
            }
          ],
          relatedProducts: [
            {
              id: "p1",
              name: "Wireless Earbuds",
              price: 79.99,
              imageUrl: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
              id: "p2",
              name: "Bluetooth Speaker",
              price: 89.99,
              imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            },
            {
              id: "p3",
              name: "Smart Watch Series 3",
              price: 149.99,
              imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            }
          ]
        };
        
        setProduct(mockProduct);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [params?.id, toast]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      vendorId: product.vendor.id
    });
  };
  
  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? `${product.name} has been removed from your wishlist.` 
        : `${product.name} has been added to your wishlist.`,
    });
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/">
              <span className="hover:text-gray-900 cursor-pointer">Home</span>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/categories/${product.category.toLowerCase()}`}>
              <span className="hover:text-gray-900 cursor-pointer">{product.category}</span>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
        
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-gray-100 w-full">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-auto object-contain aspect-square"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`rounded border-2 h-20 w-20 flex-shrink-0 overflow-hidden ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.reviews.length} reviews)</span>
                </div>
                <div className="text-sm text-gray-600">
                  <Link href={`/vendor/${product.vendor.id}`}>
                    <span className="text-primary hover:underline cursor-pointer">
                      Sold by {product.vendor.name}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="space-y-4">
              {/* Stock Status */}
              <div className="flex items-center text-sm">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">
                      In Stock
                      {product.stock < 10 && (
                        <span className="ml-1 text-amber-600">
                          (Only {product.stock} left)
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
              
              {/* Delivery Estimate */}
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-5 w-5 mr-2" />
                <span>Delivery estimate: 3-5 business days</span>
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center">
              <span className="mr-3 text-sm font-medium text-gray-900">Quantity:</span>
              <div className="flex border rounded">
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <div className="px-4 py-1 text-center min-w-[40px]">{quantity}</div>
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100" 
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className={isWishlisted ? "text-red-500 border-red-500 hover:bg-red-50" : ""}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="specifications">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="pt-6">
              <Card>
                <CardContent className="p-6">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <th className="py-3 text-left text-sm font-medium text-gray-900 w-1/3">{key}</th>
                          <td className="py-3 text-sm text-gray-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium">{product.rating} out of 5</span>
                      <span className="ml-4 text-sm text-gray-600">{product.reviews.length} customer reviews</span>
                    </div>
                    
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              {review.avatar ? (
                                <img 
                                  src={review.avatar} 
                                  alt={review.userName} 
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <User className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-xs text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="mt-4">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Write a Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="pt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                      <p className="text-gray-600">
                        We ship to most countries worldwide. Standard shipping takes 3-5 business days for domestic orders and 7-14 days for international orders.
                      </p>
                      <ul className="list-disc list-inside mt-2 text-gray-600">
                        <li>Free shipping on orders over $50</li>
                        <li>Expedited shipping options available at checkout</li>
                        <li>Tracked shipping with delivery confirmation</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Return Policy</h3>
                      <p className="text-gray-600">
                        We offer a 30-day return policy for most items. To be eligible for a return, your item must be unused and in the same condition that you received it.
                      </p>
                      <ul className="list-disc list-inside mt-2 text-gray-600">
                        <li>Returns accepted within 30 days of delivery</li>
                        <li>Refunds processed within 5-7 business days</li>
                        <li>Exchanges available for defective items</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                <div className="group cursor-pointer bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow transition-shadow">
                  <div className="overflow-hidden aspect-square">
                    <img 
                      src={relatedProduct.imageUrl} 
                      alt={relatedProduct.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <p className="font-bold text-gray-900">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
