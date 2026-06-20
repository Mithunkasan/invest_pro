import type { Metadata } from 'next'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | VR Galaxy Networks',
  description: 'Find answers to frequently asked questions about VR Galaxy Networks, including community-based earning, free joining, membership benefits, referral rewards, tasks, rank rewards, and shareholder opportunities.',
  keywords: [
    'VR Galaxy Networks',
    'FAQ',
    'frequently asked questions',
    'community earning platform',
    'referral rewards',
    'shareholder opportunity',
    'rank rewards',
    'task-based income',
    'free joining platform',
    'networking platform'
  ],
  alternates: { canonical: '/faq' },
}

export default function FAQPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is VR GALAXY NETWORKS?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'VR GALAXY NETWORKS is a community-based earning and networking platform designed to provide multiple income opportunities through task completion, membership benefits, referral rewards, rank achievements, and shareholder opportunities.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is joining VR GALAXY NETWORKS free?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Anyone can join VR GALAXY NETWORKS completely free of cost and start exploring the available earning opportunities.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is this an Activation Plan Company?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No. VR GALAXY NETWORKS is not an Activation Plan Company. Members are not required to activate plans to earn returns.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is this a Daily Reward Earnings (Return on Activation Plan) Company?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No. We do not provide fixed Daily Reward Earnings or guaranteed returns on activation plans. Earnings are based on platform activities, tasks, referrals, rewards, and participation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How can members earn income?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Members can earn through: Task-based activities, Referral rewards, Membership benefits, Rank & Reward achievements, Shareholder opportunities, and Special promotions and campaigns.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can free members earn money?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Free members can participate in eligible activities and earn rewards based on the platform\'s earning opportunities.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can free members withdraw earnings?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Eligible free members can withdraw their earnings according to the platform\'s withdrawal policies and minimum withdrawal requirements.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is Membership Referral Income?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Members can invite friends, family, and others to join the platform. When referred members upgrade or participate in eligible activities, referral rewards may be earned according to the compensation plan.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Are there any membership benefits?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Membership plans may provide additional earning opportunities, exclusive rewards, special promotions, and access to premium features.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What gifts are available for members?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'VR GALAXY NETWORKS offers valuable gifts and recognition rewards based on qualifying achievements, membership milestones, campaigns, and promotional programs.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the Shareholder Opportunity?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Eligible members may participate in company growth opportunities through designated shareholder programs as per company policies and legal guidelines.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is Rank & Reward Income?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Members who achieve specific performance milestones and leadership levels can qualify for rank-based rewards, recognition, incentives, and additional income opportunities.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What does "90% Working Income & 10% Non-Working Income" mean?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Our earning model focuses primarily on active participation and productivity. The majority of income opportunities are based on member activities, while a smaller portion may come from passive reward structures and team-based achievements.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is there any limit to task earnings?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Members can access multiple task opportunities, allowing them to maximize their earning potential based on available tasks, performance, and participation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the vision of VR GALAXY NETWORKS?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Our vision is to build a sustainable, long-term platform focused on community growth, multiple earning opportunities, business expansion, and member success while striving to minimize risk and create value for all participants.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Why choose VR GALAXY NETWORKS?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Choose VR GALAXY NETWORKS for: Free Joining Option, Multiple Income Opportunities, Referral Rewards, Membership Benefits, Rank & Reward Program, Shareholder Opportunity, Task-Based Earnings, Withdrawal Facility for Eligible Members, Long-Term Business Vision, and Community Growth Focus.'
        }
      }
    ]
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      {/* Cosmic Header */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
          Frequently Asked <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
          Learn everything you need to know about VR Galaxy Networks, our community-based earning opportunities, policies, and how to maximize your networking potential.
        </p>
      </div>

      <FAQClient />
    </div>
  )
}
