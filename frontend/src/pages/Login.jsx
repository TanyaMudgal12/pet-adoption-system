import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaPaw, FaEnvelope, FaLock } from 'react-icons/fa'
import styles from './Auth.module.css'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      login(data.data)
      toast.success(`Welcome back, ${data.data.name}! 🐾`)
      navigate(data.data.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.header}>
          <FaPaw className={styles.icon} />
          <h2>Welcome Back</h2>
          <p>Login to continue your adoption journey</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label><FaLock /> Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        {/* Demo credentials */}
        <div className={styles.demo}>
          <p><strong>Demo Admin:</strong> admin@petadoption.com / admin123</p>
          <p><strong>Demo User:</strong> john@example.com / user123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
