/**
 * Created by duongdx on 4/30/18.
 */
var http = require('http');
var https = require('https');
const ACCESS_TOKEN = process.env.SPEED_SMS_KEY;

exports.sendSMS = async function(phones, content, type, sender) {
  console.log(type, sender)
  var url = 'api.speedsms.vn';
  var params = JSON.stringify({
    to: phones,
    content: content,
    sms_type: type,
    sender: sender
  });
  console.log(params)

  var buf = new Buffer.from(ACCESS_TOKEN + ':x');
  var auth = "Basic " + buf.toString('base64');
  const options = {
    hostname: url,
    port: 443,
    path: '/index.php/sms/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    }
  };

  const req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(d) {
      body += d;
    });
    res.on('end', function() {
      var json = JSON.parse(body);
      if (json.status == 'success') {
        console.log("send sms success")
      }
      else {
        console.log("send sms failed " + body);
      }
    });
  });

  req.on('error', function(e) {
    console.log("send sms failed: " + e);
  });

  req.write(params);
  req.end();
}

//send test sms
//sendSMS(['your phone number'], "test ná»™i dung sms", 2, '');
