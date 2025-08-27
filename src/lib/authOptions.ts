// lib/authOptions.ts
import { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./dbConnect";
import User from "../models/User";
import bcrypt from "bcryptjs";

// Interface untuk Facebook profile
interface FacebookProfile extends Profile {
    id: string;
    name: string;
    email?: string;
    picture?: {
        data: {
            url: string;
        };
    };
}

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
                    username: user.username,
                    nama: user.nama,
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
                        $or: [
                            { email: profile?.email },
                            { googleId: profile?.sub }
                        ]
                    });

                    if (!existingUser) {
                        const usernameBase = profile?.email?.split('@')[0] || 'user';
                        let username = usernameBase;
                        let counter = 1;

                        while (await User.findOne({ username })) {
                            username = `${usernameBase}${counter}`;
                            counter++;
                        }

                        const newUser = new User({
                            nama: profile?.name || 'User Google',
                            username: username,
                            email: profile?.email || '',
                            password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 12),
                            kelompok: 'Default',
                            role: 'peternak',
                            status: 'Aktif',
                            googleId: profile?.sub,
                            provider: 'google'
                        });

                        await newUser.save();
                    }
                    return true;
                } catch (error) {
                    console.error("Error in Google signIn callback:", error);
                    return false;
                }
            }

            // Handle Facebook login
            if (account?.provider === "facebook") {
                try {
                    await connectDB();

                    const facebookProfile = profile as FacebookProfile;

                    const existingUser = await User.findOne({
                        $or: [
                            { email: facebookProfile?.email },
                            { facebookId: facebookProfile?.id }
                        ]
                    });

                    if (!existingUser) {
                        const usernameBase = facebookProfile?.email?.split('@')[0] || `fb_${facebookProfile?.id}`;
                        let username = usernameBase;
                        let counter = 1;

                        while (await User.findOne({ username })) {
                            username = `${usernameBase}${counter}`;
                            counter++;
                        }

                        const newUser = new User({
                            nama: facebookProfile?.name || 'User Facebook',
                            username: username,
                            email: facebookProfile?.email || '',
                            password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 12),
                            kelompok: 'Default',
                            role: 'peternak',
                            status: 'Aktif',
                            facebookId: facebookProfile?.id,
                            provider: 'facebook'
                        });

                        await newUser.save();
                    }
                    return true;
                } catch (error) {
                    console.error("Error in Facebook signIn callback:", error);
                    return false;
                }
            }

            return true;
        },

        async jwt({ token, user, account, profile }) {
            // Handle credentials login
            if (user) {
                token.role = (user as any).role;
                token.dbId = (user as any).id;
                token.username = (user as any).username;
                token.nama = (user as any).nama;
            }

            // Untuk user Google, ambil data dari database
            if (account?.provider === "google" && profile?.email) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({
                        $or: [
                            { email: profile.email },
                            { googleId: profile.sub }
                        ]
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.dbId = dbUser._id.toString();
                        token.username = dbUser.username;
                        token.nama = dbUser.nama;
                    }
                } catch (error) {
                    console.error("Error fetching Google user data:", error);
                }
            }

            // Untuk user Facebook, ambil data dari database
            if (account?.provider === "facebook" && profile) {
                try {
                    await connectDB();
                    const facebookProfile = profile as FacebookProfile;

                    const dbUser = await User.findOne({
                        $or: [
                            { email: facebookProfile.email },
                            { facebookId: facebookProfile.id }
                        ]
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.dbId = dbUser._id.toString();
                        token.username = dbUser.username;
                        token.nama = dbUser.nama;
                    }
                } catch (error) {
                    console.error("Error fetching Facebook user data:", error);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.dbId || token.sub;
                (session.user as any).username = token.username;
                (session.user as any).nama = token.nama;

                // Backup: Ambil dari database jika masih belum ada ID
                if (!(session.user as any).id && session.user.email) {
                    try {
                        await connectDB();
                        const dbUser = await User.findOne({ email: session.user.email });
                        if (dbUser) {
                            (session.user as any).role = dbUser.role;
                            (session.user as any).id = dbUser._id.toString();
                            (session.user as any).username = dbUser.username;
                            (session.user as any).nama = dbUser.nama;
                        }
                    } catch (error) {
                        console.error("Error fetching user data in session:", error);
                    }
                }
            }
            return session;
        },

        async redirect({ url, baseUrl }) {
            // Redirect ke dashboard/peternak setelah login
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