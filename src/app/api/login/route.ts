import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // 👉 Di sini biasanya cek ke database
        if (email === "test@example.com" && password === "123456") {
            return NextResponse.json({ message: "Login success" }, { status: 200 });
        }

        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    } catch (err) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
