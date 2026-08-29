import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Clears the session cookie. A plain POST (not a Server Action) so it can be
// triggered from a simple <form method="post"> sign-out button without
// pulling in client JS.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
