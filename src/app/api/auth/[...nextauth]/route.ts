import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User"; // pastikan sudah ada model User

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                const user = await User.findOne({ username: credentials?.username });

                if (!user) {
                    throw new Error("User tidak ditemukan");
                }

                // cek password (anggap kamu sudah hash pake bcrypt)
                const bcrypt = require("bcryptjs");
                const passwordMatch = await bcrypt.compare(
                    credentials!.password,
                    user.password
                );

                if (!passwordMatch) {
                    throw new Error("Password salah");
                }

                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                };
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user, profile }) {
            if (user) {
                token.username =
                    (user as any).username ||
                    profile?.name ||
                    (profile?.email ? profile.email.split("@")[0] : "Peternak");
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.username = (token as any).username as string;
            }
            return session;
        },


        async redirect({ url, baseUrl }) {
            return baseUrl + "/dashboard/peternak";
        },
    },
});

export { handler as GET, handler as POST };
