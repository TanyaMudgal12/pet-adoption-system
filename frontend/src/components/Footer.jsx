import { FaPaw, FaHeart } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <FaPaw /> PetAdopt
      </div>
      <p className={styles.tagline}>Finding forever homes for loving pets 🐾</p>
      <p className={styles.copy}>
        Made with <FaHeart className={styles.heart} /> · {new Date().getFullYear()} PetAdopt
      </p>
    </div>
  </footer>
)

export default Footer