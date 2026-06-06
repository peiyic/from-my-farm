"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
export default function Component() {
  const { data } = useSession()
  if (data) {
    return (
      <>
        <Link href="/farm" style={{ textDecoration: 'none', color: '#555' }}>My Farm</Link>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      <button onClick={() => signIn(undefined, { callbackUrl: "/farm" })}>Sign in</button>
    </>
  )
}