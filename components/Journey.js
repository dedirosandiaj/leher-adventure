import { prisma } from '@/lib/prisma';
import styles from './Journey.module.css';

const MountainIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z"></path>
  </svg>
);

// Konstanta untuk jarak antar titik - jarak tetap antar tahun
const STEP_Y = 550; // jarak antar titik dalam pixel (card tidak menutupi garis)
const START_Y = 100;

// Generate dynamic trail path based on number of points
function generateTrailPath(count) {
  if (count <= 1) return '';
  
  const points = [];
  
  // Generate zigzag points dengan jarak tetap
  for (let i = 0; i < count; i++) {
    const y = START_Y + (i * STEP_Y);
    // Alternate between left, center, right
    let x;
    if (i % 3 === 0) x = 400; // center
    else if (i % 3 === 1) x = 650; // right
    else x = 150; // left
    
    points.push({ x, y });
  }
  
  // Build path with curves
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Create smooth curve between points
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y + (curr.y - prev.y) * 0.3;
    const cp2x = prev.x + (curr.x - prev.x) * 0.5;
    const cp2y = prev.y + (curr.y - prev.y) * 0.7;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }
  
  return path;
}

// Get position for each point
function getPointPosition(index, total) {
  const y = START_Y + (index * STEP_Y);
  let x;
  if (index % 3 === 0) x = 400; // center
  else if (index % 3 === 1) x = 650; // right
  else x = 150; // left
  
  return { x, y };
}

// Calculate container height based on number of points
function getContainerHeight(count) {
  if (count <= 1) return 300;
  return START_Y + ((count - 1) * STEP_Y) + 150; // extra space for content
}

export default async function Journey() {
  const journeys = await prisma.journey.findMany({
    orderBy: { year: 'desc' }, // tahun terbaru di atas
    include: { mountains: true },
  });

  const trailPath = generateTrailPath(journeys.length);
  const containerHeight = getContainerHeight(journeys.length);
  const viewBoxHeight = Math.max(400, containerHeight);

  return (
    <section id="jejak-kami" className={styles.journey}>
      <div className="container">
        <h2 className={styles.title}>Jejak Kami</h2>
        <p className={styles.subtitle}>Peta petualangan ekspedisi yang telah kita lalui bersama.</p>
        
        <div className={styles.mapContainer} style={{ paddingBottom: `${(viewBoxHeight / 800) * 100}%` }}>
          <svg className={styles.trailLine} viewBox={`0 0 800 ${viewBoxHeight}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {trailPath && (
              <path 
                d={trailPath}
                fill="none" 
                stroke="var(--secondary)" 
                strokeWidth="6" 
                strokeLinecap="round"
                opacity="0.8" 
              />
            )}
          </svg>
          <div className={styles.points}>
            {journeys.map((item, index) => {
              const pos = getPointPosition(index, journeys.length);
              const isLeft = pos.x < 400;
              const isRight = pos.x > 400;
              
              return (
                <div 
                  key={index} 
                  className={`${styles.mapPoint} ${isLeft ? styles.left : ''} ${isRight ? styles.right : ''}`}
                  style={{ 
                    position: 'absolute',
                    left: `${(pos.x / 800) * 100}%`,
                    top: `${(pos.y / viewBoxHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={styles.iconWrapper}>
                    <MountainIcon />
                  </div>
                  <div className={styles.pointContent}>
                    <div className={styles.yearHeader}>
                      <span className={styles.year}>{item.year}</span>
                      <span className={`${styles.statusBadge} ${item.status === 'Selesai' ? styles.selesai : styles.rencana}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className={styles.mountainsList}>
                      {item.mountains.map((m, idx) => (
                        <div key={idx} className={styles.mountainCard}>
                          <h3>{m.name}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
