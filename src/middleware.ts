import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Allow login API through
  if (req.nextUrl.pathname === "/api/login") return NextResponse.next();

  // Check auth cookie
  if (req.cookies.get("deposly_auth")?.value === "yes") {
    return NextResponse.next();
  }

  // Serve inline login page
  return new NextResponse(loginPage(), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|avatar-video-sm\\.mp4).*)"],
};

function loginPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Deposly Lite</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F1629 0%, #1a2342 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 { font-size: 24px; color: #111; margin-bottom: 4px; }
    .lite { font-size: 14px; color: #999; font-weight: normal; }
    .subtitle { font-size: 13px; color: #666; margin: 12px 0 24px; }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #ddd;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      color: #111;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #4F6EF7; }
    button {
      width: 100%;
      margin-top: 12px;
      padding: 12px;
      background: #4F6EF7;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #3d5ce0; }
    .error { color: #e53e3e; font-size: 13px; margin-top: 8px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Deposly <span class="lite">Lite</span></h1>
    <p class="subtitle">Enter password to continue</p>
    <form id="form">
      <input type="password" id="pw" placeholder="Password" autofocus />
      <button type="submit">Enter</button>
    </form>
    <p class="error" id="err">Incorrect password</p>
  </div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('pw').value;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        document.getElementById('err').style.display = 'block';
        document.getElementById('pw').value = '';
      }
    });
  </script>
</body>
</html>`;
}
