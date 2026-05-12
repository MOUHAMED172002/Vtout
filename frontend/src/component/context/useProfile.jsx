import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useAuth } from "../../lib/AuthHooks";
import api from "../../services/api";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!isSignedIn) {
      setProfileUser(null);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await api.get("/profiles/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileUser(data);
    } catch (err) {
      console.error("Error fetching profile from DB:", err);
      // Fallback logic for clerk data if DB fails
      const fallback = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        fullname: clerkUser.fullName,
        role: clerkUser.publicMetadata?.role || "user",
        avatar_url: clerkUser.imageUrl
      };
      setProfileUser(fallback);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      fetchProfile();
    } else {
      setLoading(true);
    }
  }, [clerkLoaded, isSignedIn, clerkUser?.id]);

  const value = {
    user: profileUser,
    loading: loading || !clerkLoaded,
    error,
    refreshProfile: fetchProfile,
    isAuthenticated: isSignedIn
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
