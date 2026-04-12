import styles from '../crud.module.css';

export default function CrudTeam({ members }) {
  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Tim Kami</h1>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Daftar Anggota ({members.length})</h2>
        {members.length === 0 ? (
          <p className={styles.empty}>Belum ada anggota tim.</p>
        ) : (
          <div className={styles.teamGrid}>
            {members.map(m => (
              <div key={m.id} className={styles.teamCard}>
                <div className={styles.teamPhoto}>
                  <img 
                    src={m.photo || '/images/hero.png'} 
                    alt={m.name}
                  />
                </div>
                <div className={styles.teamName}>{m.name}</div>
                <div className={styles.teamIg}>@{m.username}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
