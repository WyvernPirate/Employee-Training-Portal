import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/firebaseConfig'; // Assuming firebaseConfig exports 'auth' and 'db'
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

interface AuthUser extends FirebaseUser {
  userType?: 'employee' | 'admin';
  // Add other custom properties you might fetch from Firestore
  firstName?: string;
  surname?: string;
  department?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  // Add signIn, signUp methods here later
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let userType: 'employee' | 'admin' | undefined = undefined;
        let customData: Partial<AuthUser> = {};
         let foundUserInFirestore = false;
        let firestoreDocId: string | undefined = undefined; // To store the actual Firestore doc ID


        // Attempt to fetch user type from Firestore
        // Check employees collection
        const employeesCollectionRef = collection(db, "employees");
        const empQuery = query(employeesCollectionRef, where("uid", "==", firebaseUser.uid));
        const empQuerySnapshot = await getDocs(empQuery);

        if (!empQuerySnapshot.empty) {
          const empDocSnap = empQuerySnapshot.docs[0]; // Assuming uid is unique
          if (empDocSnap.exists()) {
            userType = 'employee';
            customData = empDocSnap.data() as Partial<AuthUser>;
            firestoreDocId = empDocSnap.id; // Store the actual Firestore document ID
            foundUserInFirestore = true;
          }
        } else {
         // Check admins collection if not found in employees, also by querying 'uid' field
          const adminsCollectionRef = collection(db, "admin");
          const adminQuery = query(adminsCollectionRef, where("uid", "==", firebaseUser.uid));
          const adminQuerySnapshot = await getDocs(adminQuery);

          if (!adminQuerySnapshot.empty) {
            const adminDocSnap = adminQuerySnapshot.docs[0]; // Assuming uid is unique
            if (adminDocSnap.exists()) {
              userType = 'admin';
              customData = adminDocSnap.data() as Partial<AuthUser>;
              firestoreDocId = adminDocSnap.id; // Store the actual Firestore document ID
              foundUserInFirestore = true;
            }
          }
        }
       if (foundUserInFirestore && userType) {
          // Include the actual Firestore document ID if you need it elsewhere,
          // though currentUser.uid from Firebase Auth is the primary identifier.
          setCurrentUser({ ...firebaseUser, userType, ...customData, firestoreDocId } as AuthUser & { firestoreDocId?: string });
        } else {
          console.warn(`AuthContext: Firebase user ${firebaseUser.uid} exists but no valid Firestore record (employee/admin with matching uid field) found. Logging out.`);
          await firebaseSignOut(auth); 
          setCurrentUser(null); 
          }
        } else {
        // User is signed out
        setCurrentUser(null);
        }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    // localStorage items related to auth will be cleared by ProtectedRoute/App logic or here if needed
    localStorage.removeItem('isAuthenticated'); // Old system
    localStorage.removeItem('userType');      // Old system
    localStorage.removeItem('employeeId');    // Old system
    localStorage.removeItem('employeeFullName');
    localStorage.removeItem('employeeDepartment');
  };

  const value = { currentUser, loading, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};