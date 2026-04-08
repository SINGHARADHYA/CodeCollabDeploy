require('dotenv').config();

const clientUrls = [
  'http://localhost:5173',
  'https://code-collab-deploy.vercel.app'
];
if (process.env.CLIENT_URL) {
  clientUrls.push(process.env.CLIENT_URL);
}

module.exports = {
  port: process.env.PORT || 3001,
  clientUrl: clientUrls,
  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
};
