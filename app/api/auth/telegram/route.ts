import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData } from '@/lib/telegram';
import { users } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { initData } = body;

        if (!initData) {
            return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
        }

        // 1. Validate Telegram Data
        const validationResult = validateTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN!);
        
        if (!validationResult || !validationResult.user) {
            return NextResponse.json({ error: 'Invalid or expired Telegram data' }, { status: 401 });
        }

        const telegramUser = validationResult.user;
        const userId = `tg_${telegramUser.id}`; // Consistent User ID format

        // 2. Find or Create User in Appwrite
        try {
            await users.get(userId);
        } catch (e: any) {
            if (e.code === 404) {
                // Create new user
                await users.create(
                    userId, 
                    undefined, // email (optional)
                    undefined, // phone (optional)
                    undefined, // password (optional)
                    `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()
                );
                
                // You could also store extra metadata in a database/collection here
            } else {
                throw e; 
            }
        }

        // 3. Create Session Token
        // This token allows the client to create a session locally
        const token = await users.createToken(userId);

        return NextResponse.json({ 
            secret: token.secret, 
            userId: userId 
        });

    } catch (e: any) {
        console.error('Telegram Auth Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
