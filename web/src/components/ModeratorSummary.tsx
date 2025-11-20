/**
 * Moderator Summary Component
 * Displays the synthesized moderator viewpoint
 */

import { motion } from 'framer-motion';
import { ModeratorVisual } from '../types';
import './ModeratorSummary.css';

interface ModeratorSummaryProps {
  moderator: ModeratorVisual;
  delay?: number;
}

export const ModeratorSummary: React.FC<ModeratorSummaryProps> = ({ moderator, delay = 0 }) => {
  return (
    <motion.div
      className="moderator-summary"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: delay / 1000,
        duration: 0.8,
        type: 'spring',
        stiffness: 200
      }}
    >
      <div className="moderator-header">
        <div className="moderator-icon">🎯</div>
        <h2>Moderator Synthesis</h2>
      </div>
      <div className="moderator-content">
        {moderator.text}
      </div>
      <div className="moderator-glow"></div>
    </motion.div>
  );
};
