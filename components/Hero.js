'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const DEFAULT_SLIDES = [
  '/images/hero.png',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
];

const DEFAULT_TEXT = {
  title: 'Jelajahi Alam,',
  subtitle: 'Temukan Jati Diri.',
  description: 'Komunitas pecinta alam yang berdedikasi untuk menjaga kelestarian hutan dan pegunungan Indonesia.'
};

export default function Hero({ slides: propSlides, heroText }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = propSlides?.length > 0 ? propSlides.map(s => s.url) : DEFAULT_SLIDES;
  const text = heroText || DEFAULT_TEXT;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className={styles.hero}>
      {slides.map((src, index) => (
        <div 
          key={index} 
          className={`${styles.imageWrapper} ${index === currentSlide ? styles.active : ''}`}
        >
          <Image 
            src={src} 
            alt={`Leher Adventure Background ${index + 1}`} 
            fill 
            style={{ objectFit: 'cover' }}
            priority={index === 0}
          />
        </div>
      ))}
      <div className={styles.overlay}></div>
      <div className={`${styles.content} container`}>
        <h1 className={styles.title}>{text?.title}<br /><span>{text?.subtitle}</span></h1>
        <p className={styles.subtitle}>{text?.description}</p>
        <div className={styles.actions}>
          <a href="#tentang-kami" className="btn btn-primary">Mulai Petualangan</a>
        </div>
      </div>
    </section>
  );
}
