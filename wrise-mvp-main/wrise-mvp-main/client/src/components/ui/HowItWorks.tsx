
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquare, PlayCircle, CreditCard } from 'lucide-react';
import { Button } from './button';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ 
  isOpen, 
  onClose,
  creatorName = "Creator" 
}) => {
  const steps = [
    {
      title: 'Ask a question',
      description: `Ask ${creatorName} anything about their content, process, or expertise.`,
      icon: MessageSquare,
    },
    {
      title: 'Get smart replies',
      description: 'Receive personalized answers based on their videos and posts.',
      icon: PlayCircle,
    },
    {
      title: 'Subscribe for deep dives',
      description: 'Unlock premium responses & exclusive voice content with a subscription.',
      icon: CreditCard,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-wrise-text-dark">How it works</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6 my-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-wrise-text-dark flex items-center gap-2">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                onClick={onClose}
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
