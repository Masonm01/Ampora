import { getDataFromToken } from "@/helpers/getDataFromToken";

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
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}