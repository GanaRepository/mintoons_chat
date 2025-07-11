// app/components/gamification/RewardModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Sparkles,
  Gift,
  X
} from 'lucide-react';
import { Modal } from '@components/ui/modal';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { ProgressRing } from './ProgressRing';
import { formatNumber } from '@utils/formatters';
import { playRewardSound } from '@utils/helpers';
import type { Achievement } from '@types/achievement';
import type { RewardType, Reward } from '@types/gamification';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward;
  onClaim?: () => void;
  autoClose?: boolean;
  showConfetti?: boolean;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  reward,
  onClaim,
  autoClose = false,
  showConfetti = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Play reward sound
      playRewardSound();
      
      // Generate confetti
      if (showConfetti) {
        const particles = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][Math.floor(Math.random() * 4)]
        }));
        setConfettiParticles(particles);
      }
      
      // Show details after animation
      setTimeout(() => setShowDetails(true), 800);
      
      // Auto close if enabled
      if (autoClose) {
        setTimeout(() => onClose(), 3000);
      }
    }
  }, [isOpen, showConfetti, autoClose, onClose]);

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'level_up': return Crown;
      case 'streak': return Star;
      case 'points': return Sparkles;
      case 'special': return Gift;
      default: return Trophy;
    }
  };

  const getRewardColor = (type: RewardType) => {
    switch (type) {
      case 'achievement': return 'from-yellow-400 to-orange-500';
      case 'level_up': return 'from-purple-500 to-pink-500';
      case 'streak': return 'from-orange-400 to-red-500';
      case 'points': return 'from-blue-500 to-purple-500';
      case 'special': return 'from-green-500 to-teal-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const Icon = getRewardIcon(reward.type);
  const colorGradient = getRewardColor(reward.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="overflow-hidden"
    >
      <div className="relative">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: `${particle.x}%`,
                  y: '-10%',
                  rotate: particle.rotation,
                  scale: 0
                }}
                animate={{
                  y: '110%',
                  rotate: particle.rotation + 360,
                  scale: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 3,
                  ease: 'easeOut',
                  times: [0, 0.1, 0.9, 1]
                }}
                className="absolute w-2 h-2 rounded"
                style={{ backgroundColor: particle.color }}
              />
            ))}
          </div>
        )}

        <div className="space-y-6 text-center">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            className="flex justify-center"
          >
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-2xl`}>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Icon className="text-white" size={40} />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {reward.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {reward.description}
            </p>
          </motion.div>

          {/* Reward Value */}
          {reward.points && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Badge variant="warning" className="text-lg px-4 py-2">
                <Star size={16} className="mr-2" />
                +{formatNumber(reward.points)} Points
              </Badge>
            </motion.div>
          )}

          {/* Progress Ring for Level Up */}
          {reward.type === 'level_up' && reward.newLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <ProgressRing
                progress={100}
                size={100}
                color="#8b5cf6"
                animated={true}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reward.newLevel}
                  </div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
              </ProgressRing>
            </motion.div>
          )}

          {/* Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Achievement Details */}
                {reward.type === 'achievement' && reward.achievement && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Achievement Unlocked!
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {reward.achievement.description}
                    </p>
                  </div>
                )}

                {/* Streak Details */}
                {reward.type === 'streak' && reward.streakDays && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                      {reward.streakDays} Day Writing Streak!
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      You're on fire! Keep writing to maintain your streak.
                    </p>
                  </div>
                )}

                {/* Level Up Benefits */}
                {reward.type === 'level_up' && reward.newLevel && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      Level {reward.newLevel} Benefits
                    </h3>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Access to advanced AI writing tools</li>
                      <li>• New story templates and themes</li>
                      <li>• Priority support from mentors</li>
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center space-x-3"
          >
            {onClaim && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  onClaim();
                  onClose();
                }}
                className="min-w-[120px]"
              >
                <Gift size={16} className="mr-2" />
                Claim Reward
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="min-w-[120px]"
            >
              Continue
            </Button>
          </motion.div>

          {/* Share Achievement */}
          {reward.type === 'achievement' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Share your achievement with friends!
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: `I just earned the "${reward.title}" achievement on MINTOONS!`,
                      text: reward.description,
                      url: window.location.origin
                    });
                  }
                }}
              >
                <Sparkles size={14} className="mr-2" />
                Share Achievement
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};