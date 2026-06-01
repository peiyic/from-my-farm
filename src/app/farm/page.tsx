"use client"
import { useSession, signIn } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { AddressAutofill } from "@mapbox/search-js-react"
import { Farmer } from "../../models/farmer"

export default function FarmPage() {
  const { data: session, status } = useSession()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [notRegistered, setNotRegistered] = useState(false)
  const [newProduct, setNewProduct] = useState("")
  const [loading, setLoading] = useState(false)
  const [signUpForm, setSignUpForm] = useState({ username: "", name: "", address: "" })
  const [signUpCoords, setSignUpCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [signUpError, setSignUpError] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)
  const autofillRef = useRef<{ address: string; lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!session) return
    fetch("/api/farmer/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.farmer) {
          setFarmer(data.farmer)
        } else {
          setNotRegistered(true)
        }
      })
  }, [session])

  const addProduct = async () => {
    const product = newProduct.trim()
    if (!product || !farmer) return
    setLoading(true)
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    })
    setFarmer({ ...farmer, products: [...farmer.products, product] })
    setNewProduct("")
    setLoading(false)
  }

  const removeProduct = async (product: string) => {
    if (!farmer) return
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    })
    setFarmer({ ...farmer, products: farmer.products.filter((p) => p !== product) })
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError("")
    const { username, name, address } = signUpForm
    if (!username.trim() || !address.trim()) {
      setSignUpError("Username and address are required.")
      return
    }
    if (!signUpCoords) {
      setSignUpError("Please select an address from the suggestions.")
      return
    }
    setSignUpLoading(true)
    try {
      const { lat, lng } = signUpCoords
      const res = await fetch("/api/farmer/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), name: name.trim(), address: address.trim(), lat, lng }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSignUpError(data.error ?? "Something went wrong.")
      } else {
        setFarmer(data.farmer)
        setNotRegistered(false)
      }
    } catch {
      setSignUpError("Something went wrong. Please try again.")
    }
    setSignUpLoading(false)
  }

  if (status === "loading") {
    return <div style={styles.centered}>Loading...</div>
  }

  if (!session) {
    return (
      <div style={styles.centered}>
        <p>Sign in to manage your farm listing.</p>
        <button style={styles.btn} onClick={() => signIn()}>Sign in</button>
      </div>
    )
  }

  if (notRegistered) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1rem" }}>
        <h1 style={styles.heading}>Register as a Farmer</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Create your listing so customers can find your farm.</p>
        <form onSubmit={signUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={styles.label}>
            Username <span style={{ color: "#c00" }}>*</span>
            <input
              style={styles.input}
              value={signUpForm.username}
              onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
              placeholder="e.g. green-valley-farm"
              required
            />
          </label>
          <label style={styles.label}>
            Farm name
            <input
              style={styles.input}
              value={signUpForm.name}
              onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
              placeholder="e.g. Green Valley Farm"
            />
          </label>
          <label style={styles.label}>
            Farm address <span style={{ color: "#c00" }}>*</span>
            <AddressAutofill
              // @ts-ignore
              style={{ width: "100%" }}
              accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
              onRetrieve={(res) => {
                const feature = res.features[0]
                const [lng, lat] = feature.geometry.coordinates
                autofillRef.current = { address: feature.properties.full_address ?? "", lat, lng }
              }}
            >
              <input
                style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
                value={signUpForm.address}
                onChange={(e) => {
                  if (autofillRef.current) {
                    const { address, lat, lng } = autofillRef.current
                    autofillRef.current = null
                    setSignUpForm((f) => ({ ...f, address }))
                    setSignUpCoords({ lat, lng })
                  } else {
                    setSignUpForm({ ...signUpForm, address: e.target.value })
                    if (!e.target.value) setSignUpCoords(null)
                  }
                }}
                placeholder="e.g. 123 Farm Road, Hawke's Bay"
                autoComplete="street-address"
                required
              />
            </AddressAutofill>
          </label>
          {signUpError && <p style={{ color: "#c00", margin: 0 }}>{signUpError}</p>}
          <button style={styles.btn} type="submit" disabled={signUpLoading}>
            {signUpLoading ? "Registering…" : "Register"}
          </button>
        </form>
      </div>
    )
  }

  if (!farmer) {
    return <div style={styles.centered}>Loading your farm...</div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{farmer.name}</h1>
      <p style={{ color: "#666" }}>{farmer.address}</p>

      <h2 style={styles.subheading}>Your Products</h2>

      {farmer.products.length === 0 ? (
        <p style={{ color: "#888" }}>No products listed yet.</p>
      ) : (
        <ul style={styles.list}>
          {farmer.products.map((product) => (
            <li key={product} style={styles.listItem}>
              <span>{product}</span>
              <button style={styles.removeBtn} onClick={() => removeProduct(product)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.addRow}>
        <input
          style={styles.input}
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addProduct()}
          placeholder="e.g. Tomatoes"
        />
        <button style={styles.btn} onClick={addProduct} disabled={loading || !newProduct.trim()}>
          Add Product
        </button>
      </div>
      <a href="/" style={styles.backLink}>← Back to map</a>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  centered: { maxWidth: 480, margin: "4rem auto", textAlign: "center", padding: "0 1rem" },
  container: { maxWidth: 600, margin: "2rem auto", padding: "0 1rem" },
  heading: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" },
  subheading: { fontSize: "1.1rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.75rem" },
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #eee" },
  addRow: { display: "flex", gap: "0.5rem", marginTop: "1.25rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 500 },
  input: { flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "1rem" },
  btn: { padding: "0.5rem 1rem", background: "#2d7a45", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "1rem" },
  removeBtn: { padding: "0.25rem 0.6rem", background: "transparent", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", color: "#c00" },
  backLink: { display: "inline-block", marginTop: "1.5rem", color: "#2d7a45", textDecoration: "none", fontSize: "0.95rem" },
}
