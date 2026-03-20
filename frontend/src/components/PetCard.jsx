import { Link } from 'react-router-dom'
import { FaPaw, FaVenusMars, FaBirthdayCake, FaSyringe } from 'react-icons/fa'
import styles from './PetCard.module.css'

const PetCard = ({ pet }) => {
  const placeholderImg = `https://via.placeholder.com/400x300?text=${pet.name}`

  return (
    <div className="card">
      <div className={styles.imgWrap}>
        <img
          src={pet.photo?.url || placeholderImg}
          alt={pet.name}
          className={styles.img}
          onError={(e) => { e.target.src = placeholderImg }}
        />
        <span className={`badge badge-${pet.status} ${styles.statusBadge}`}>
          {pet.status}
        </span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{pet.name}</h3>
        <p className={styles.breed}>{pet.breed} · {pet.species}</p>
        <div className={styles.meta}>
          <span><FaVenusMars /> {pet.gender}</span>
          <span><FaBirthdayCake /> {pet.age} yr{pet.age !== 1 ? 's' : ''}</span>
          {pet.vaccinated && <span><FaSyringe /> Vaccinated</span>}
        </div>
        {pet.description && (
          <p className={styles.desc}>{pet.description.slice(0, 80)}{pet.description.length > 80 ? '...' : ''}</p>
        )}
        <Link to={`/pets/${pet._id}`} className={`btn btn-primary btn-sm ${styles.detailBtn}`}>
          <FaPaw /> View Details
        </Link>
      </div>
    </div>
  )
}

export default PetCard