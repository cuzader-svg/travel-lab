import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const name = credentials?.name?.trim()
        const email = credentials?.email?.trim()
        const password = credentials?.password ?? ''

        if (!name || !email || !password || password.length < 4) {
          return null
        }

        return {
          id: email,
          name,
          email,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
}
