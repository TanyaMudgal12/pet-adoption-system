import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyAdoptions, deleteAdoption, updateProfile } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaPaw, FaUser, FaTrash, FaEdit, FaSave } from 'react-icons/fa'
import styles from './UserDashboard.module.css'

const statusColor = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }

const UserDashboard = () => {
  const { user, updateUser } = useAuth()
  const [adoptions, setAdoptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('applications')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', password: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAdoptions() }, [])

  const fetchAdoptions = async () => {
    try {
      const { data } = await getMyAdoptions()
      setAdoptions(data.data)
    } catch {}
    setLoading(false)
  }

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return
    try {
      await deleteAdoption(id)
      toast.success('Application withdrawn')
      fetchAdoptions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw')
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: profileForm.name, phone: profileForm.phone, address: profileForm.address }
      if (profileForm.password) payload.password = profileForm.password
      const { data } = await updateProfile(payload)
      updateUser(data.data)
      toast.success('Profile updated!')
      setProfileForm(prev => ({ ...prev, password: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
    setSaving(false)
  }

  const counts = {
    all: adoptions.length,
    pending: adoptions.filter(a => a.status === 'pending').length,
    approved: adoptions.filter(a => a.status === 'approved').length,
    rejected: adoptions.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="page">
      <h1 className="section-title">My Dashboard</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={tab === 'applications' ? styles.active : ''} onClick={() => setTab('applications')}>
          <FaPaw /> My Applications
        </button>
        <button className={tab === 'profile' ? styles.active : ''} onClick={() => setTab('profile')}>
          <FaUser /> Profile
        </button>
      </div>

      {/* Applications Tab */}
      {tab === 'applications' && (
        <>
          {/* Stats */}
          <div className={styles.statsRow}>
            {[
              { label: 'Total', value: counts.all, color: '#607d8b' },
              { label: 'Pending', value: counts.pending, color: '#e65100' },
              { label: 'Approved', value: counts.approved, color: '#2e7d32' },
              { label: 'Rejected', value: counts.rejected, color: '#c62828' },
            ].map((s) => (
              <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
                <h3 style={{ color: s.color }}>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>

          {loading ? <div className="spinner" /> :
            adoptions.length === 0 ? (
              <div className="empty-state">
                <FaPaw />
                <p>No applications yet. <Link to="/pets" style={{ color: 'var(--primary)' }}>Browse pets</Link> to get started!</p>
              </div>
            ) : (
              <div className={styles.applicationsList}>
                {adoptions.map((a) => (
                  <div key={a._id} className={styles.applicationCard}>
                    <img
                      src={a.pet?.photo?.url || `https://via.placeholder.com/100?text=${a.pet?.name}`}
                      alt={a.pet?.name}
                      className={styles.petImg}
                      onError={(e) => { e.target.src = `https://via.placeholder.com/100?text=${a.pet?.name}` }}
                    />
                    <div className={styles.appInfo}>
                      <h3>{a.pet?.name}</h3>
                      <p className={styles.breed}>{a.pet?.breed} · {a.pet?.species}</p>
                      <p className={styles.reason}>{a.reason?.slice(0, 100)}{a.reason?.length > 100 ? '...' : ''}</p>
                      {a.adminNote && (
                        <p className={styles.adminNote}><strong>Admin note:</strong> {a.adminNote}</p>
                      )}
                      <p className={styles.date}>Applied on {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.appRight}>
                      <span className={`badge ${statusColor[a.status]}`}>{a.status}</span>
                      <Link to={`/pets/${a.pet?._id}`} className="btn btn-outline btn-sm">View Pet</Link>
                      {a.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(a._id)}>
                          <FaTrash /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className={styles.profileCard}>
          <h3><FaEdit /> Edit Profile</h3>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email (cannot change)</label>
              <input value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91 9999999999" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Your address" />
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input type="password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
