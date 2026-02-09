
export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    feelslike_c: number;
    uv: number;
  };
}

export const getWeather = async (): Promise<WeatherData | null> => {
  const apiKey = process.env.WEATHERE_API;
  if (!apiKey) {
      console.error("WEATHERE_API key is missing");
      return null;
  }
  
  const endpoint = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Addis Ababa&aqi=no`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 7200 } }); // Cache for 2 hours
    if (!res.ok) {
        console.error(`[WeatherAPI] Failed to fetch: ${res.status} ${res.statusText}`);
        return null;
    }
    const data = await res.json();
    // console.log('[WeatherAPI] Data:', JSON.stringify(data, null, 2)); // Optional debug
    return data;
  } catch (error) {
    console.error('[WeatherAPI] Error:', error);
    return null;
  }
};
