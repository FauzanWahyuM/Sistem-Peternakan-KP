// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/api/kuesioner/:path*",
        "/api/hasil/:path*",
        "/peternak/:path*",
        "/admin/:path*"
    ]
};