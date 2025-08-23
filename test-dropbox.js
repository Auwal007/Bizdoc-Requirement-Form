// Quick test to check if Dropbox token is working
const { Dropbox } = require('dropbox');

// Get token from environment
require('dotenv').config({ path: '.env.local' });

const dbx = new Dropbox({ 
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch 
});

async function testDropboxConnection() {
  try {
    console.log('Testing Dropbox connection...');
    console.log('Token length:', process.env.DROPBOX_ACCESS_TOKEN?.length);
    console.log('Token starts with:', process.env.DROPBOX_ACCESS_TOKEN?.substring(0, 10));
    
    // Simple test - get account info
    const response = await dbx.usersGetCurrentAccount();
    console.log('✅ SUCCESS! Connected to Dropbox account:', response.result.name.display_name);
    console.log('Email:', response.result.email);
    
  } catch (error) {
    console.error('❌ FAILED! Dropbox connection error:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    
    if (error.status === 401) {
      console.log('\n🔧 SOLUTION: Your access token is invalid or expired');
      console.log('Please generate a new token at: https://www.dropbox.com/developers/apps');
    }
  }
}

testDropboxConnection();
