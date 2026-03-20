import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markNotificationsRead } from '../api/services'
import { FaPaw, FaBell, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import styles from './Navbar.module.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, location.pathname])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications()
      setNotifications(data.data)
    } catch {}
  }

  const handleNotifOpen = async () => {
    setNotifOpen(!notifOpen)
    if (!notifOpen && unreadCount > 0) {
      await markNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <FaPaw /> PetAdopt
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          <li><Link to="/pets" className={location.pathname === '/pets' ? styles.active : ''}>Browse Pets</Link></li>
          {user && user.role === 'user' && (
            <li><Link to="/dashboard" className={location.pathname.startsWith('/dashboard') ? styles.active : ''}>My Applications</Link></li>
          )}
          {user && user.role === 'admin' && (
            <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? styles.active : ''}>Admin Panel</Link></li>
          )}
        </ul>

        {/* Right side */}
        <div className={styles.right}>
          {user ? (
            <>
              {/* Notifications */}
              <div className={styles.notifWrap} ref={notifRef}>
                <button className={styles.notifBtn} onClick={handleNotifOpen}>
                  <FaBell />
                  {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <h4>Notifications</h4>
                    {notifications.length === 0 ? (
                      <p className={styles.noNotif}>No notifications yet</p>
                    ) : (
                      notifications.slice(0, 8).map((n, i) => (
                        <div key={i} className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}>
                          <p>{n.message}</p>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className={styles.userMenu}>
                <span className={styles.userName}><FaUser /> {user.name.split(' ')[0]}</span>
                <button className={`btn btn-outline btn-sm`} onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/pets" onClick={() => setMenuOpen(false)}>Browse Pets</Link>
          {user?.role === 'user' && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Applications</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
