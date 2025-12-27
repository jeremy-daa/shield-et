import { createHmac } from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

interface ValidatedData {
    user?: TelegramUser;
    auth_date: number;
    query_id?: string;
    hash: string;
    [key: string]: any; // Allow other properties
}

export function validateTelegramWebAppData(initData: string, botToken: string): ValidatedData | null {
  if (!initData || !botToken) {
      return null;
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash) {
      return null;
  }

  urlParams.delete('hash');

  const paramsArg: string[] = [];
  urlParams.forEach((val, key) => {
      paramsArg.push(`${key}=${val}`);
  });
  
  paramsArg.sort();
  const dataCheckString = paramsArg.join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash === hash) {
      const validatedData: ValidatedData = {
          auth_date: parseInt(urlParams.get('auth_date') || '0'),
          hash: hash,
      };
      
      const userStr = urlParams.get('user');
      if (userStr) {
          try {
              validatedData.user = JSON.parse(userStr);
          } catch (e) {
              console.error('Failed to parse user data', e);
          }
      }
      
      // Add other params
      urlParams.forEach((val, key) => {
        if(key !== 'user' && key !== 'auth_date') {
            validatedData[key] = val;
        }
      });

      return validatedData;
  }

  return null;
}
