import { deleteUserByAdmin } from "../deleteUser";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        if (!uid) {
            return new Response("Missing uid", { status: 400 });
        }

        await deleteUserByAdmin(uid);

        return Response.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return new Response(err.message, { status: 500 });
    }
}