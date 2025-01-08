-- Create enum for item status
CREATE TYPE item_status AS ENUM ('good', 'maintenance', 'low');

-- Create current_status table (formerly items)
CREATE TABLE IF NOT EXISTS public.current_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    status item_status NOT NULL DEFAULT 'good',
    room_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create previous_status table (formerly items_history)
CREATE TABLE IF NOT EXISTS public.previous_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.current_status(id),
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
    FROM current_status i
    GROUP BY i.room_number;
END;
$$;

-- Create RLS policies
ALTER TABLE public.current_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for current_status table
CREATE POLICY "Enable read access for authenticated users" ON public.current_status
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.current_status
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.current_status
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.current_status
    FOR DELETE TO authenticated USING (true);

-- Create policies for previous_status table
CREATE POLICY "Enable read access for authenticated users" ON public.previous_status
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.previous_status
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for activity_logs table
CREATE POLICY "Enable read access for authenticated users" ON public.activity_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX current_status_room_number_idx ON public.current_status(room_number);
CREATE INDEX previous_status_room_number_idx ON public.previous_status(room_number);
CREATE INDEX activity_logs_room_number_idx ON public.activity_logs(room_number);