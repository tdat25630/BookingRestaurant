const axios = require('axios');

exports.sendEsms = async ({ phone, code, requestId }) => {
  const apiKey = process.env.ESMS_API_KEY;
  const secretKey = process.env.ESMS_SECRET_KEY;
  const url = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

  const data = {
    ApiKey: apiKey,
    SecretKey: secretKey,
    Phone: phone,
    Content: `${code} la ma xac minh dang ky Baotrixemay cua ban`,
    Brandname: 'Baotrixemay',
    SmsType: '2',
    IsUnicode: '0',
    campaignid: 'dat ban',
    RequestId: requestId,
    CallbackUrl: 'https://esms.vn/webhook/'
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('SMS Sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
}
