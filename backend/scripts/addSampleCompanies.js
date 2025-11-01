// Load environment variables first
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

console.log('🔍 Environment variables:');
console.log('MYSQL_URL:', process.env.MYSQL_URL || process.env.DATABASE_URL);
console.log('MYSQL_DB_NAME:', process.env.MYSQL_DATABASE || process.env.MYSQL_DB_NAME || 'megajob_db');

const { connectToMySQL, getDB } = require('../config/db');

const sampleCompanies = [
  {
    name: 'TechVision Nepal',
    description: 'Leading software development company in Nepal specializing in web and mobile applications. We are committed to excellence in technology and delivering world-class solutions.',
    industry: 'Information Technology',
    location: 'Kathmandu, Nepal',
    website: 'https://techvision.com.np',
    company_size: '51-200',
    logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop',
    founded_year: 2018,
    contact_email: 'careers@techvision.com.np',
    contact_phone: '+977-1-4567890',
    is_featured: true,
    is_top_hiring: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Himalayan Fintech',
    description: 'Revolutionary fintech company transforming digital payments and banking solutions across Nepal. We bridge traditional banking with modern technology.',
    industry: 'Financial Technology',
    location: 'Pokhara, Nepal',
    website: 'https://himalayanfintech.com',
    company_size: '11-50',
    logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
    founded_year: 2020,
    contact_email: 'jobs@himalayanfintech.com',
    contact_phone: '+977-61-123456',
    is_featured: true,
    is_top_hiring: false,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Everest Digital Marketing',
    description: 'Full-service digital marketing agency helping businesses grow their online presence. We specialize in SEO, social media marketing, and content creation.',
    industry: 'Digital Marketing',
    location: 'Lalitpur, Nepal',
    website: 'https://everestdigital.com.np',
    company_size: '11-50',
    logo_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
    founded_year: 2019,
    contact_email: 'careers@everestdigital.com.np',
    contact_phone: '+977-1-9876543',
    is_featured: false,
    is_top_hiring: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Nepal Healthcare Solutions',
    description: 'Innovative healthcare technology company developing solutions for hospitals and clinics. We focus on improving patient care through technology.',
    industry: 'Healthcare Technology',
    location: 'Bharatpur, Nepal',
    website: 'https://nepalhealthcare.com',
    company_size: '201-500',
    logo_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=200&fit=crop',
    founded_year: 2017,
    contact_email: 'hr@nepalhealthcare.com',
    contact_phone: '+977-56-789012',
    is_featured: true,
    is_top_hiring: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Mountain View Consulting',
    description: 'Strategic business consulting firm helping companies optimize their operations and achieve sustainable growth. We provide expert advice across various industries.',
    industry: 'Business Consulting',
    location: 'Biratnagar, Nepal',
    website: 'https://mountainviewconsulting.com.np',
    company_size: '11-50',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
    founded_year: 2016,
    contact_email: 'careers@mountainviewconsulting.com.np',
    contact_phone: '+977-21-345678',
    is_featured: false,
    is_top_hiring: false,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Annapurna E-commerce',
    description: 'Leading e-commerce platform connecting local businesses with customers across Nepal. We empower small businesses to reach wider markets.',
    industry: 'E-commerce',
    location: 'Butwal, Nepal',
    website: 'https://annapurnaecommerce.com',
    company_size: '51-200',
    logo_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
    founded_year: 2021,
    contact_email: 'jobs@annapurnaecommerce.com',
    contact_phone: '+977-71-234567',
    is_featured: true,
    is_top_hiring: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Sherpa Education Tech',
    description: 'EdTech company revolutionizing education in Nepal through innovative learning platforms and digital tools for students and teachers.',
    industry: 'Education Technology',
    location: 'Dharan, Nepal',
    website: 'https://sherpaedutech.com',
    company_size: '11-50',
    logo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop',
    founded_year: 2022,
    contact_email: 'careers@sherpaedutech.com',
    contact_phone: '+977-25-987654',
    is_featured: false,
    is_top_hiring: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Kathmandu Creative Agency',
    description: 'Award-winning creative agency specializing in branding, graphic design, and advertising. We help brands tell their stories through compelling visuals.',
    industry: 'Creative & Design',
    location: 'Kathmandu, Nepal',
    website: 'https://ktmcreative.com',
    company_size: '11-50',
    logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop',
    founded_year: 2015,
    contact_email: 'hello@ktmcreative.com',
    contact_phone: '+977-1-5555555',
    is_featured: false,
    is_top_hiring: false,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function addSampleCompanies() {
  try {
    console.log('🔗 Connecting to MySQL...');
    await connectToMySQL();
    const db = getDB();
    console.log('📊 Connected to database');

    // Check if companies already exist
    const existingCompanies = await db.collection('companies').countDocuments();
    console.log(`📈 Found ${existingCompanies} existing companies`);

    if (existingCompanies > 0) {
      console.log('⚠️  Companies already exist. Skipping insertion to avoid duplicates.');
      console.log('💡 If you want to reset, please clear the companies collection first.');
      process.exit(0);
      return;
    }

    // Insert sample companies
    console.log('📝 Inserting sample companies...');
    let insertedCount = 0;
    for (const company of sampleCompanies) {
      const res = await db.collection('companies').insertOne(company);
      if (res.insertedId) insertedCount++;
    }
    console.log(`✅ Successfully inserted ${insertedCount} companies`);
    console.log('🎉 Sample companies added to database!');
    
    // List inserted companies
    console.log('\n📋 Inserted companies:');
    sampleCompanies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (${company.industry})`);
    });
  } catch (error) {
    console.error('❌ Error adding sample companies:', error);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
}

// Run the script
addSampleCompanies();