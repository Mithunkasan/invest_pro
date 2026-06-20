export interface FAQItem {
  id: string;
  category: 'general' | 'earnings' | 'membership' | 'rewards' | 'vision';
  question: string;
  answer: string;
  listItems?: string[];
}

export const FAQ_CATEGORIES = {
  general: 'General Info',
  earnings: 'Earnings & Tasks',
  membership: 'Membership & Referrals',
  rewards: 'Rank & Shareholder',
  vision: 'Vision & Why Us',
} as const;

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is VR GALAXY NETWORKS?',
    answer: 'VR GALAXY NETWORKS is a community-based earning and networking platform designed to provide multiple income opportunities through task completion, membership benefits, referral rewards, rank achievements, and shareholder opportunities.'
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Is joining VR GALAXY NETWORKS free?',
    answer: 'Yes. Anyone can join VR GALAXY NETWORKS completely free of cost and start exploring the available earning opportunities.'
  },
  {
    id: 'faq-3',
    category: 'general',
    question: 'Is this an Activation Plan Company?',
    answer: 'No. VR GALAXY NETWORKS is not an Activation Plan Company. Members are not required to activate plans to earn returns.'
  },
  {
    id: 'faq-4',
    category: 'general',
    question: 'Is this an ROI (Return on Activation Plan) Company?',
    answer: 'No. We do not provide fixed ROI or guaranteed returns on activation plans. Earnings are based on platform activities, tasks, referrals, rewards, and participation.'
  },
  {
    id: 'faq-5',
    category: 'earnings',
    question: 'How can members earn income?',
    answer: 'Members can earn through:',
    listItems: [
      'Task-based activities',
      'Referral rewards',
      'Membership benefits',
      'Rank & Reward achievements',
      'Shareholder opportunities',
      'Special promotions and campaigns'
    ]
  },
  {
    id: 'faq-6',
    category: 'earnings',
    question: 'Can free members earn money?',
    answer: 'Yes. Free members can participate in eligible activities and earn rewards based on the platform\'s earning opportunities.'
  },
  {
    id: 'faq-7',
    category: 'earnings',
    question: 'Can free members withdraw earnings?',
    answer: 'Yes. Eligible free members can withdraw their earnings according to the platform\'s withdrawal policies and minimum withdrawal requirements.'
  },
  {
    id: 'faq-8',
    category: 'membership',
    question: 'What is Membership Referral Income?',
    answer: 'Members can invite friends, family, and others to join the platform. When referred members upgrade or participate in eligible activities, referral rewards may be earned according to the compensation plan.'
  },
  {
    id: 'faq-9',
    category: 'membership',
    question: 'Are there any membership benefits?',
    answer: 'Yes. Membership plans may provide additional earning opportunities, exclusive rewards, special promotions, and access to premium features.'
  },
  {
    id: 'faq-10',
    category: 'membership',
    question: 'What gifts are available for members?',
    answer: 'VR GALAXY NETWORKS offers valuable gifts and recognition rewards based on qualifying achievements, membership milestones, campaigns, and promotional programs.'
  },
  {
    id: 'faq-11',
    category: 'rewards',
    question: 'What is the Shareholder Opportunity?',
    answer: 'Eligible members may participate in company growth opportunities through designated shareholder programs as per company policies and legal guidelines.'
  },
  {
    id: 'faq-12',
    category: 'rewards',
    question: 'What is Rank & Reward Income?',
    answer: 'Members who achieve specific performance milestones and leadership levels can qualify for rank-based rewards, recognition, incentives, and additional income opportunities.'
  },
  {
    id: 'faq-13',
    category: 'earnings',
    question: 'What does "90% Working Income & 10% Non-Working Income" mean?',
    answer: 'Our earning model focuses primarily on active participation and productivity. The majority of income opportunities are based on member activities, while a smaller portion may come from passive reward structures and team-based achievements.'
  },
  {
    id: 'faq-14',
    category: 'earnings',
    question: 'Is there any limit to task earnings?',
    answer: 'Members can access multiple task opportunities, allowing them to maximize their earning potential based on available tasks, performance, and participation.'
  },
  {
    id: 'faq-15',
    category: 'vision',
    question: 'What is the vision of VR GALAXY NETWORKS?',
    answer: 'Our vision is to build a sustainable, long-term platform focused on community growth, multiple earning opportunities, business expansion, and member success while striving to minimize risk and create value for all participants.'
  },
  {
    id: 'faq-16',
    category: 'vision',
    question: 'Why choose VR GALAXY NETWORKS?',
    answer: '',
    listItems: [
      'Free Joining Option',
      'Multiple Income Opportunities',
      'Referral Rewards',
      'Membership Benefits',
      'Rank & Reward Program',
      'Shareholder Opportunity',
      'Task-Based Earnings',
      'Withdrawal Facility for Eligible Members',
      'Long-Term Business Vision',
      'Community Growth Focus'
    ]
  }
];
