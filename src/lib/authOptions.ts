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
                    email: user.email,
                    role: user.role,
                } as any;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
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
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    await connectDB();

                    const existingUser = await User.findOne({
                        email: profile?.email
                    });

                    if (!existingUser) {
                        const usernameBase = profile?.email?.split('@')[0] || 'user';
                        let username = usernameBase;
                        let counter = 1;

                        while (await User.findOne({ username })) {
                            username = `${usernameBase}${counter}`;
                            counter++;
                        }

                        // Pastikan kelompok valid
                        const newUser = new User({
                            nama: profile?.name || 'User Google',
                            username: username,
                            email: profile?.email || '',
                            password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 12),
                            kelompok: 'Default', // Pastikan nilai ini valid
                            role: 'peternak',
                            status: 'Aktif'
                        });

                        await newUser.save();
                    }
                    return true;
                } catch (error) {
                    console.error("Error in Google signIn callback:", error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user, account, profile }) {
            if (user) {
                token.role = (user as any).role;
                token.dbId = (user as any).id; // Simpan ID database
            }

            // Untuk user Google, ambil data dari database
            if (account?.provider === "google" && profile?.email) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ email: profile.email });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.dbId = dbUser._id.toString(); // Simpan ID database
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                // GUNAKAN token.dbId untuk ID database, bukan token.sub
                (session.user as any).id = token.dbId || token.sub;

                // Backup: Ambil dari database jika masih belum ada ID
                if (!(session.user as any).id && session.user.email) {
                    try {
                        await connectDB();
                        const dbUser = await User.findOne({ email: session.user.email });
                        if (dbUser) {
                            (session.user as any).role = dbUser.role;
                            (session.user as any).id = dbUser._id.toString();
                        }
                    } catch (error) {
                        console.error("Error fetching user data in session:", error);
                    }
                }
            }
            return session;
        },

        async redirect({ url, baseUrl }) {
            // Redirect ke dashboard/peternak setelah login Google
            if (url.includes('/api/auth/signin')) {
                return `${baseUrl}/dashboard/peternak`;
            }
            return url;
        }
    },
    pages: {
        signIn: '/login',
    },
};