import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            username?: string; // ✅ biar bisa dipakai tanpa error
        };
    }

    interface User {
        id: string;
        username?: string;
    }
}
