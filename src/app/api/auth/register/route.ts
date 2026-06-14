import { NextRequest, NextResponse } from "next/server";
import { supabaseSignUp } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "דואר אלקטרוני וסיסמה נדרשים" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להיות 6 תווים לפחות" },
        { status: 400 }
      );
    }

    const result = await supabaseSignUp(
      email,
      password,
      name || email.split("@")[0]
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "שגיאה בהרשמה" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { email, name: name || email.split("@")[0] },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "שגיאה בהרשמה" },
      { status: 500 }
    );
  }
}
