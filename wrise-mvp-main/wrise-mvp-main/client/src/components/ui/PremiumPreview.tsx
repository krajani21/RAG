
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquare, Volume2, ArrowRight, Check } from 'lucide-react';
import { Button } from './button';
import { Toggle } from './toggle';

interface PremiumPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  creatorName?: string;
  price?: string;
}

export const PremiumPreview: React.FC<PremiumPreviewProps> = ({ 
  isOpen, 
  onClose,
  onSubscribe,
  creatorName = "Creator",
  price = "$7.99" 
}) => {
  const [previewMode, setPreviewMode] = useState<'text' | 'voice'>('text');
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-wrise-text-dark">Premium Preview</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex gap-2 mb-4">
                  <Toggle
                    pressed={previewMode === 'text'}
                    onPressedChange={() => setPreviewMode('text')}
                    className={`${previewMode === 'text' ? 'bg-primary text-white' : 'bg-gray-200'} rounded-l-md`}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Text Preview
                  </Toggle>
                  <Toggle
                    pressed={previewMode === 'voice'} 
                    onPressedChange={() => setPreviewMode('voice')}
                    className={`${previewMode === 'voice' ? 'bg-primary text-white' : 'bg-gray-200'} rounded-r-md`}
                  >
                    <Volume2 className="mr-1 h-4 w-4" />
                    Voice Preview
                  </Toggle>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-gray-200 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                      F
                    </div>
                    <div className="bg-gray-200 rounded-lg rounded-tl-none p-3 text-sm">
                      What mic do you use for YouTube?
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                      {creatorName.charAt(0)}
                    </div>
                    <div className="bg-primary/10 rounded-lg rounded-tl-none p-3 text-sm">
                      I use the Rode VideoMic Pro+ — amazing sound and super portable. I reviewed it here: 
                      <span className="text-primary font-medium">[link]</span> 🎤
                      {previewMode === 'voice' && (
                        <div className="mt-2 bg-white rounded-md p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            <div className="bg-gray-200 h-1 w-24 rounded-full overflow-hidden">
                              <div className="bg-primary h-full w-3/4"></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">0:16</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-wrise-text-dark">With Premium you get:</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    "Unlimited questions & deep-dive answers",
                    "Voice responses (coming soon)",
                    "Priority response time",
                    "Exclusive premium content"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-accent" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                className="w-full btn-gradient group"
                onClick={onSubscribe}
              >
                Subscribe for {price}/month
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                Cancel anytime. Your subscription directly supports the creator.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
