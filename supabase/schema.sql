-- ==============================================================================
-- ÇİFTÇİDEN - SUPABASE POSTGRESQL VERİTABANI ŞEMASI & GÜVENLİK POLİTİKALARI (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TİPLERİ
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'buyer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type_enum AS ENUM ('Tarlada Teslim', 'Kargo Uygun', 'Nakliye Alıcıya Ait');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unit_type_enum AS ENUM ('kg', 'kasa', 'ton', 'çuval');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLOSU
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'farmer',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LISTINGS TABLOSU
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- Sebze, Meyve, Bakliyat, Narenciye, Yeşillik, Diğer
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit unit_type_enum NOT NULL DEFAULT 'kg',
    price_per_unit NUMERIC NOT NULL CHECK (price_per_unit >= 0),
    delivery_type delivery_type_enum NOT NULL DEFAULT 'Tarlada Teslim',
    harvest_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status listing_status NOT NULL DEFAULT 'active',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- İndeksler (Sorgu performansı ve tarla vitrini filtreleri için)
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_city_district ON public.listings(city, district);
CREATE INDEX IF NOT EXISTS idx_listings_harvest_end_date ON public.listings(harvest_end_date);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 5. SÜRESİ DOLAN İLANLARI OTOMATİK PASİFE ALMA MEKANİZMASI
-- harvest_end_date geçmiş olan ve status = 'active' kalan ilanları 'expired' yapar
CREATE OR REPLACE FUNCTION public.check_and_expire_listings()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.listings
    SET status = 'expired',
        updated_at = timezone('utc'::text, now())
    WHERE status = 'active'
      AND harvest_end_date <= timezone('utc'::text, now());
      
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Herhangi bir ilan listelendiğinde veya güncellendiğinde tetiklenebilecek trigger
CREATE OR REPLACE FUNCTION public.trigger_expire_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.harvest_end_date <= timezone('utc'::text, now()) AND NEW.status = 'active' THEN
        NEW.status := 'expired';
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_expiration_on_listing ON public.listings;
CREATE TRIGGER trg_check_expiration_on_listing
    BEFORE INSERT OR UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_expire_on_update();

-- Yeni auth.users oluşturulduğunda profil tablosunu otomatik oluşturan trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, city, district, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Üretici'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Antalya'),
        COALESCE(NEW.raw_user_meta_data->>'district', 'Kumluca'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'farmer'::user_role)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- İlan görüntülenme sayısını güvenli artıran stored function (RPC)
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.listings
    SET views_count = views_count + 1
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Profiller herkes tarafından okunabilir"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini ekleyebilir"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Listings RLS
-- Herkes aktif veya satılmış ilanları görebilir (veya ilan sahibi kendi expired ilanlarını da görebilir)
CREATE POLICY "İlanlar genel okumaya açıktır"
    ON public.listings FOR SELECT
    USING (
        status IN ('active', 'sold') 
        OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

CREATE POLICY "Giriş yapmış üreticiler ilan oluşturabilir"
    ON public.listings FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Üreticiler sadece kendi ilanlarını güncelleyebilir"
    ON public.listings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Üreticiler sadece kendi ilanlarını silebilir"
    ON public.listings FOR DELETE
    USING (auth.uid() = user_id);

-- 7. SUPABASE STORAGE BUCKET VE POLİTİKALARI ('listing-images')
-- Not: Supabase arayüzünden veya migration ile bucket oluşturulmalıdır:
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Politikaları
CREATE POLICY "İlan fotoğrafları herkese açıktır"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

CREATE POLICY "Giriş yapmış kullanıcılar ilan fotoğrafı yükleyebilir"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Kullanıcılar kendi yükledikleri fotoğrafları güncelleyebilir"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'listing-images'
        AND auth.uid() = owner
    );

CREATE POLICY "Kullanıcılar kendi yükledikleri fotoğrafları silebilir"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'listing-images'
        AND auth.uid() = owner
    );
