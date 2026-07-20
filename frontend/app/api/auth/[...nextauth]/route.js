import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const readJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `Auth server returned ${response.status}`);
  }

  return response.json();
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        const data = await readJsonResponse(res).catch((error) => {
          throw new Error(`Login API error: ${error.message}`);
        });
        if (!res.ok) {
          if (data.needsVerification && data.email) {
            throw new Error(`VERIFY_NEEDED:${data.email}|${data.sentTo || data.email}`);
          }
          throw new Error(data.error || 'Invalid credentials');
        }
        return { ...data.user, accessToken: data.token };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
