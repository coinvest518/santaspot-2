'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { StatsCards } from '../components/stats-cards'
import { OffersFilter } from '../components/offers-filter'
import { Clock, Coins, GamepadIcon, ClipboardList, ListTodoIcon, ExternalLink, ShoppingCart } from 'lucide-react'
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { completeOffer, subscribeToOfferCompletions, trackOfferClick } from '@/lib/firebase'
import type { Offer } from '../types/offers'

const sampleOffers: Offer[] = [
  // Original Donation Offers
  {
    id: 'donate-strong-offspring',
    title: 'Support Strong Offspring Initiative',
    description: 'Make a donation to The Strong Offspring Initiative and earn rewards',
    category: 'tasks',
    image_url: '/images/try2.png',
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
    image_url: '/images/try2.png',
    reward: 5.0,
    is_active: true,
    estimated_time: '3 mins',
    link: 'https://www.zeffy.com/en-US/donation-form/real-estate-and-land-investing',
    created_at: new Date().toISOString(),
    requirements: ['Make any donation amount', 'One-time completion']
  },
  // Original Website Visit Offers
  {
    id: 'visit-disputeai',
    title: 'Visit DisputeAI',
    description: 'Check out DisputeAI and explore their services',
    category: 'tasks',
    image_url: '/images/try2.png',
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
    image_url: '/images/try2.png',
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
    image_url: '/images/try2.png',
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
    image_url: '/images/try2.png',
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
    image_url: '/images/try2.png',
    reward: 1.25,
    is_active: true,
    estimated_time: '3 mins',
    link: 'https://chuffed.org/project/158912-the-safe-delivery-project',
    created_at: new Date().toISOString(),
    requirements: ['Visit website', 'One-time completion']
  },
  // New Affiliate Offers with local images
  {
    id: 'affiliate_hostinger',
    title: 'Hostinger Web Hosting',
    description: 'Get premium web hosting with 90% off. Perfect for websites and blogs.',
    image_url: '/images/christmas-pot.png',
    reward: 15.00,
    category: 'affiliate',
    link: 'https://hostinger.com/horizons?REFERRALCODE=VMKMILDHI76M',
    requirements: ['Sign up for hosting plan', 'Complete purchase'],
    estimated_time: '5 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_lovable',
    title: 'Lovable AI Development',
    description: 'Build full-stack applications with AI assistance. Revolutionary development platform.',
    image_url: '/images/christmas-pot.png',
    reward: 25.00,
    category: 'affiliate',
    link: 'https://lovable.dev/?via=daniel-wray',
    requirements: ['Create account', 'Start first project'],
    estimated_time: '10 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_openphone',
    title: 'OpenPhone Business Phone',
    description: 'Professional business phone system. Get your business number instantly.',
    image_url: '/images/christmas-pot.png',
    reward: 20.00,
    category: 'affiliate',
    link: 'https://get.openphone.com/u8t88cu9allj',
    requirements: ['Sign up for trial', 'Set up phone number'],
    estimated_time: '8 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_veed',
    title: 'VEED Video Editor',
    description: 'Professional video editing made simple. Create stunning videos online.',
    image_url: '/images/christmas-pot.png',
    reward: 12.00,
    category: 'affiliate',
    link: 'https://veed.cello.so/Y4hEgduDP5L',
    requirements: ['Create account', 'Edit first video'],
    estimated_time: '15 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_elevenlabs',
    title: 'ElevenLabs AI Voice',
    description: 'Generate realistic AI voices for your content. Revolutionary voice technology.',
    image_url: '/images/christmas-pot.png',
    reward: 18.00,
    category: 'affiliate',
    link: 'https://try.elevenlabs.io/2dh4kqbqw25i',
    requirements: ['Sign up for account', 'Generate first voice'],
    estimated_time: '10 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_manychat',
    title: 'ManyChat Automation',
    description: 'Automate your customer conversations with chatbots. Boost your business.',
    image_url: '/images/christmas-pot.png',
    reward: 22.00,
    category: 'affiliate',
    link: 'https://manychat.partnerlinks.io/gal0gascf0ml',
    requirements: ['Create chatbot account', 'Set up first bot'],
    estimated_time: '20 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_n8n',
    title: 'n8n Workflow Automation',
    description: 'Automate your workflows with powerful no-code automation platform.',
    image_url: '/images/christmas-pot.png',
    reward: 16.00,
    category: 'affiliate',
    link: 'https://n8n.partnerlinks.io/pxw8nlb4iwfh',
    requirements: ['Sign up for account', 'Create first workflow'],
    estimated_time: '25 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_brightdata',
    title: 'Bright Data Proxy',
    description: 'Premium proxy services for data collection and web scraping.',
    image_url: '/images/christmas-pot.png',
    reward: 30.00,
    category: 'affiliate',
    link: 'https://get.brightdata.com/xafa5cizt3zw',
    requirements: ['Create account', 'Set up first proxy'],
    estimated_time: '15 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_cointiply',
    title: 'Cointiply Crypto Rewards',
    description: 'Earn Bitcoin and cryptocurrency through various tasks and games.',
    image_url: '/images/christmas-pot.png',
    reward: 8.00,
    category: 'crypto',
    link: 'http://www.cointiply.com/r/agAkz',
    requirements: ['Sign up for account', 'Complete first task'],
    estimated_time: '10 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_ava',
    title: 'Ava AI Assistant',
    description: 'Advanced AI assistant for productivity and automation tasks.',
    image_url: '/images/christmas-pot.png',
    reward: 14.00,
    category: 'affiliate',
    link: 'https://meetava.sjv.io/anDyvY',
    requirements: ['Create account', 'Try AI assistant'],
    estimated_time: '12 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_theleap',
    title: 'The Leap Creator Economy',
    description: 'Join the creator economy platform and monetize your skills.',
    image_url: '/images/christmas-pot.png',
    reward: 10.00,
    category: 'affiliate',
    link: 'https://join.theleap.co/FyY11sd1KY',
    requirements: ['Sign up for platform', 'Complete profile'],
    estimated_time: '15 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_amazon',
    title: 'Amazon Products',
    description: 'Shop amazing deals on Amazon with exclusive discounts.',
    image_url: '/images/christmas-pot.png',
    reward: 5.00,
    category: 'shopping',
    link: 'https://amzn.to/4lICjtS',
    requirements: ['Browse products', 'Make purchase'],
    estimated_time: '5 mins',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'affiliate_bolt',
    title: 'Bolt Business Solutions',
    description: 'Streamline your business operations with Bolt platform.',
    image_url: '/images/christmas-pot.png',
    reward: 28.00,
    category: 'affiliate',
    link: 'https://get.business.bolt.eu/lx55rhexokw9',
    requirements: ['Sign up for business account', 'Complete setup'],
    estimated_time: '20 mins',
    is_active: true,
    created_at: new Date().toISOString()
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Offer Wall</h1>
            {userProfile && (
              <StatsCards stats={{
                total_earned: userProfile.earnings || 0,
                completed_offers: userProfile.completed_offers || 0,
                current_streak: userProfile.login_streak || 0,
                social_shares: userProfile.social_shares || 0
              }} />
            )}
          </div>

          <OffersFilter
            onFilterChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden backdrop-blur bg-card/50 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <div className="relative h-48 overflow-hidden bg-purple-800">
                    {offer.image_url ? (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-900">
                      {offer.category === 'games' ? (
                        <GamepadIcon className="w-20 h-20 text-purple-300" />
                      ) : offer.category === 'surveys' ? (
                        <ClipboardList className="w-20 h-20 text-purple-300" />
                      ) : offer.category === 'affiliate' ? (
                        <ExternalLink className="w-20 h-20 text-purple-300" />
                      ) : offer.category === 'crypto' ? (
                        <Coins className="w-20 h-20 text-purple-300" />
                      ) : offer.category === 'shopping' ? (
                        <ShoppingCart className="w-20 h-20 text-purple-300" />
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
