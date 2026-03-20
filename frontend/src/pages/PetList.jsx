import { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import { getPets } from '../api/services'
import PetCard from '../components/PetCard'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import styles from './PetList.module.css'

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile', 'other']

const PetList = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [filters, setFilters] = useState({ search: '', species: '', breed: '', minAge: '', maxAge: '' })
  const [applied, setApplied] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPets(1)
  }, [applied])

  const fetchPets = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await getPets({ ...applied, page, limit: 9 })
      setPets(data.data)
      setPagination(data.pagination)
    } catch {}
    setLoading(false)
  }

  const handleApply = (e) => {
    e.preventDefault()
    setApplied({ ...filters })
  }

  const handleReset = () => {
    setFilters({ search: '', species: '', breed: '', minAge: '', maxAge: '' })
    setApplied({})
  }

  const hasFilters = Object.values(applied).some(Boolean)

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className="section-title">Browse Pets</h1>
        <p className={styles.subtitle}>{pagination.total} pets available for adoption</p>
      </div>

      {/* Search + Filter bar */}
      <form onSubmit={handleApply} className={styles.searchBar}>
        <div className={styles.searchInput}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or breed..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <button type="button" className={`btn btn-outline btn-sm ${styles.filterToggle}`} onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters {hasFilters && <span className={styles.filterDot} />}
        </button>
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
        {hasFilters && (
          <button type="button" className="btn btn-sm" onClick={handleReset} style={{ background: '#eee' }}>
            <FaTimes /> Clear
          </button>
        )}
      </form>

      {/* Expanded Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <div className="form-group">
            <label>Species</label>
            <select value={filters.species} onChange={(e) => setFilters({ ...filters, species: e.target.value })}>
              <option value="">All Species</option>
              {SPECIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input
              type="text"
              placeholder="e.g. Labrador"
              value={filters.breed}
              onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Min Age (years)</label>
            <input type="number" min="0" value={filters.minAge} onChange={(e) => setFilters({ ...filters, minAge: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Max Age (years)</label>
            <input type="number" min="0" value={filters.maxAge} onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })} />
          </div>
        </div>
      )}

      {/* Pet Grid */}
      {loading ? (
        <div className="spinner" />
      ) : pets.length === 0 ? (
        <div className="empty-state">
          <p>No pets found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid-3">
          {pets.map((pet) => <PetCard key={pet._id} pet={pet} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <ReactPaginate
          pageCount={pagination.pages}
          forcePage={pagination.page - 1}
          onPageChange={({ selected }) => fetchPets(selected + 1)}
          containerClassName="pagination"
          activeClassName="selected"
          disabledClassName="disabled"
          previousLabel="‹"
          nextLabel="›"
        />
      )}
    </div>
  )
}

export default PetList
