/**
 * Persona Card Component
 * Displays a persona's response with animations
 */

import { motion } from 'framer-motion';
import { PersonaVisual } from '../types';
import './PersonaCard.css';

interface PersonaCardProps {
  persona: PersonaVisual;
}

// Animation variants based on animation type
const animationVariants = {
  fade_in: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  pop: {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  bounce: {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  },
  drift: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  pulse: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  },
  slide_left: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slide_right: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }
};

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  const variant = animationVariants[persona.animation as keyof typeof animationVariants] || animationVariants.fade_in;

  return (
    <motion.div
      className={`persona-card ${persona.emotion_tone}`}
      style={{
        borderColor: persona.color,
        '--persona-color': persona.color
      } as React.CSSProperties}
      variants={variant}
      initial="hidden"
      animate="visible"
      transition={{
        delay: persona.delay_before_start / 1000,
        duration: 0.6
      }}
    >
      <div className="persona-header">
        <div className="persona-avatar">{persona.avatar}</div>
        <div className="persona-name">{persona.name}</div>
      </div>
      <div className="persona-response">
        {persona.text}
      </div>
      <div className="persona-footer">
        <span className="emotion-badge">{persona.emotion_tone}</span>
      </div>
    </motion.div>
  );
};
