
import {connect} from '@/dbConfig/dbsConfig';
import User from "@/models/userModel"
import { NextRequest, NextResponse } from 'next/server';
import { triggerVerification } from '@/helpers/triggerVerification';


connect();


export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
    const {username, email, password, state, city} = reqBody

        console.log(reqBody);

        // check if user already exists
        const user = await User.findOne({email})

        if (user) {
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        const newUser = new User ({
            username,
            email,
            password,
            state,
            city
        })


        const savedUser = await newUser.save();
        // Send verification email in the background
        triggerVerification(savedUser).catch((err) => console.error('Email error:', err));
        console.log(savedUser);

        return NextResponse.json({
            message: "Created User Succesfully. Verification email sent.",
            success: true,
            savedUser
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}