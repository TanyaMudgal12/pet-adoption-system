import { useState, useEffect } from 'react'
import {
  getAllPetsAdmin, createPet, updatePet, deletePet,
  getAllAdoptions, reviewAdoption
} from '../api/services'
import toast from 'react-hot-toast'
import ReactPaginate from 'react-paginate'
import {
  FaPaw, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes,
  FaList, FaClipboardList, FaSearch
} from 'react-icons/fa'
import styles from './AdminDashboard.module.css'

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile', 'other']
const emptyPet = { name: '', species: 'dog', breed: '', age: '', gender: 'male', description: '', vaccinated: false, neutered: false }

const AdminDashboard = () => {
  const [tab, setTab] = useState('pets')

  // Pets state
  const [pets, setPets] = useState([])
  const [petPagination, setPetPagination] = useState({ pages: 1, page: 1, total: 0 })
  const [petSearch, setPetSearch] = useState('')
  const [petLoading, setPetLoading] = useState(true)
  const [showPetModal, setShowPetModal] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [petForm, setPetForm] = useState(emptyPet)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [petSaving, setPetSaving] = useState(false)

  // Adoptions state
  const [adoptions, setAdoptions] = useState([])
  const [adoptionPagination, setAdoptionPagination] = useState({ pages: 1, page: 1, total: 0 })
  const [adoptionFilter, setAdoptionFilter] = useState('')
  const [adoptionLoading, setAdoptionLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', adminNote: '' })
  const [reviewSaving, setReviewSaving] = useState(false)

  useEffect(() => { fetchPets(1) }, [petSearch])
  useEffect(() => { fetchAdoptions(1) }, [adoptionFilter])

  // ── Pets ──────────────────────────────────────────
  const fetchPets = async (page = 1) => {
    setPetLoading(true)
    try {
      const { data } = await getAllPetsAdmin({ search: petSearch, page, limit: 8 })
      setPets(data.data)
      setPetPagination(data.pagination)
    } catch {}
    setPetLoading(false)
  }

  const openCreateModal = () => {
    setEditingPet(null)
    setPetForm(emptyPet)
    setPhotoFile(null)
    setPhotoPreview('')
    setShowPetModal(true)
  }

  const openEditModal = (pet) => {
    setEditingPet(pet)
    setPetForm({
      name: pet.name, species: pet.species, breed: pet.breed,
      age: pet.age, gender: pet.gender, description: pet.description || '',
      vaccinated: pet.vaccinated, neutered: pet.neutered,
    })
    setPhotoFile(null)
    setPhotoPreview(pet.photo?.url || '')
    setShowPetModal(true)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePetSubmit = async (e) => {
    e.preventDefault()
    setPetSaving(true)
    try {
      const formData = new FormData()
      Object.entries(petForm).forEach(([k, v]) => formData.append(k, v))
      if (photoFile) formData.append('photo', photoFile)

      if (editingPet) {
        await updatePet(editingPet._id, formData)
        toast.success('Pet updated!')
      } else {
        await createPet(formData)
        toast.success('Pet added!')
      }
      setShowPetModal(false)
      fetchPets(petPagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pet')
    }
    setPetSaving(false)
  }

  const handleDeletePet = async (id) => {
    if (!window.confirm('Delete this pet?')) return
    try {
      await deletePet(id)
      toast.success('Pet deleted')
      fetchPets(petPagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  // ── Adoptions ─────────────────────────────────────
  const fetchAdoptions = async (page = 1) => {
    setAdoptionLoading(true)
    try {
      const { data } = await getAllAdoptions({ status: adoptionFilter, page, limit: 8 })
      setAdoptions(data.data)
      setAdoptionPagination(data.pagination)
    } catch {}
    setAdoptionLoading(false)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewSaving(true)
    try {
      await reviewAdoption(reviewModal._id, reviewForm)
      toast.success(`Application ${reviewForm.status}!`)
      setReviewModal(null)
      fetchAdoptions(adoptionPagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed')
    }
    setReviewSaving(false)
  }

  return (
    <div className="page">
      <h1 className="section-title">Admin Dashboard</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={tab === 'pets' ? styles.active : ''} onClick={() => setTab('pets')}>
          <FaList /> Manage Pets <span className={styles.count}>{petPagination.total}</span>
        </button>
        <button className={tab === 'adoptions' ? styles.active : ''} onClick={() => setTab('adoptions')}>
          <FaClipboardList /> Adoptions <span className={styles.count}>{adoptionPagination.total}</span>
        </button>
      </div>

      {/* ── PETS TAB ── */}
      {tab === 'pets' && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <FaSearch className={styles.searchIcon} />
              <input
                placeholder="Search pets..."
                value={petSearch}
                onChange={(e) => setPetSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <FaPlus /> Add Pet
            </button>
          </div>

          {petLoading ? <div className="spinner" /> : (
            <>
              <div className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Photo</th><th>Name</th><th>Species</th><th>Breed</th>
                      <th>Age</th><th>Gender</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pets.length === 0 ? (
                      <tr><td colSpan="8" className={styles.noData}>No pets found</td></tr>
                    ) : pets.map((pet) => (
                      <tr key={pet._id}>
                        <td>
                          <img
                            src={pet.photo?.url || `https://via.placeholder.com/50?text=${pet.name}`}
                            alt={pet.name}
                            className={styles.tableImg}
                            onError={(e) => { e.target.src = `https://via.placeholder.com/50?text=${pet.name}` }}
                          />
                        </td>
                        <td className={styles.bold}>{pet.name}</td>
                        <td className={styles.capitalize}>{pet.species}</td>
                        <td>{pet.breed}</td>
                        <td>{pet.age} yr</td>
                        <td className={styles.capitalize}>{pet.gender}</td>
                        <td><span className={`badge badge-${pet.status}`}>{pet.status}</span></td>
                        <td>
                          <div className={styles.actions}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEditModal(pet)}>
                              <FaEdit />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeletePet(pet._id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {petPagination.pages > 1 && (
                <ReactPaginate
                  pageCount={petPagination.pages}
                  forcePage={petPagination.page - 1}
                  onPageChange={({ selected }) => fetchPets(selected + 1)}
                  containerClassName="pagination"
                  activeClassName="selected"
                  disabledClassName="disabled"
                  previousLabel="‹" nextLabel="›"
                />
              )}
            </>
          )}
        </>
      )}

      {/* ── ADOPTIONS TAB ── */}
      {tab === 'adoptions' && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.filterBtns}>
              {['', 'pending', 'approved', 'rejected'].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${adoptionFilter === s ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setAdoptionFilter(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {adoptionLoading ? <div className="spinner" /> : (
            <>
              <div className={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Pet</th><th>Applicant</th><th>Email</th>
                      <th>Reason</th><th>Status</th><th>Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adoptions.length === 0 ? (
                      <tr><td colSpan="7" className={styles.noData}>No applications found</td></tr>
                    ) : adoptions.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <div className={styles.petCell}>
                            <img
                              src={a.pet?.photo?.url || `https://via.placeholder.com/40?text=${a.pet?.name}`}
                              alt={a.pet?.name}
                              className={styles.tableImg}
                              onError={(e) => { e.target.src = `https://via.placeholder.com/40?text=${a.pet?.name}` }}
                            />
                            <span>{a.pet?.name}</span>
                          </div>
                        </td>
                        <td>{a.applicant?.name}</td>
                        <td className={styles.email}>{a.applicant?.email}</td>
                        <td className={styles.reasonCell}>{a.reason?.slice(0, 60)}...</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td>
                          {a.status === 'pending' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => { setReviewModal(a); setReviewForm({ status: 'approved', adminNote: '' }) }}
                            >
                              Review
                            </button>
                          ) : (
                            <span className={styles.reviewed}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {adoptionPagination.pages > 1 && (
                <ReactPaginate
                  pageCount={adoptionPagination.pages}
                  forcePage={adoptionPagination.page - 1}
                  onPageChange={({ selected }) => fetchAdoptions(selected + 1)}
                  containerClassName="pagination"
                  activeClassName="selected"
                  disabledClassName="disabled"
                  previousLabel="‹" nextLabel="›"
                />
              )}
            </>
          )}
        </>
      )}

      {/* ── PET MODAL ── */}
      {showPetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPetModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h3>
              <button onClick={() => setShowPetModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handlePetSubmit} className={styles.modalBody}>
              {/* Photo upload */}
              <div className={styles.photoUpload}>
                <div className={styles.photoPreview}>
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" />
                    : <div className={styles.photoPlaceholder}><FaPaw /></div>
                  }
                </div>
                <label className="btn btn-outline btn-sm">
                  Upload Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                </label>
              </div>

              <div className={styles.formGrid}>
                <div className="form-group">
                  <label>Name *</label>
                  <input required value={petForm.name} onChange={e => setPetForm({ ...petForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Species *</label>
                  <select value={petForm.species} onChange={e => setPetForm({ ...petForm, species: e.target.value })}>
                    {SPECIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Breed *</label>
                  <input required value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Age (years) *</label>
                  <input type="number" min="0" required value={petForm.age} onChange={e => setPetForm({ ...petForm, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea value={petForm.description} onChange={e => setPetForm({ ...petForm, description: e.target.value })} />
                </div>
                <div className={styles.checkboxRow}>
                  <label>
                    <input type="checkbox" checked={petForm.vaccinated} onChange={e => setPetForm({ ...petForm, vaccinated: e.target.checked })} />
                    Vaccinated
                  </label>
                  <label>
                    <input type="checkbox" checked={petForm.neutered} onChange={e => setPetForm({ ...petForm, neutered: e.target.checked })} />
                    Neutered
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPetModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={petSaving}>
                  {petSaving ? 'Saving...' : editingPet ? 'Update Pet' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewModal && (
        <div className={styles.modalOverlay} onClick={() => setReviewModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Review Application</h3>
              <button onClick={() => setReviewModal(null)}><FaTimes /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.reviewInfo}>
                <p><strong>Pet:</strong> {reviewModal.pet?.name} ({reviewModal.pet?.breed})</p>
                <p><strong>Applicant:</strong> {reviewModal.applicant?.name}</p>
                <p><strong>Email:</strong> {reviewModal.applicant?.email}</p>
                {reviewModal.applicant?.phone && <p><strong>Phone:</strong> {reviewModal.applicant.phone}</p>}
                <p><strong>Reason:</strong> {reviewModal.reason}</p>
                {reviewModal.experience && <p><strong>Experience:</strong> {reviewModal.experience}</p>}
                {reviewModal.livingCondition && <p><strong>Living conditions:</strong> {reviewModal.livingCondition}</p>}
              </div>
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label>Decision *</label>
                  <div className={styles.decisionBtns}>
                    <button
                      type="button"
                      className={`btn ${reviewForm.status === 'approved' ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      type="button"
                      className={`btn ${reviewForm.status === 'rejected' ? 'btn-danger' : 'btn-outline'}`}
                      onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Note to applicant (optional)</label>
                  <textarea
                    placeholder="Add a message for the applicant..."
                    value={reviewForm.adminNote}
                    onChange={e => setReviewForm({ ...reviewForm, adminNote: e.target.value })}
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={reviewSaving}>
                    {reviewSaving ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard