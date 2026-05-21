import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log("🚀 ROUTE HIT HO GAYA HAI!", request.url);
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // 1. Agar code hi nahi mila toh seedha wapas bhejo
  if (!code) {
    console.log("❌ No code found in URL");
    return NextResponse.redirect(`${origin}/login?error=no-code`)
  }

  try {
    const cookieStore = await cookies()

    // 2. Supabase Client Setup
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error("⚠️ Cookie Set Error:", error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              console.error("⚠️ Cookie Delete Error:", error)
            }
          },
        },
      }
    )

    // 3. Code Exchange
    console.log("⏳ Exchanging code for session...");
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("❌ Supabase Exchange Error:", error.message)
      return NextResponse.redirect(`${origin}/login?error=exchange-failed`)
    }

    // 4. Success Redirect
    console.log("✅ Session Created! Redirecting to Dashboard...");
    return NextResponse.redirect(`${origin}/dashboard`)

  } catch (err) {
    // 🛑 5. CRASH PROTECTION: Agar kuch bhi fail hua toh yahan aayega
    console.error("🚨 CRITICAL CRASH IN ROUTE:", err)
    return NextResponse.redirect(`${origin}/login?error=server-crash`)
  }
}