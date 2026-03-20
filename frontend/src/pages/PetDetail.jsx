import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPetById, applyForAdoption } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FaPaw, FaVenusMars, FaBirthdayCake, FaSyringe,
  FaCut, FaArrowLeft, FaHeart
} from 'react-icons/fa'
import styles from './PetDetail.module.css'

const PetDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ reason: '', experience: '', livingCondition: '' })

  useEffect(() => {
    fetchPet()
  }, [id])

  const fetchPet = async () => {
    try {
      const { data } = await getPetById(id)
      setPet(data.data)
    } catch {
      toast.error('Pet not found')
      navigate('/pets')
    }
    setLoading(false)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    try {
      await applyForAdoption({ petId: id, ...form })
      toast.success('Application submitted successfully! 🐾')
      setShowForm(false)
      fetchPet()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="spinner" />

  const placeholderImg = `https://via.placeholder.com/600x400?text=${pet.name}`

  return (
    <div className="page">
      <button className={`btn btn-outline btn-sm ${styles.back}`} onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className={styles.detail}>
        {/* Image */}
        <div className={styles.imgWrap}>
          <img
            src={pet.photo?.url || placeholderImg}
            alt={pet.name}
            onError={(e) => { e.target.src = placeholderImg }}
          />
          <span className={`badge badge-${pet.status} ${styles.statusBadge}`}>{pet.status}</span>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <h1 className={styles.name}>{pet.name}</h1>
          <p className={styles.breed}>{pet.breed} · <span>{pet.species}</span></p>

          <div className={styles.tags}>
            <span className={styles.tag}><FaVenusMars /> {pet.gender}</span>
            <span className={styles.tag}><FaBirthdayCake /> {pet.age} year{pet.age !== 1 ? 's' : ''} old</span>
            {pet.vaccinated && <span className={`${styles.tag} ${styles.green}`}><FaSyringe /> Vaccinated</span>}
            {pet.neutered && <span className={`${styles.tag} ${styles.green}`}><FaCut /> Neutered</span>}
          </div>

          {pet.description && (
            <div className={styles.section}>
              <h3>About {pet.name}</h3>
              <p>{pet.description}</p>
            </div>
          )}

          {/* Apply Button */}
          {pet.status === 'available' && (
            <div className={styles.applySection}>
              {!user ? (
                <div className={styles.loginPrompt}>
                  <p>Please <button onClick={() => navigate('/login')}>login</button> to apply for adoption.</p>
                </div>
              ) : user.role === 'admin' ? null : (
                <button
                  className={`btn btn-primary btn-lg ${styles.applyBtn}`}
                  onClick={() => setShowForm(!showForm)}
                >
                  <FaHeart /> {showForm ? 'Cancel' : 'Apply to Adopt'}
                </button>
              )}
            </div>
          )}

          {pet.status !== 'available' && (
            <div className={styles.unavailable}>
              This pet is currently <strong>{pet.status}</strong> and not available for new applications.
            </div>
          )}

          {/* Adoption Form */}
          {showForm && (
            <form onSubmit={handleApply} className={styles.form}>
              <h3>Adoption Application</h3>
              <div className="form-group">
                <label>Why do you want to adopt {pet.name}? *</label>
                <textarea
                  required
                  placeholder="Tell us why you'd be a great owner..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Previous pet experience</label>
                <textarea
                  placeholder="Have you owned pets before? Tell us about it..."
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Your living conditions</label>
                <textarea
                  placeholder="Apartment/house, yard, other pets at home..."
                  value={form.livingCondition}
                  onChange={(e) => setForm({ ...form, livingCondition: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : <><FaPaw /> Submit Application</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default PetDetail
