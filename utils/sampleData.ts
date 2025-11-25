// src/utils/sampleData.ts
// (renamed from uploadSampleImages.ts since we're no longer uploading)

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  reward: number;
  category: string;
  link: string;
  is_active: boolean;
  created_at: string;
  requirements?: string[];
  estimated_time?: string;
}

// Function to get sample data with affiliate offers
export const getSampleOffers = (): Offer[] => {
  return [
    {
      id: 'affiliate_hostinger',
      title: 'Hostinger Web Hosting',
      description: 'Get premium web hosting with 90% off. Perfect for websites and blogs.',
      image_url: 'https://www.hostinger.com/h-assets/images/logo-alt.svg',
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
      image_url: 'https://lovable.dev/logo.svg',
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
      image_url: 'https://www.openphone.com/wp-content/uploads/2023/01/openphone-logo.svg',
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
      image_url: 'https://www.veed.io/static/images/veed-logo.svg',
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
      image_url: 'https://elevenlabs.io/favicon.ico',
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
      image_url: 'https://manychat.com/favicon.ico',
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
      image_url: 'https://n8n.io/favicon.ico',
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
      image_url: 'https://brightdata.com/favicon.ico',
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
      image_url: 'https://cointiply.com/favicon.ico',
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
      image_url: 'https://meetava.com/favicon.ico',
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
      image_url: 'https://theleap.co/favicon.ico',
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
      image_url: 'https://amazon.com/favicon.ico',
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
      image_url: 'https://bolt.eu/favicon.ico',
      reward: 28.00,
      category: 'affiliate',
      link: 'https://get.business.bolt.eu/lx55rhexokw9',
      requirements: ['Sign up for business account', 'Complete setup'],
      estimated_time: '20 mins',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];
};