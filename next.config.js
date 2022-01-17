/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/scan/:slug",
        destination: "/:slug",
        permanent: false,
      },
    ];
  },
};
