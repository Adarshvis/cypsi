import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
        },
      ],
    },
  }
}

async function seed() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })
  console.log('Payload ready. Seeding...')

  // 1. Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@ducc.du.ac.in',
        password: 'Admin@2024',
        firstName: 'Admin',
        lastName: 'DUCC',
        roles: ['super_admin'],
      },
    })
    console.log('✅ Admin user created')
  } catch (e: any) {
    console.log('   Admin user:', e.message?.slice(0, 60))
  }

  // 2. Update Site Settings
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'DUCC - Delhi University Computer Centre',
        themePreset: 'ducc',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
        themeColors: {
          primaryColor: '#4B2E83',
          secondaryColor: '#1A103D',
          accentColor: '#EAB308',
          backgroundColor: '#FFFFFF',
          surfaceColor: '#FFFFFF',
          mutedBackgroundColor: '#F8F4FF',
          textColor: '#1A103D',
        },
        socialLinks: [
          { platform: 'facebook', url: '#' },
          { platform: 'twitter', url: '#' },
          { platform: 'linkedin', url: '#' },
          { platform: 'youtube', url: '#' },
        ],
      } as any,
    })
    console.log('✅ Site Settings updated')
  } catch (e: any) {
    console.log('   Site Settings:', e.message?.slice(0, 80))
  }

  // 3. Update Header
  try {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        topBar: { enabled: true, text: 'University of Delhi · Established 1956 | Central IT Institution', backgroundColor: '#1A103D' },
        centerLogo: { title: 'DUCC', subtitle: 'Delhi University Computer Centre', url: '/' },
        navAlignment: 'center',
        ctaButton: { enabled: true, label: 'Samarth Login', url: 'https://du.samarth.ac.in/index.php/site/login' },
        searchBar: { enabled: true, placeholder: 'Search...' },
      } as any,
    })
    console.log('✅ Header updated')
  } catch (e: any) {
    console.log('   Header:', e.message?.slice(0, 80))
  }

  // 4. Update Footer
  try {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        copyrightText: '© 2026 DUCC · University of Delhi · Established 1956. All rights reserved.',
        columns: [
          {
            heading: 'Services',
            links: [
              { label: 'DU Samarth', url: 'https://du.samarth.ac.in', newTab: true },
              { label: 'Email & Workspace', url: '/it-services' },
              { label: 'Wi-Fi & VPN', url: '/it-services' },
              { label: 'Web Hosting', url: '/it-services' },
              { label: 'Cyber Security', url: '/it-services' },
            ],
          },
          {
            heading: 'Academic',
            links: [
              { label: 'Admission Portal', url: 'https://admission.uod.ac.in', newTab: true },
              { label: 'Student Portal', url: 'https://slc.uod.ac.in', newTab: true },
              { label: 'Digital Degrees', url: 'https://digicerti.du.ac.in', newTab: true },
              { label: 'Software', url: '/software' },
              { label: 'Trainings', url: '/trainings' },
            ],
          },
          {
            heading: 'Support',
            links: [
              { label: 'Help & Support', url: '/help-and-support' },
              { label: 'Submit a Ticket', url: '/help-and-support' },
              { label: 'FAQs', url: '/help-and-support#faqs' },
              { label: 'Projects', url: '/projects' },
              { label: 'About DUCC', url: '/about' },
            ],
          },
        ],
        contactInfo: {
          address: 'Delhi University Computer Centre (DUCC), University of Delhi, Delhi – 110007',
          email: 'helpdesk@ducc.du.ac.in',
          phone: '+91 11 2700 XXXX',
        },
        showSocialLinks: true,
      } as any,
    })
    console.log('✅ Footer updated')
  } catch (e: any) {
    console.log('   Footer:', e.message?.slice(0, 80))
  }


  // 5. Create NEWS articles
  const newsData = [
    { title: 'Recruitment Configuration Session on DU Samarth Portal', excerpt: 'Dyal Singh College team completed advanced recruitment module configuration and rollout.', date: '2026-04-10', category: 'Samarth', image: 'https://images.pexels.com/photos/10498800/pexels-photo-10498800.jpeg' },
    { title: 'Inventory Module Training for DUCC Office', excerpt: 'Hands-on training for DUCC administrative staff on asset & inventory management workflows.', date: '2026-04-02', category: 'Training', image: 'https://images.unsplash.com/photo-1558008258-3256797b43f3' },
    { title: 'Five-Day Faculty Development Programme on Cybersecurity', excerpt: 'Comprehensive FDP covering contemporary cybersecurity concepts, demonstrations, and hands-on sessions.', date: '2026-03-11', category: 'Cybersecurity', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b' },
    { title: 'Training on Cybersecurity and Digital Hygiene', excerpt: 'Awareness workshop focused on practical digital hygiene practices for staff and researchers.', date: '2026-01-06', category: 'Awareness', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5' },
    { title: 'Online Workshop on COMSOL Multiphysics', excerpt: 'Research-oriented workshop on multiphysics simulation platform for faculty and PhD scholars.', date: '2025-12-04', category: 'Workshop', image: 'https://images.unsplash.com/photo-1644088379091-d574269d422f' },
    { title: 'Cyber Satarkata – Cyber Security Awareness Session', excerpt: 'Concluding session of the month-long cybersecurity awareness programme across DU campuses.', date: '2025-11-25', category: 'Awareness', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b' },
  ]

  for (const n of newsData) {
    try {
      await payload.create({
        collection: 'news',
        data: {
          title: n.title,
          slug: n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          excerpt: n.excerpt,
          category: n.category,
          publishedDate: n.date,
          content: richText(n.excerpt),
          status: 'published',
        } as any,
      })
    } catch (e: any) { /* skip duplicates */ }
  }
  console.log('✅ News articles created')

  // 6. Create SOFTWARE entries
  const softwareData = [
    { name: 'Turnitin', category: 'Plagiarism Detection', users: '1,309', submissions: '33,750', description: 'Industry-standard originality checking for research papers and dissertations.', icon: 'FileCheck' },
    { name: 'Drillbit', category: 'Plagiarism Detection', users: '1,650', submissions: '50,202', description: 'Comprehensive plagiarism detection integrated with DU Samarth.', icon: 'Search' },
    { name: 'COMSOL Multiphysics', category: 'Research Software', users: '450+', submissions: '', description: 'Advanced multiphysics simulation for engineering, manufacturing, and research.', icon: 'Atom' },
    { name: 'MATLAB', category: 'Research Software', users: '1,200+', submissions: '', description: 'Numerical computing environment for algorithm development and data analysis.', icon: 'LineChart' },
    { name: 'Google Workspace', category: 'Productivity', users: '74,000+', submissions: '', description: 'Complete productivity suite — Gmail, Drive, Docs, Sheets, Meet and Classroom.', icon: 'Mail' },
    { name: 'SPSS', category: 'Statistical Software', users: '800+', submissions: '', description: 'Statistical analysis software for social sciences and humanities research.', icon: 'BarChart3' },
    { name: 'Samarth ERP', category: 'e-Governance', users: '74,000+', submissions: '', description: '9 core modules + 40+ sub-modules covering academics, finance, HR and administration.', icon: 'LayoutDashboard' },
    { name: 'Turnitin iThenticate', category: 'Plagiarism Detection', users: '320', submissions: '5,400', description: 'Professional-grade similarity checking for published research manuscripts.', icon: 'ShieldCheck' },
  ]

  for (const s of softwareData) {
    try {
      await payload.create({
        collection: 'software' as any,
        data: { ...s, status: 'active', sortOrder: 0 } as any,
      })
    } catch (e: any) { /* skip */ }
  }
  console.log('✅ Software entries created')

  // 7. Create PROJECT entries
  const projectsData = [
    { title: 'DU Samarth eGovernance Rollout', status: 'ongoing', description: 'Implementation of the unified eGov platform across all DU departments and colleges. Admissions, examinations, HR, finance and student lifecycle are being migrated in phases.', modules: ['Admissions', 'Examinations', 'HR & Payroll', 'Finance', 'Estate Management'], progress: 78 },
    { title: 'Wi-Fi 6 Campus-Wide Rollout', status: 'active', description: 'Deployment of 1,000+ Wi-Fi 6 access points across 20 hostels and 18 on-campus colleges with single sign-on.', modules: ['SSO Integration', 'Access Points', 'Bandwidth Management'], progress: 92 },
    { title: 'MPLS Inter-College Network', status: 'ongoing', description: '42 colleges connected via MPLS/VPN at 250 Mbps per college, enabling unified academic collaboration.', modules: ['MPLS Backbone', 'VPN Setup', 'Network Monitoring'], progress: 85 },
    { title: 'Cloud Migration to GCP', status: 'ongoing', description: 'Migration of university workloads to Google Cloud — 67 EC2 instances and 30 RDS instances with 92.5 TB S3 storage.', modules: ['Compute', 'Database', 'Object Storage'], progress: 70 },
    { title: 'Digital Degree Portal (digicerti.du.ac.in)', status: 'live', description: 'Digitally signed degree certificates, transcripts, and verification system for DU graduates worldwide.', modules: ['Certificate Issuance', 'Verification API', 'Transcript Request'], progress: 100 },
    { title: 'University Website Redesign (du.ac.in)', status: 'ongoing', description: 'Bilingual (English + Devanagari) redesign of the official University website with accessibility compliance.', modules: ['CMS', 'Accessibility', 'Bilingual Support'], progress: 60 },
  ]

  for (const p of projectsData) {
    try {
      await payload.create({
        collection: 'projects' as any,
        data: { title: p.title, description: p.description, status: p.status, progress: p.progress, modules: p.modules.map(m => ({ name: m })), sortOrder: 0 } as any,
      })
    } catch (e: any) { /* skip */ }
  }
  console.log('✅ Projects created')

  // 8. Create TRAINING entries
  const trainingsData = [
    { title: 'Cybersecurity Faculty Development Programme', duration: '5 Days', mode: 'In-person', audience: 'Faculty', level: 'Intermediate', nextBatch: '2026-05-15', topics: ['Threat modelling', 'Network security', 'Incident response', 'Compliance'] },
    { title: 'Samarth Portal — Admin Training', duration: '3 Days', mode: 'Hybrid', audience: 'Administrative Staff', level: 'Beginner', nextBatch: '2026-05-22', topics: ['Module navigation', 'Workflow configuration', 'Reports', 'Troubleshooting'] },
    { title: 'Digital Hygiene for Researchers', duration: '1 Day', mode: 'Online', audience: 'Students & Faculty', level: 'Beginner', nextBatch: '2026-05-08', topics: ['Password security', 'Phishing', 'Data backup', 'Safe browsing'] },
    { title: 'COMSOL Multiphysics Workshop', duration: '2 Days', mode: 'Online', audience: 'Researchers', level: 'Advanced', nextBatch: '2026-06-02', topics: ['Simulation basics', 'Mesh generation', 'Multiphysics coupling', 'Result analysis'] },
    { title: 'GeM & e-Procurement Training', duration: '1 Day', mode: 'In-person', audience: 'Procurement Officers', level: 'Intermediate', nextBatch: '2026-05-18', topics: ['Catalogue management', 'Bid creation', 'Vendor evaluation', 'Compliance'] },
    { title: 'Google Workspace Productivity', duration: '2 Days', mode: 'Online', audience: 'All Staff', level: 'Beginner', nextBatch: '2026-05-12', topics: ['Gmail advanced', 'Drive sharing', 'Meet best practices', 'Docs collaboration'] },
  ]

  for (const t of trainingsData) {
    try {
      await payload.create({
        collection: 'trainings' as any,
        data: { title: t.title, duration: t.duration, mode: t.mode, audience: t.audience, level: t.level, nextBatch: t.nextBatch, topics: t.topics.map(tp => ({ name: tp })), status: 'active', sortOrder: 0 } as any,
      })
    } catch (e: any) { /* skip */ }
  }
  console.log('✅ Trainings created')


  // ═══════════════════════════════════════════
  // 9. HOME PAGE
  // ═══════════════════════════════════════════
  try {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        status: 'published',
        showInNav: true,
        navOrder: 0,
        layout: [
          // Hero carousel with quick access
          {
            blockType: 'hero',
            mode: 'carousel',
            layout: 'duccFullscreen',
            height: 600,
            textAlignment: 'left',
            overlay: { enabled: true, color: '#000000', opacity: 40 },
            carouselSettings: { autoPlay: true, autoPlayInterval: 6000, showArrows: true, showDots: true },
            duccFloatingCard: {
              enabled: true,
              badgeLabel: 'Live Snapshot',
              footerText: 'Updated Real-time',
              footerLink: '/about',
              footerLinkLabel: 'View dashboard →',
              stats: [
                { value: '74K+', label: 'Active Users' },
                { value: '84 TB', label: 'Cloud Storage' },
                { value: '15K+', label: 'Network Nodes' },
                { value: '10 Gbps', label: 'Bandwidth' },
              ],
            },
            duccShowSlideCounter: true,
            duccShowPlayPause: true,
            quickAccessBar: {
              enabled: true,
              overlapAmount: 80,
              items: [
                { label: 'Samarth DU', icon: 'LayoutDashboard', link: 'https://du.samarth.ac.in/index.php/site/login', external: true, colorVariant: 'primary' },
                { label: 'Email', icon: 'Mail', link: '/it-services', external: false, colorVariant: 'dark' },
                { label: 'WiFi & VPN', icon: 'Wifi', link: '/it-services', external: false, colorVariant: 'primary' },
                { label: 'Web Hosting', icon: 'Globe', link: '/it-services', external: false, colorVariant: 'dark' },
                { label: 'Cyber Security', icon: 'ShieldCheck', link: '/it-services', external: false, colorVariant: 'primary' },
                { label: 'Help Desk', icon: 'LifeBuoy', link: '/help-and-support', external: false, colorVariant: 'dark' },
              ],
            },
            slides: [
              { mediaType: 'image', eyebrowText: 'ESTABLISHED 1956', showText: true, heading: 'Delhi University Computer Centre', subtitle: 'Powering knowledge, connectivity & digital governance for the entire DU community since 1956.', headingColor: '#FFFFFF', subtitleColor: '#E5E7EB', buttons: [{ label: 'Explore Services', url: '/it-services', variant: 'primary' }, { label: 'Watch Video', url: '#', variant: 'outline' }] },
              { mediaType: 'image', eyebrowText: 'CORE SERVICE DOMAINS', showText: true, heading: 'Modern IT Infrastructure', subtitle: 'Managing 15K+ network nodes, 84TB cloud storage, and serving 74K+ active users daily across DU campuses.', headingColor: '#FFFFFF', subtitleColor: '#E5E7EB', buttons: [{ label: 'View Infrastructure', url: '/about', variant: 'primary' }] },
              { mediaType: 'image', eyebrowText: 'DIGITAL TRANSFORMATION', showText: true, heading: 'Samarth eGovernance', subtitle: '9 core modules, 40+ sub-modules covering admissions, examinations, finance, HR and student lifecycle.', headingColor: '#FFFFFF', subtitleColor: '#E5E7EB', buttons: [{ label: 'Access Samarth', url: 'https://du.samarth.ac.in/index.php/site/login', variant: 'primary' }] },
              { mediaType: 'image', eyebrowText: 'BUILDING DIGITAL CAPACITY', showText: true, heading: 'Cybersecurity & Training', subtitle: 'Faculty Development Programmes, workshops, and hands-on sessions on emerging technologies.', headingColor: '#FFFFFF', subtitleColor: '#E5E7EB', buttons: [{ label: 'Browse Trainings', url: '/trainings', variant: 'primary' }] },
            ],
          },
          // About section (FlexibleRow)
          {
            blockType: 'flexibleRow',
            sectionHeading: '',
            sectionBgColor: '#FFFFFF',
            radialGlow: true,
            gap: '8',
            verticalAlign: 'center',
            columns: [
              {
                width: '50',
                blocks: [
                  {
                    blockType: 'flexRichText',
                    headingFontFamily: 'Playfair Display',
                    fontSize: 'base',
                    textColor: '#1A103D',
                    content: {
                      root: { type: 'root', format: '', indent: 0, version: 1, children: [
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: 'color: #4B2E83; font-size: 12px;', text: '✨ ABOUT DUCC', version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 1, mode: 'normal', style: 'font-size: 36px;', text: "One of India's earliest ", version: 1 }, { type: 'text', detail: 0, format: 1, mode: 'normal', style: 'color: #4B2E83; font-size: 36px;', text: 'university', version: 1 }, { type: 'text', detail: 0, format: 1, mode: 'normal', style: 'font-size: 36px;', text: ' computer centres.', version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: 'color: #4B5563;', text: 'Established in 1956, DUCC serves as the central IT institution for the University of Delhi. We provide critical technology support to the entire DU community including students, faculty, administrative staff, and partner institutions.', version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: "• Strategic planning & oversight of the University's IT infrastructure and services", version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '• Consulting academic and administrative units on IT requirements and capabilities', version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '• Working with Deans and governance committees (IQAC, Planning, Admissions, Examinations, Libraries)', version: 1 }] },
                        { type: 'paragraph', format: '', indent: 0, version: 1, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '• Managing central IT services — networking, data centres, security and telecommunications', version: 1 }] },
                      ] },
                    },
                  },
                  {
                    blockType: 'flexButtons',
                    alignment: 'left',
                    buttons: [{ label: 'Read More', url: '/about', variant: 'primary', size: 'md', icon: 'ArrowRight' }],
                  },
                ],
              },
              {
                width: '50',
                blocks: [
                  {
                    blockType: 'flexStatsCards',
                    columns: '2',
                    cardStyle: 'duccAbout',
                    cards: [
                      { value: '74K+', label: 'Active Users', icon: 'Users', iconColor: '#4B2E83' },
                      { value: '84 TB', label: 'Cloud Storage', icon: 'Cloud', iconColor: '#4B2E83' },
                      { value: '15K+', label: 'Network Nodes', icon: 'Network', iconColor: '#4B2E83' },
                      { value: '180+', label: 'Hosted Websites', icon: 'Globe', iconColor: '#4B2E83' },
                      { value: '10 Gbps', label: 'Internet Bandwidth', icon: 'Zap', iconColor: '#4B2E83' },
                      { value: '42', label: 'MPLS Colleges', icon: 'School', iconColor: '#4B2E83' },
                    ],
                  },
                ],
              },
            ],
          },
          // Services section
          {
            blockType: 'featureCards',
            eyebrow: 'WHAT WE DO',
            sectionHeading: 'Services for staff, students and academics.',
            ctaLabel: 'Explore all services',
            ctaLink: '/it-services',
            cardLayout: 'duccService',
            columns: '4',
            cards: [
              { icon: 'LayoutDashboard', title: richText('DU Samarth eGov'), description: richText('Open-source e-governance platform with 9 core modules and 40+ sub-modules.'), tag: 'Platform', link: 'https://du.samarth.ac.in', external: true },
              { icon: 'Mail', title: richText('Email & Google Workspace'), description: richText('74,000+ active email accounts with 84TB cloud storage, Meet, Drive, and Classroom.'), tag: 'Collaboration', link: '/it-services' },
              { icon: 'Wifi', title: richText('Wi-Fi & VPN Services'), description: richText('Campus-wide Wi-Fi 6 with 1,000+ access points, secure VPN at 250 Mbps per college.'), tag: 'Connectivity', link: '/it-services' },
              { icon: 'ShieldCheck', title: richText('Cyber Security'), description: richText('Comprehensive security framework, vulnerability management, and awareness programs.'), tag: 'Security', link: '/it-services' },
              { icon: 'Globe', title: richText('Web Hosting Services'), description: richText('Hosting 180+ departmental, college, hostel, and research websites under du.ac.in.'), tag: 'Hosting', link: '/it-services' },
              { icon: 'FileCheck', title: richText('Plagiarism Detection'), description: richText('Turnitin and Drillbit licenses — 83,952 research papers checked for originality.'), tag: 'Research', link: '/it-services' },
              { icon: 'ShoppingCart', title: richText('GeM & e-Procurement'), description: richText('Single-point support for Government e-Marketplace across 129 departments.'), tag: 'Administration', link: '/it-services' },
              { icon: 'Headphones', title: richText('IT Service Desk'), description: richText('Centralised helpdesk with web, email, and ticket-based query resolution.'), tag: 'Support', link: '/help-and-support' },
            ],
          },
          // News section
          {
            blockType: 'newsUpdates',
            sectionHeading: 'News from IT Services',
            sectionDescription: 'Latest updates',
            layout: 'duccCards',
            entryType: 'collection',
            collectionSource: { limit: 3, sortBy: 'latest' },
            bottomLink: { enabled: true, label: 'All news', url: '/trainings' },
            backgroundColor: '#FFFFFF',
          },
          // Director quote
          {
            blockType: 'testimonials',
            layout: 'duccQuote',
            items: [
              {
                quote: 'DUCC collaborates with University partners to advance teaching, learning, innovation and discovery — enabling a digitally empowered academic ecosystem at the University of Delhi.',
                name: 'Prof. Sanjeev Singh',
                role: 'Director, DUCC',
                initials: 'SS',
              },
            ],
          },
          // CTA Banner
          {
            blockType: 'callToAction',
            layout: 'duccBanner',
            heading: 'Problem with Samarth, Wi-Fi, Training, Web hosting or Security?',
            description: 'Our central IT Service Desk provides front-line user support for all staff and students.',
            buttons: [
              { label: 'Get IT Help', url: '/help-and-support', variant: 'primary' },
              { label: 'Email Helpdesk', url: 'mailto:helpdesk@ducc.du.ac.in', variant: 'outline' },
            ],
          },
        ],
      } as any,
    })
    console.log('✅ Home page created')
  } catch (e: any) {
    console.log('   Home page:', e.message?.slice(0, 80))
  }


  // ═══════════════════════════════════════════
  // 10. ABOUT PAGE
  // ═══════════════════════════════════════════
  try {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'About DUCC',
        slug: 'about',
        bannerEyebrow: 'ABOUT DUCC',
        bannerDescription: "One of India's earliest and most prestigious university computer centres, DUCC provides critical technology support, strategic direction, and digital governance for the entire University of Delhi community.",
        status: 'published',
        showInNav: true,
        navOrder: 1,
        layout: [
          // Mission / Vision / Heritage cards
          {
            blockType: 'featureCards',
            cardLayout: 'classic',
            cardTheme: 'light',
            columns: '3',
            cards: [
              { icon: 'Target', title: richText('Our Mission'), description: richText('To deliver world-class IT infrastructure, governance and training that empowers teaching, learning and research at Delhi University.') },
              { icon: 'Eye', title: richText('Our Vision'), description: richText("To be recognised as India's leading university IT centre — integrating digital infrastructure, e-governance, security and capacity building under one roof.") },
              { icon: 'Award', title: richText('Our Heritage'), description: richText("Established 1956 — among India's oldest university computer centres, continually evolving to serve 74,000+ users across the DU ecosystem.") },
            ],
          },
          // Stats strip
          {
            blockType: 'statistics',
            layout: 'duccStrip',
            enableCountUp: true,
            stats: [
              { label: 'Active Users', numericValue: 74000, suffix: '+', icon: 'Users', iconColor: '#EAB308' },
              { label: 'Cloud Storage', numericValue: 84, suffix: ' TB', icon: 'Cloud', iconColor: '#EAB308' },
              { label: 'Network Nodes', numericValue: 15000, suffix: '+', icon: 'Network', iconColor: '#EAB308' },
              { label: 'Hosted Websites', numericValue: 180, suffix: '+', icon: 'Globe', iconColor: '#EAB308' },
              { label: 'Internet Bandwidth', numericValue: 10, suffix: ' Gbps', icon: 'Zap', iconColor: '#EAB308' },
              { label: 'MPLS Colleges', numericValue: 42, icon: 'School', iconColor: '#EAB308' },
            ],
          },
          // Objectives
          {
            blockType: 'featureCards',
            sectionHeading: "Building tomorrow's digital university",
            sectionDescription: 'Our objectives',
            headingAlignment: 'center',
            cardLayout: 'classic',
            cardTheme: 'light',
            showCardNumbers: true,
            columns: '3',
            cards: [
              { icon: 'Zap', title: richText('IT Automation Excellence'), description: richText('Set benchmarks in IT automation using industry best practices, driving efficiency and governance across all DU processes.') },
              { icon: 'Network', title: richText('Quality Network Services'), description: richText('Provide quality Network, Internet, and Software services to all stakeholders within the University ecosystem.') },
              { icon: 'Award', title: richText('Centre of Excellence (ITSM)'), description: richText('Serve as a Centre of Excellence in IT Service Management, setting the standard for University IT operations.') },
              { icon: 'GraduationCap', title: richText('Emerging Tech Training'), description: richText('Conduct training programmes on emerging technologies and software in ICT to build institutional capacity.') },
              { icon: 'Hexagon', title: richText('Nodal ICT Hub'), description: richText('Emerge as a nodal point for all ICT solutions — integrating digital infrastructure, e-governance, security and training under one roof.') },
            ],
          },
          // Director quote
          {
            blockType: 'testimonials',
            layout: 'duccQuote',
            items: [
              {
                quote: 'DUCC collaborates with University partners to advance teaching, learning, innovation and discovery — enabling a digitally empowered academic ecosystem at the University of Delhi.',
                name: 'Prof. Sanjeev Singh',
                role: 'Director, DUCC',
                initials: 'SS',
              },
            ],
          },
        ],
      } as any,
    })
    console.log('✅ About page created')
  } catch (e: any) {
    console.log('   About page:', e.message?.slice(0, 80))
  }

  // ═══════════════════════════════════════════
  // 11. IT SERVICES PAGE
  // ═══════════════════════════════════════════
  try {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'IT Services',
        slug: 'it-services',
        bannerEyebrow: 'IT SERVICES',
        bannerDescription: 'From email to enterprise-grade networking, from cloud storage to cybersecurity — DUCC delivers the complete IT stack powering Delhi University.',
        status: 'published',
        showInNav: true,
        navOrder: 3,
        layout: [
          // Service overview cards
          {
            blockType: 'featureCards',
            cardLayout: 'duccService',
            columns: '4',
            cards: [
              { icon: 'LayoutDashboard', title: richText('DU Samarth eGov'), description: richText('Open-source e-governance platform with 9 core modules and 40+ sub-modules.'), tag: 'Platform', link: '#samarth' },
              { icon: 'Mail', title: richText('Email & Google Workspace'), description: richText('74,000+ active email accounts with 84TB cloud storage, Meet, Drive, and Classroom.'), tag: 'Collaboration', link: '#email' },
              { icon: 'Wifi', title: richText('Wi-Fi & VPN Services'), description: richText('Campus-wide Wi-Fi 6 with 1,000+ access points, secure VPN at 250 Mbps per college.'), tag: 'Connectivity', link: '#wifi' },
              { icon: 'ShieldCheck', title: richText('Cyber Security'), description: richText('Comprehensive security framework, vulnerability management, and awareness programs.'), tag: 'Security', link: '#security' },
              { icon: 'Globe', title: richText('Web Hosting Services'), description: richText('Hosting 180+ departmental, college, hostel, and research websites under du.ac.in.'), tag: 'Hosting', link: '#webhosting' },
              { icon: 'FileCheck', title: richText('Plagiarism Detection'), description: richText('Turnitin and Drillbit licenses — 83,952 research papers checked for originality.'), tag: 'Research', link: '#plagiarism' },
              { icon: 'ShoppingCart', title: richText('GeM & e-Procurement'), description: richText('Single-point support for Government e-Marketplace across 129 departments.'), tag: 'Administration', link: '#gem' },
              { icon: 'Headphones', title: richText('IT Service Desk'), description: richText('Centralised helpdesk with web, email, and ticket-based query resolution.'), tag: 'Support', link: '#helpdesk' },
            ],
          },
          // Detailed alternating service sections
          {
            blockType: 'featureCards',
            cardLayout: 'duccServiceDetail',
            cards: [
              { icon: 'Mail', title: richText('Email & Google Workspace'), features: [{ text: '74,000+ active email accounts' }, { text: '84 TB+ cloud storage' }, { text: 'Google Meet, Drive, Classroom' }, { text: 'SSO integrated with Samarth' }], buttonLabel: 'Request Access', buttonUrl: '#' },
              { icon: 'Wifi', title: richText('Wi-Fi & VPN Services'), features: [{ text: '1,000+ Wi-Fi 6 access points' }, { text: '6,000+ concurrent daily users' }, { text: '250 Mbps VPN per college' }, { text: 'Single Sign-On across services' }], buttonLabel: 'Request Access', buttonUrl: '#' },
              { icon: 'ShieldCheck', title: richText('Cyber Security'), features: [{ text: 'Threat monitoring & response' }, { text: 'Faculty development programmes' }, { text: 'Incident response within 2 hrs' }, { text: 'Awareness sessions (Cyber Satarkata)' }], buttonLabel: 'Request Access', buttonUrl: '#' },
              { icon: 'Globe', title: richText('Web Hosting Services'), features: [{ text: '180+ hosted websites under du.ac.in' }, { text: 'Bilingual (English + Devanagari)' }, { text: 'Departmental & research sites' }, { text: 'Managed backups & uptime monitoring' }], buttonLabel: 'Request Access', buttonUrl: '#' },
              { icon: 'FileCheck', title: richText('Plagiarism Detection'), features: [{ text: 'Turnitin: 1,309 users, 33,750 submissions' }, { text: 'Drillbit: 1,650 users, 50,202 submissions' }, { text: '83,952 papers checked last year' }, { text: 'Integrated with Samarth workflows' }], buttonLabel: 'Request Access', buttonUrl: '#' },
              { icon: 'ShoppingCart', title: richText('GeM & e-Procurement'), features: [{ text: '704 GeM users across 129 departments' }, { text: '~550 e-Procurement users' }, { text: 'Integrated vendor management' }, { text: 'Compliance audit support' }], buttonLabel: 'Request Access', buttonUrl: '#' },
            ],
          },
        ],
      } as any,
    })
    console.log('✅ IT Services page created')
  } catch (e: any) {
    console.log('   IT Services page:', e.message?.slice(0, 80))
  }

  // ═══════════════════════════════════════════
  // 12. HELP & SUPPORT PAGE
  // ═══════════════════════════════════════════
  try {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Help and Support',
        slug: 'help-and-support',
        bannerEyebrow: 'HELP & SUPPORT',
        bannerDescription: 'Problems with Samarth, Wi-Fi, Trainings, Web hosting or Security? Our central IT Service Desk is here to help.',
        status: 'published',
        showInNav: true,
        navOrder: 6,
        layout: [
          // Support channel cards
          {
            blockType: 'featureCards',
            cardLayout: 'classic',
            cardTheme: 'light',
            columns: '3',
            cards: [
              { icon: 'MessageCircle', title: richText('Submit a Ticket'), description: richText('Raise a helpdesk ticket via our centralized portal for tracking and resolution.') },
              { icon: 'Mail', title: richText('Email Support'), description: richText('Reach the support team directly for any query or incident report.') },
              { icon: 'AlertTriangle', title: richText('Security Incident'), description: richText('Suspected breach? Disconnect and report immediately — response in under 2 hours.') },
            ],
          },
          // FAQ
          {
            blockType: 'faq',
            sectionHeading: 'Frequently asked questions',
            sectionDescription: 'FAQs',
            headingAlignment: 'center',
            layout: 'duccAccordion',
            items: [
              { question: 'How do I request a DU Wi-Fi account?', answer: richText('Submit a request through helpdesk.ducc.du.ac.in with your faculty/staff ID. Student accounts are automatically provisioned via the Samarth portal upon admission.') },
              { question: 'What is Samarth and how do I access it?', answer: richText("Samarth is DU's unified eGovernance platform. Students use slc.uod.ac.in and employees use du.samarth.ac.in. Use your DU credentials to log in.") },
              { question: 'How do I get my @du.ac.in email?', answer: richText('Employee emails are provisioned by your department IT coordinator. Student emails are created automatically after admission. Contact helpdesk@ducc.du.ac.in for issues.') },
              { question: 'How do I host my department/college website?', answer: richText('Write to helpdesk@ducc.du.ac.in with a brief scope, content owners, and expected traffic. DUCC will allocate subdomain under du.ac.in and provide hosting.') },
              { question: 'How do I request plagiarism detection access?', answer: richText('Turnitin and Drillbit access is provided to faculty and research scholars via your department administrator. Contact your PhD supervisor for onboarding.') },
              { question: 'Can I attend DUCC trainings as an external participant?', answer: richText('Most trainings are reserved for DU stakeholders. However, select FDP programmes open slots for partner institutions — check the Trainings page for schedules.') },
              { question: 'What do I do if I suspect a cybersecurity incident?', answer: richText("Immediately disconnect from the network and report via helpdesk.ducc.du.ac.in marking the ticket as URGENT-SECURITY. DUCC's incident response team will engage within 2 hours.") },
              { question: 'How do I request a new digital certificate or transcript?', answer: richText('Visit digicerti.du.ac.in, log in with your Samarth credentials, and submit the request. Digitally signed PDFs are issued within 3 working days.') },
            ],
          },
          // CTA
          {
            blockType: 'callToAction',
            layout: 'duccBanner',
            heading: 'Still need help?',
            description: 'Our central IT Service Desk provides front-line user support for all staff and students.',
            buttons: [
              { label: 'Email Helpdesk', url: 'mailto:helpdesk@ducc.du.ac.in', variant: 'primary' },
              { label: 'Visit DUCC', url: '/about', variant: 'outline' },
            ],
          },
        ],
      } as any,
    })
    console.log('✅ Help & Support page created')
  } catch (e: any) {
    console.log('   Help & Support page:', e.message?.slice(0, 80))
  }

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
