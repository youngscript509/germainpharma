export default async () => {
  const apiKey = Netlify.env.get('FIREBASE_API_KEY');
  const headers = {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };

  if (!apiKey?.trim()) {
    return new Response('throw new Error("Firebase configuration is unavailable. Configure FIREBASE_API_KEY in Netlify.");', {
      status: 503,
      headers,
    });
  }

  return new Response(`window.FIREBASE_API_KEY = ${JSON.stringify(apiKey)};`, {
    headers,
  });
};

export const config = {
  path: '/firebase-runtime-config.js',
};
