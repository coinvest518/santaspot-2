'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { StatsCards } from '../components/stats-cards'
import { OffersFilter } from '../components/offers-filter'
import { Clock, Coins, GamepadIcon, ClipboardList, ListTodoIcon } from 'lucide-react'
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { completeOffer, subscribeToOfferCompletions, trackOfferClick } from '@/lib/firebase'
import type { Offer, UserStats } from '../types/offers'

const sampleOffers: Offer[] = [
  // Donation Offers
  {
    id: 'donate-strong-offspring',
    title: 'Support Strong Offspring Initiative',
    description: 'Make a donation to The Strong Offspring Initiative and earn rewards',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 5.0,
    is_active: true,
    estimated_time: '3 mins',
    link: 'https://www.zeffy.com/en-US/donation-form/the-strong-offspring-initiative',
    created_at: new Date().toISOString(),
    requirements: ['Make any donation amount', 'One-time completion']
  },
  {
    id: 'donate-real-estate',
    title: 'Support Real Estate & Land Investing',
    description: 'Donate to Real Estate and Land Investing initiative',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 5.0,
    is_active: true,
    estimated_time: '3 mins',
    link: 'https://www.zeffy.com/en-US/donation-form/real-estate-and-land-investing',
    created_at: new Date().toISOString(),
    requirements: ['Make any donation amount', 'One-time completion']
  },
  // Website Visit Offers
  {
    id: 'visit-disputeai',
    title: 'Visit DisputeAI',
    description: 'Check out DisputeAI and explore their services',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 0.50,
    is_active: true,
    estimated_time: '2 mins',
    link: 'https://disputeai.xyz',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  },
  {
    id: 'visit-consumerai',
    title: 'Visit ConsumerAI',
    description: 'Explore ConsumerAI information and services',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 0.75,
    is_active: true,
    estimated_time: '2 mins',
    link: 'https://consumerai.info',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  },
  {
    id: 'visit-fortisproles',
    title: 'Visit Fortis Proles',
    description: 'Discover Fortis Proles and their offerings',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 1.0,
    is_active: true,
    estimated_time: '2 mins',
    link: 'https://fortisproles.com',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  },
  {
    id: 'visit-fdwa',
    title: 'Visit FDWA',
    description: 'Check out FDWA site and learn more',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 0.60,
    is_active: true,
    estimated_time: '2 mins',
    link: 'https://fdwa.site',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  },
  {
    id: 'visit-safe-delivery',
    title: 'Support Safe Delivery Project',
    description: 'Visit and learn about The Safe Delivery Project',
    category: 'tasks',
    image_file: '/images/try2.png',
    reward: 1.25,
    is_active: true,
    estimated_time: '3 mins',
    link: 'https://chuffed.org/project/158912-the-safe-delivery-project',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  }
];

const Offers: React.FC = () => {
  const { firebaseUser, userProfile } = useFirebaseUser();
  const [offers, setOffers] = useState<Offer[]>(sampleOffers);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(sampleOffers);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedOffers, setCompletedOffers] = useState<string[]>([]);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);

  useEffect(() => {
    filterOffers();
  }, [offers, activeCategory, searchQuery]);

  useEffect(() => {
    if (userProfile?.uuid) {
      const unsubscribe = subscribeToOfferCompletions(userProfile.uuid, (completedIds) => {
        setCompletedOffers(completedIds);
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  const filterOffers = () => {
    let filtered = [...offers];

    if (activeCategory !== 'All') {
      filtered = filtered.filter(offer =>
        offer.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  };

  const handleOfferClick = async (offer: Offer) => {
    if (!firebaseUser || !userProfile) {
      toast.error("Please sign in to start offers");
      return;
    }

    if (completedOffers.includes(offer.id)) {
      toast.error("You've already completed this offer!");
      return;
    }

    if (processingOffer === offer.id) {
      return;
    }

    setProcessingOffer(offer.id);
    
    // Track offer click for points
    try {
      await trackOfferClick(userProfile.uuid, offer.id);
      toast.success(`+1 point for clicking offer!`);
    } catch (error) {
      console.error('Failed to track offer click:', error);
    }
    
    window.open(offer.link, '_blank');
    
    toast.success(`Opening ${offer.title}. Click "Mark as Complete" when done!`, {
      duration: 5000,
    });

    setTimeout(() => setProcessingOffer(null), 2000);
  };

  const handleMarkComplete = async (offer: Offer) => {
    if (!userProfile) {
      toast.error("Please sign in first");
      return;
    }

    if (completedOffers.includes(offer.id)) {
      toast.error("You've already completed this offer!");
      return;
    }

    try {
      await completeOffer(userProfile.uuid, offer.id, offer.reward);
      toast.success(`Earned $${offer.reward.toFixed(2)}! 🎉`);
    } catch (error) {
      toast.error("Failed to complete offer. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">Offer Wall</h1>
            {userProfile && (
              <StatsCards stats={{
                total_earned: userProfile.earnings || 0,
                completed_offers: userProfile.completed_offers || 0,
                current_streak: userProfile.login_streak || 0
              }} />
            )}
          </div>

          <OffersFilter
            onFilterChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <GamepadIcon className="mr-2" /> Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Play games and earn rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ClipboardList className="mr-2" /> Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Complete surveys for instant rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ListTodoIcon className="mr-2" /> Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">Complete task and Gain Rewards</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden backdrop-blur bg-card/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <div className="relative h-48 overflow-hidden bg-purple-800">
                    {offer.image_file ? (
                      <img
                        src={offer.image_file}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-900">
                        {offer.category === 'games' ? (
                          <GamepadIcon className="w-20 h-20 text-purple-300" />
                        ) : offer.category === 'surveys' ? (
                          <ClipboardList className="w-20 h-20 text-purple-300" />
                        ) : (
                          <ListTodoIcon className="w-20 h-20 text-purple-300" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{offer.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{offer.description}</p>
                    {offer.requirements && (
                      <ul className="space-y-2">
                        {offer.requirements.map((req, i) => (
                          <li key={i} className="text-sm text-white-400">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between text-sm text-white-400">
                      {offer.estimated_time && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{offer.estimated_time}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Coins className="w-4 h-4 mr-1" />
                        <span className="font-semibold text-white">
                          ${offer.reward.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {completedOffers.includes(offer.id) ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled
                      >
                        ✓ Completed
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleOfferClick(offer)}
                          disabled={processingOffer === offer.id}
                        >
                          {processingOffer === offer.id ? 'Opening...' : 'Start Offer'}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkComplete(offer)}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Offers;
