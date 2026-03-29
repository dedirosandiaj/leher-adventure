import styles from './About.module.css';

const DEFAULT_TITLE = 'Tentang Kami';
const DEFAULT_CONTENT = 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia. Kami bukan sekadar kelompok pendaki, melainkan wadah bagi siapa saja yang ingin mengeksplorasi keagungan gunung dengan prinsip etika lingkungan yang kuat.\n\nMisi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki (safety climbing), serta aktif dalam kegiatan konservasi alam. Kami percaya bahwa setiap langkah di puncak adalah sebuah pelajaran tentang kerendahan hati dan ketahanan diri.';

export default function About({ aboutData }) {
  const title = DEFAULT_TITLE;
  const content = aboutData?.content || DEFAULT_CONTENT;
  const paragraphs = content.split('\n\n');
  
  return (
    <section id="tentang-kami" className={styles.about}>
      <div className={`${styles.container} container`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.divider}></div>
          {paragraphs.map((p, i) => (
            <p key={i} className={styles.description}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
