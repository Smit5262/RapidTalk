/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/login',
          has: [
            {
              type: 'cookie',
              key: 'token',
            },
          ],
          permanent: false,
          destination: '/dashboard',
        },
        {
          source: '/signup',
          has: [
            {
              type: 'cookie',
              key: 'token',
            },
          ],
          permanent: false,
          destination: '/dashboard',
        },
      ];
    },
  };
  
  export default nextConfig;
  