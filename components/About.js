import styles from './About.module.css';

const DEFAULT_ABOUT = {
  title: 'Tentang Kami',
  paragraph1: 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia. Kami bukan sekadar kelompok pendaki, melainkan wadah bagi siapa saja yang ingin mengeksplorasi keagungan gunung dengan prinsip etika lingkungan yang kuat.',
  paragraph2: 'Misi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki (safety climbing), serta aktif dalam kegiatan konservasi alam. Kami percaya bahwa setiap langkah di puncak adalah sebuah pelajaran tentang kerendahan hati dan ketahanan diri.',
};

export default function About({ aboutData }) {
  const about = aboutData || DEFAULT_ABOUT;
  
  return (
    <section id="tentang-kami" className={styles.about}>
      <div className={`${styles.container} container`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{about.title}</h2>
          <div className={styles.divider}></div>
          <p className={styles.description}>{about.paragraph1}</p>
          <p className={styles.description}>{about.paragraph2}</p>
        </div>
      </div>
    </section>
  );
}
