import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing, CreateListingInput, ProductCategory } from '../types/database';
import { MOCK_LISTINGS } from '../constants/mockData';
import { supabase } from '../lib/supabase';

interface ListingContextType {
  listings: Listing[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | 'Tümü';
  setSelectedCategory: (c: ProductCategory | 'Tümü') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  addListing: (input: CreateListingInput) => Promise<Listing>;
  extendListingDeadline: (id: string, daysToAdd?: number) => Promise<void>;
  markListingAsSold: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  refreshListings: () => Promise<void>;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Tümü'>('Tümü');
  const [selectedCity, setSelectedCity] = useState<string>('Tüm Türkiye');

  // Supabase'den güncel ilanları çek
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Gerçek supabase verisi yoksa veya henüz eklenmediyse mock verilerle devam et
        console.log('Supabase bağlantısı dev modunda, örnek veriler gösteriliyor.');
      } else {
        setListings(data as Listing[]);
      }
    } catch (err) {
      console.log('Veri yükleme notu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const addListing = async (input: CreateListingInput): Promise<Listing> => {
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      user_id: 'current-farmer',
      title: input.title,
      description: input.description,
      category: input.category,
      quantity: input.quantity,
      unit: input.unit,
      price_per_unit: input.price_per_unit,
      delivery_type: input.delivery_type,
      harvest_end_date: input.harvest_end_date,
      images: input.images.length > 0 ? input.images : [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1280&q=80'
      ],
      city: input.city,
      district: input.district,
      village: input.village,
      status: 'active',
      views_count: 1,
      created_at: new Date().toISOString(),
      profiles: {
        id: 'current-farmer',
        full_name: input.farmer_name || 'Hüseyin Tarım (Ben)',
        phone_number: input.phone_number || '05321234567',
        city: input.city,
        district: input.district,
        role: 'farmer',
        bio: 'Doğrudan üretici.',
        created_at: new Date().toISOString(),
      },
    };

    // Önce yerel duruma ekle (hızlı çiftçi deneyimi)
    setListings(prev => [newListing, ...prev]);

    // Arka planda Supabase'e yazmayı dene
    try {
      await supabase.from('listings').insert([
        {
          title: input.title,
          description: input.description,
          category: input.category,
          quantity: input.quantity,
          unit: input.unit,
          price_per_unit: input.price_per_unit,
          delivery_type: input.delivery_type,
          harvest_end_date: input.harvest_end_date,
          images: newListing.images,
          city: input.city,
          district: input.district,
          village: input.village,
          status: 'active',
        }
      ]);
    } catch (err) {
      console.log('Supabase insert log:', err);
    }

    return newListing;
  };

  const extendListingDeadline = async (id: string, daysToAdd: number = 3) => {
    setListings(prev =>
      prev.map(item => {
        if (item.id === id) {
          const currentEnd = new Date(item.harvest_end_date).getTime();
          const baseDate = currentEnd > Date.now() ? currentEnd : Date.now();
          const newDate = new Date(baseDate + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...item,
            harvest_end_date: newDate,
            status: 'active' as const,
          };
        }
        return item;
      })
    );

    try {
      const listing = listings.find(l => l.id === id);
      if (listing) {
        const currentEnd = new Date(listing.harvest_end_date).getTime();
        const baseDate = currentEnd > Date.now() ? currentEnd : Date.now();
        const newDate = new Date(baseDate + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('listings')
          .update({ harvest_end_date: newDate, status: 'active' })
          .eq('id', id);
      }
    } catch (err) {
      console.log('Supabase update log:', err);
    }
  };

  const markListingAsSold = async (id: string) => {
    setListings(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'sold' as const } : item))
    );

    try {
      await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    } catch (err) {
      console.log('Supabase mark sold log:', err);
    }
  };

  const deleteListing = async (id: string) => {
    setListings(prev => prev.filter(item => item.id !== id));

    try {
      await supabase.from('listings').delete().eq('id', id);
    } catch (err) {
      console.log('Supabase delete log:', err);
    }
  };

  return (
    <ListingContext.Provider
      value={{
        listings,
        isLoading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedCity,
        setSelectedCity,
        addListing,
        extendListingDeadline,
        markListingAsSold,
        deleteListing,
        refreshListings: fetchListings,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
};

export function useListings() {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
}
