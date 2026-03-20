import { Link } from 'react-router-dom'
import { FaPaw, FaSearch, FaHeart, FaCheckCircle } from 'react-icons/fa'
import styles from './Home.module.css'

const Home = () => (
  <div className={styles.home}>
    {/* Hero */}
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Find Your Perfect <span>Furry Friend</span></h1>
        <p>Give a loving pet a forever home. Browse hundreds of adorable animals waiting for someone just like you.</p>
        <div className={styles.heroBtns}>
          <Link to="/pets" className="btn btn-primary btn-lg"><FaSearch /> Browse Pets</Link>
          <Link to="/register" className="btn btn-outline btn-lg"><FaHeart /> Get Started</Link>
        </div>
      </div>
      <div className={styles.heroImg}>
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600" alt="Happy pets" />
      </div>
    </section>

    {/* How it works */}
    <section className={styles.steps}>
      <div className="container">
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          {[
            { icon: <FaSearch />, title: 'Browse Pets', desc: 'Explore our available pets filtered by species, breed, or age.' },
            { icon: <FaHeart />, title: 'Apply to Adopt', desc: 'Create an account and submit an adoption application.' },
            { icon: <FaCheckCircle />, title: 'Get Approved', desc: 'Our team reviews your application and gets back to you.' },
            { icon: <FaPaw />, title: 'Welcome Home!', desc: 'Bring your new best friend home and start your journey.' },
          ].map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className={styles.stats}>
      <div className="container">
        <div className={styles.statsGrid}>
          {[
            { value: '500+', label: 'Pets Adopted' },
            { value: '15+', label: 'Pet Species' },
            { value: '1000+', label: 'Happy Families' },
            { value: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <div key={i} className={styles.stat}>
              <h2>{stat.value}</h2>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className={styles.cta}>
      <div className="container">
        <h2>Ready to Adopt?</h2>
        <p>Thousands of pets are waiting for a loving home. Take the first step today.</p>
        <Link to="/pets" className="btn btn-primary btn-lg"><FaPaw /> Find a Pet Now</Link>
      </div>
    </section>
  </div>
)

export default Home