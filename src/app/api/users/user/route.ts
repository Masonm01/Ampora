// eslint-disable-next-line @typescript-eslint/no-unused-expressions
import { getDataFromToken } from "@/helpers/getDataFromToken";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
getDataFromToken;

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import {connect} from '@/dbConfig/dbsConfig';

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const user = await User.findOne({ _id: userId }).select('-password');
        return NextResponse.json({message: 'User fetched successfully', data: user }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error: ' + message }, { status: 500 });
    }
}