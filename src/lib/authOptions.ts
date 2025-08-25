// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./dbConnect";
import User from "../models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();

                const user = await User.findOne({
                    username: new RegExp(`^${credentials?.username}$`, "i"),
                });

                if (!user) throw new Error("User tidak ditemukan");

                const isPasswordValid = await bcrypt.compare(
                    credentials?.password || "",
                    user.password
                );
                if (!isPasswordValid) throw new Error("Password salah");

                return {
                    id: user._id.toString(),
                    name: user.username,
                    role: user.role,
                } as any;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.sub; // tambahkan ID user ke session
            }
            return session;
        },
    },
};