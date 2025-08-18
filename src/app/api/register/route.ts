import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { fullName, username, email, password, confirmPassword } = await req.json();

        // 👉 Di sini kamu bisa simpan ke database
        // contoh dummy response
        return NextResponse.json(
            { message: "Register success", user: { email } },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
