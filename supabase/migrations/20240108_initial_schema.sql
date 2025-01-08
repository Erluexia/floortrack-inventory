-- Create enum for item status
CREATE TYPE item_status AS ENUM ('good', 'maintenance', 'low');

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    status item_status NOT NULL DEFAULT 'good',
    room_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create items_history table
CREATE TABLE IF NOT EXISTS public.items_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    status item_status NOT NULL,
    room_number TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL,
    item_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    username TEXT,
    previous_status item_status,
    current_status item_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to count items by room
CREATE OR REPLACE FUNCTION count_items_by_room()
RETURNS TABLE (
    room_number TEXT,
    total_count TEXT,
    good_count TEXT,
    maintenance_count TEXT,
    replacement_count TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.room_number,
        SUM(i.quantity)::TEXT as total_count,
        SUM(CASE WHEN i.status = 'good' THEN i.quantity ELSE 0 END)::TEXT as good_count,
        SUM(CASE WHEN i.status = 'maintenance' THEN i.quantity ELSE 0 END)::TEXT as maintenance_count,
        SUM(CASE WHEN i.status = 'low' THEN i.quantity ELSE 0 END)::TEXT as replacement_count
    FROM items i
    GROUP BY i.room_number;
END;
$$;

-- Create RLS policies
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for items table
CREATE POLICY "Enable read access for authenticated users" ON public.items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.items
    FOR DELETE TO authenticated USING (true);

-- Create policies for items_history table
CREATE POLICY "Enable read access for authenticated users" ON public.items_history
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.items_history
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for activity_logs table
CREATE POLICY "Enable read access for authenticated users" ON public.activity_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX items_room_number_idx ON public.items(room_number);
CREATE INDEX items_history_room_number_idx ON public.items_history(room_number);
CREATE INDEX activity_logs_room_number_idx ON public.activity_logs(room_number);