"use client"
import { useSession, signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { Farmer } from "../../models/farmer"

export default function FarmPage() {
  const { data: session, status } = useSession()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [notRegistered, setNotRegistered] = useState(false)
  const [newProduct, setNewProduct] = useState("")
  const [loading, setLoading] = useState(false)

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
      <div style={styles.centered}>
        <p>Your account is not registered as a farmer. Please contact us to get set up.</p>
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
  input: { flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "1rem" },
  btn: { padding: "0.5rem 1rem", background: "#2d7a45", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "1rem" },
  removeBtn: { padding: "0.25rem 0.6rem", background: "transparent", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", color: "#c00" },
}
