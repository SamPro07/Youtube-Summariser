import Link from 'next/link'
import { createClient } from '../../supabase/server'
import { Button } from './ui/button'
import { User, UserCircle } from 'lucide-react'
import UserProfile from './user-profile'


export default async function Navbar() {
  const supabase = await createClient()

  const { data: { user } } = await (await supabase).auth.getUser()

  return (
    <header className="border-b bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">YT Summarizer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 mx-auto">
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            About Us
          </Link>
          <Link href="/Blog" className="text-gray-600 hover:text-gray-900">
            Blog 
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900">
            FAQ
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <UserProfile />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
