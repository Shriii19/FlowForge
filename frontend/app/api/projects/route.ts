import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

type ProjectRow = {
  id: string;
  name: string;
  description?: string | null;
  members?: number | null;
  tags?: string[] | null;
  due?: string | null;
  created_at?: string | null;
};

// 1. Unified Mapper: Ensure keys match your DB exactly
const mapProjectRow = (row: ProjectRow) => ({
  id: row.id,
  name: row.name,
  desc: row.description || "", // Standardize on 'description'
  members: row.members ?? 0,
  tags: row.tags ?? [],
  due: row.due ?? null,
  createdAt: row.created_at, // Use the DB standard name
});

// Helper to initialize Supabase
const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const GET = async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

  const supabase = getSupabase();
  // IMPORTANT: This verifies the token
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Use the user JWT for RLS-protected reads.
  const supabaseAuthed = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: projects, error } = await supabaseAuthed
     .from('projects')
     .select("*")
     .eq("owner_id", userData.user.id)
     .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ projects: (projects || []).map(mapProjectRow) });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const payload = await request.json();
  const name = payload.name?.trim();

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Use Service Role only for things RLS can't handle. 
  // If RLS is set up, you can just use the standard 'supabase' client here.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: inserted, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert([{
        id: randomUUID(),
        name: name,
        description: payload.desc || "", // Matching the mapper
        owner_id: userData.user.id,
        members: payload.members ?? 1,
        due: payload.due ?? null,
        tags: payload.tags ?? [],
      }])
      .select('*')
      .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ project: mapProjectRow(inserted) }, { status: 201 });
}
