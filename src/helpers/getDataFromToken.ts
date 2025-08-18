import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";

export function getDataFromToken(request: NextRequest) {
    const token = request.cookies.get('token')?.value || '';
    if (!token) {
        return null;
    }

    try {
        const token = request.cookies.get('token')?.value || '';
        interface DecodedToken { id: string }
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedToken;
        return decodedToken.id;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        throw new Error('Invalid token' + message);
    }
}