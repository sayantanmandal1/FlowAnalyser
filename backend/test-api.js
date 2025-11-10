import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing Analytics API...\n');
    
    // Test stats endpoint
    const statsResponse = await fetch('http://localhost:5000/api/analytics/stats');
    const stats = await statsResponse.json();
    
    console.log('📊 Stats:', JSON.stringify(stats, null, 2));
    
    // Test vendors endpoint
    const vendorsResponse = await fetch('http://localhost:5000/api/analytics/vendors/top10');
    const vendors = await vendorsResponse.json();
    
    console.log('\n👥 Top Vendors:', JSON.stringify(vendors, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testAPI();