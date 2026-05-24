
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const runtime = "nodejs";

type ProjectRow = {
  id: string;
  name: string;
  description?: string | null;
  desc?: string | null;
  members?: number | null;
  tags?: string[] | null;
  due?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email, password, name, username, mobile, description, members, due, tags } = payload || {};

    // Input validation
    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, username are required." }, 
        { status: 400 }
      );
    }

    // Username format validation
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." }, 
        { status: 400 }
      );
    }

    // Password strength
    const STRONG_PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        },
        { status: 400 }
      );
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3-20 characters." }, 
        { status: 400 }
      );
    }
    
    // Environment variables check
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error." }, 
        { status: 500 }
      );
    }
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        } 
      }
    );
    
    // 1. Check for duplicate username
    const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase().trim())
    .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Account already exists." }, 
        { status: 400 }
      );
    }


    // 3. Create user with admin privileges (email pre-confirmed)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        username: username.toLowerCase().trim(),
        mobile: mobile?.trim() || null,
      },
    });

    if (userError || !userData.user) {
      const message = (userError?.message || "").toLowerCase();

      if (
        message.includes("already registered") ||
        message.includes("already exists") ||
        message.includes("user already")
      ) {
        return NextResponse.json(
          { error: "Account already exists." },
          { status: 400 }
        );
      }
      
      console.error("User creation error:", userError);
      return NextResponse.json(
        { error: userError?.message || "Failed to create user." }, 
        { status: 400 }
      );
    }

    const user = userData.user;
    
    // 4. Create profile row
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: user.id,
        email: user.email!,
        name: user.user_metadata.full_name as string,
        username: user.user_metadata.username as string,
        mobile: user.user_metadata.mobile as string | null,
        updated_at: new Date().toISOString(),
      }]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Cleanup: Delete user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` }, 
        { status: 400 }
      );
    }
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert([{
        id: randomUUID(),
        name,
        description: description || null,
        owner_id: user.id,
        members: typeof members === 'number' ? members : (members ? Number(members) : 1),
        due: due ? new Date(due).toISOString().slice(0,10) : null,
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        created_at: new Date().toISOString(),
      }])
      .select('*')
      .single();
      
      if (projectError) {
      console.error("Project creation error:", projectError);
      // Cleanup: Delete user and profile if project creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      return NextResponse.json({ error: projectError.message || 'Failed to create project.' }, { status: 500 });
    }
    const apiProjects = {
      id: project.id,
      name: project.name,
      desc: project.desc ?? project.description ?? "",
      members: project.members ?? 0,
      tags: project.tags ?? [],
      due: project.due ?? null,
      createdAt: project.created_at ?? new Date().toISOString(),
    };
    // Single combined success response (no sensitive data)
    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      project: apiProjects
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error." }, 
      { status: 500 }
    );
  }
}
export const GET =  async (request: Request) => {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseURL, supabaseAnonKey, {
    auth: {autoRefreshToken: false, persistSession: false},
  });

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if(!token) return NextResponse.json({error: "Unauthorized"}, {status: 401});
  
  const {data: userData, error: userError} = await supabase.auth.getUser(token);
  if(userError || !userData?.user) return NextResponse.json({error: "Details not Found"}, {status: 401});

  const {data: projects, error} = await supabase
     .from('projects')
     .select("*")
     .eq("owner_id",userData.user.id)
     .order('created_at', {ascending: false});
  if(error) return NextResponse.json({error: error.message}, {status: 500});
  const apiProjects = (projects || []).map((row: ProjectRow) => ({
    id: row.id,
    name: row.name,
    desc: row.description ?? row.desc ?? "",
    members: row.members ?? 0,
    tags: row.tags ?? [],
    due: row.due ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  }));
  return NextResponse.json({ projects: apiProjects });
  
}
