import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatCard from "@/components/ui/stat-card";
import ActivityCard from "@/components/ui/activity-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

// Stats
interface Stats {
  revenue: number;
  newUsers: number;
  activeVendors: number;
  pendingOrders: number;
}

// Activities
interface Activity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  image?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    newUsers: 0,
    activeVendors: 0,
    pendingOrders: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState({
    vendors: 0,
    products: 0,
    withdrawals: 0
  });
  const [supportTickets, setSupportTickets] = useState({
    open: 0,
    inProgress: 0,
    resolvedToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stats
        const revenueData = await fetchRevenue();
        const newUsersCount = await fetchNewUsers();
        const activeVendorsCount = await fetchActiveVendors();
        const pendingOrdersCount = await fetchPendingOrders();
        
        setStats({
          revenue: revenueData.total,
          newUsers: newUsersCount,
          activeVendors: activeVendorsCount,
          pendingOrders: pendingOrdersCount
        });
        
        // Fetch activities
        const recentActivities = await fetchActivities();
        setActivities(recentActivities);
        
        // Fetch pending approvals
        const pendingVendors = await fetchPendingVendors();
        const pendingProducts = await fetchPendingProducts();
        const pendingWithdrawals = await fetchPendingWithdrawals();
        
        setPendingApprovals({
          vendors: pendingVendors,
          products: pendingProducts,
          withdrawals: pendingWithdrawals
        });
        
        // Fetch support tickets
        const tickets = await fetchSupportTickets();
        setSupportTickets(tickets);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Real Firebase queries for dashboard data
  const fetchRevenue = async () => {
    try {
      // Get all the completed orders
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef, 
        where("status", "in", ["delivered", "completed"]),
        where("paymentStatus", "==", "paid")
      );
      
      const querySnapshot = await getDocs(q);
      let total = 0;
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        total += parseFloat(orderData.total || 0);
      });
      
      // Calculate change by comparing with last month's revenue
      // This would require more complex queries in a real app
      const change = 12.4; // Mock for now
      
      return { total, change };
    } catch (error) {
      console.error("Error calculating revenue:", error);
      return { total: 0, change: 0 };
    }
  };
  
  const fetchNewUsers = async () => {
    try {
      // Get users from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("createdAt", ">=", thirtyDaysAgo.toISOString())
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting new users:", error);
      return 0;
    }
  };
  
  const fetchActiveVendors = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", "vendor"),
        where("approved", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting active vendors:", error);
      return 0;
    }
  };
  
  const fetchPendingOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("status", "in", ["pending", "processing"])
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting pending orders:", error);
      return 0;
    }
  };
  
  const fetchActivities = async () => {
    try {
      // Get recent activities from activities collection
      const activitiesRef = collection(db, "activities");
      const q = query(
        activitiesRef,
        orderBy("createdAt", "desc"),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const activities: Activity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Format timestamp for display
        const timestamp = formatTimestamp(data.createdAt);
        
        activities.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          timestamp,
          image: data.image,
          icon: data.icon,
          iconBg: data.iconBg,
          iconColor: data.iconColor
        });
      });
      
      // If no activities found, return sample data for UI demonstration
      if (activities.length === 0) {
        return [
          {
            id: "1",
            type: "vendor_register",
            title: "New vendor registration activity will appear here",
            timestamp: "Just now",
            icon: "Store",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
          }
        ];
      }
      
      return activities;
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  };
  
  const fetchPendingVendors = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", "vendor"),
        where("approved", "==", false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting pending vendors:", error);
      return 0;
    }
  };
  
  const fetchPendingProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("approved", "==", false),
        where("status", "==", "pending")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting pending products:", error);
      return 0;
    }
  };
  
  const fetchPendingWithdrawals = async () => {
    try {
      const withdrawalsRef = collection(db, "withdrawals");
      const q = query(
        withdrawalsRef,
        where("status", "==", "pending")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting pending withdrawals:", error);
      return 0;
    }
  };
  
  const fetchSupportTickets = async () => {
    try {
      const ticketsRef = collection(db, "supportTickets");
      
      // Get open tickets
      const openQuery = query(
        ticketsRef,
        where("status", "==", "open")
      );
      const openSnapshot = await getDocs(openQuery);
      
      // Get in-progress tickets
      const inProgressQuery = query(
        ticketsRef,
        where("status", "==", "in-progress")
      );
      const inProgressSnapshot = await getDocs(inProgressQuery);
      
      // Get tickets resolved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resolvedTodayQuery = query(
        ticketsRef,
        where("status", "==", "resolved"),
        where("resolvedAt", ">=", today.toISOString())
      );
      const resolvedTodaySnapshot = await getDocs(resolvedTodayQuery);
      
      return {
        open: openSnapshot.size,
        inProgress: inProgressSnapshot.size,
        resolvedToday: resolvedTodaySnapshot.size
      };
    } catch (error) {
      console.error("Error counting support tickets:", error);
      return {
        open: 0,
        inProgress: 0,
        resolvedToday: 0
      };
    }
  };
  
  // Helper to format timestamps for displaying
  const formatTimestamp = (timestamp: string | number | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown time";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your platform activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          change={12.4} 
          trend="up" 
        />
        <StatCard 
          title="New Users" 
          value={stats.newUsers.toLocaleString()} 
          change={8.2} 
          trend="up" 
        />
        <StatCard 
          title="Active Vendors" 
          value={stats.activeVendors.toLocaleString()} 
          change={4.7} 
          trend="up" 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders.toLocaleString()} 
          change={-3.5} 
          trend="down" 
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="activities">
          <TabsList className="border-b border-gray-200 w-full justify-start">
            <TabsTrigger value="activities" className="py-3 px-4 text-sm font-medium">Recent Activities</TabsTrigger>
            <TabsTrigger value="vendors" className="py-3 px-4 text-sm font-medium">Top Vendors</TabsTrigger>
            <TabsTrigger value="orders" className="py-3 px-4 text-sm font-medium">Recent Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="pt-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Recent Activities</h3>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      imageUrl={activity.image}
                      icon={activity.icon as any}
                      iconBgColor={activity.iconBg}
                      iconColor={activity.iconColor}
                      title={activity.title}
                      timestamp={activity.timestamp}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vendors" className="pt-6">
            <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Top Performing Vendors</h3>
              <p className="text-gray-500">Select the "Vendors" tab in the sidebar to view all vendors.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="pt-6">
            <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Orders</h3>
              <p className="text-gray-500">Select the "Orders" tab in the sidebar to view all orders.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin Quick Actions Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-800">Pending Approvals</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">New Vendors</span>
                <span className="text-sm font-medium text-primary px-2 py-1 bg-blue-100 rounded-full">{pendingApprovals.vendors}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Product Submissions</span>
                <span className="text-sm font-medium text-primary px-2 py-1 bg-blue-100 rounded-full">{pendingApprovals.products}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Withdrawal Requests</span>
                <span className="text-sm font-medium text-primary px-2 py-1 bg-blue-100 rounded-full">{pendingApprovals.withdrawals}</span>
              </li>
            </ul>
            <div className="mt-5">
              <Button className="w-full" variant="default">
                View All Approvals
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-800">Support Tickets</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Open Tickets</span>
                <span className="text-sm font-medium text-red-500 px-2 py-1 bg-red-100 rounded-full">{supportTickets.open}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">In Progress</span>
                <span className="text-sm font-medium text-amber-500 px-2 py-1 bg-amber-100 rounded-full">{supportTickets.inProgress}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Resolved Today</span>
                <span className="text-sm font-medium text-green-500 px-2 py-1 bg-green-100 rounded-full">{supportTickets.resolvedToday}</span>
              </li>
            </ul>
            <div className="mt-5">
              <Button className="w-full" variant="default">
                View Support Center
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-800">Quick Links</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="p-3 h-auto flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Vendor</span>
              </Button>
              <Button variant="outline" className="p-3 h-auto flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>New Report</span>
              </Button>
              <Button variant="outline" className="p-3 h-auto flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>New Promo</span>
              </Button>
              <Button variant="outline" className="p-3 h-auto flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Events</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
