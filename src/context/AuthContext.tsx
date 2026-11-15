"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile } from "../lib/types";
import { fetchDefaultProfile } from "../lib/api";

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (p: Profile) => void;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  setProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async () => {
    try {
      const p = await fetchDefaultProfile();
      setProfile(p);
    } catch (e) {
      console.error("Failed to load initial profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile: loadProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
