import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// User authentication functions
export const registerUser = async (email: string, password: string, displayName: string, role: string = "customer") => {
  try {
    // Create user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with displayName
    await updateProfile(user, { displayName });
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    });
    
    return user;
  } catch (error) {
    console.error("Error registering user: ", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out: ", error);
    throw error;
  }
};

export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data: ", error);
    throw error;
  }
};

// Product functions
export const addProduct = async (product: any, vendorId: string) => {
  try {
    const productsRef = collection(db, "products");
    const newProductRef = doc(productsRef);
    
    await setDoc(newProductRef, {
      ...product,
      id: newProductRef.id,
      vendorId,
      createdAt: new Date().toISOString(),
      approved: false,
    });
    
    return newProductRef.id;
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
};

export const updateProduct = async (productId: string, data: any) => {
  try {
    await updateDoc(doc(db, "products", productId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

export const approveProduct = async (productId: string) => {
  try {
    await updateDoc(doc(db, "products", productId), {
      approved: true,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error approving product: ", error);
    throw error;
  }
};

export const getProducts = async (filters: any = {}) => {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef);
    
    // Apply filters
    if (filters.vendorId) {
      q = query(productsRef, where("vendorId", "==", filters.vendorId));
    }
    
    if (filters.approved !== undefined) {
      q = query(q, where("approved", "==", filters.approved));
    }
    
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }
    
    const querySnapshot = await getDocs(q);
    const products: any[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return products;
  } catch (error) {
    console.error("Error getting products: ", error);
    throw error;
  }
};

export const getProductById = async (productId: string) => {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting product: ", error);
    throw error;
  }
};

// Order functions
export const createOrder = async (orderData: any) => {
  try {
    const ordersRef = collection(db, "orders");
    const newOrderRef = doc(ordersRef);
    
    await setDoc(newOrderRef, {
      ...orderData,
      id: newOrderRef.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    
    return newOrderRef.id;
  } catch (error) {
    console.error("Error creating order: ", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw error;
  }
};

export const getOrders = async (filters: any = {}) => {
  try {
    const ordersRef = collection(db, "orders");
    let q = query(ordersRef);
    
    // Apply filters
    if (filters.customerId) {
      q = query(ordersRef, where("customerId", "==", filters.customerId));
    }
    
    if (filters.vendorId) {
      q = query(q, where("vendorId", "==", filters.vendorId));
    }
    
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    
    const querySnapshot = await getDocs(q);
    const orders: any[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting orders: ", error);
    throw error;
  }
};

// Vendor functions
export const getVendors = async (approved: boolean = true) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "vendor"));
    
    const querySnapshot = await getDocs(q);
    const vendors: any[] = [];
    
    querySnapshot.forEach((doc) => {
      if (approved === undefined || doc.data().approved === approved) {
        vendors.push({ id: doc.id, ...doc.data() });
      }
    });
    
    return vendors;
  } catch (error) {
    console.error("Error getting vendors: ", error);
    throw error;
  }
};

export const approveVendor = async (vendorId: string) => {
  try {
    await updateDoc(doc(db, "users", vendorId), {
      approved: true,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error approving vendor: ", error);
    throw error;
  }
};

// File upload
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw error;
  }
};

export { auth, db, storage };
