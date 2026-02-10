import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

const CompaniesContext = createContext();

export function CompaniesProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      setLoading(true);
      setError(null);
      try {
        // Single API call to get all companies with cached data
        const response = await apiClient.getCompanies();
        
        if (!cancelled) {
          // Companies already include quarters from cache
          setCompanies(response?.companies || []);
          console.log(`Loaded ${response?.companies?.length} companies (${response?.cached} from cache)`);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load companies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCompanies();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies, loading, error }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error('useCompanies must be used within CompaniesProvider');
  }
  return context;
}
