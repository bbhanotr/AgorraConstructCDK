const { Construct } = require('constructs');
const route53 = require('aws-cdk-lib/aws-route53');
const acm = require('aws-cdk-lib/aws-certificatemanager');
const cdk = require('aws-cdk-lib'); // Import the CDK module
require('dotenv').config();

class RouteConstructs extends Construct {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { hostedZone, subdomains } = props;
    const defaultIpAddress = process.env.DEFAULT_IP_ADDRESS || '127.0.0.1'; // Placeholder IP address

    subdomains.forEach(subdomain => {
      // Create an SSL certificate for the subdomain
      new acm.Certificate(this, `${subdomain}Cert`, {
        domainName: `${subdomain}.${hostedZone.zoneName}`,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      // Create the A record for the subdomain
      new route53.ARecord(this, `${subdomain}Record`, {
        zone: hostedZone,
        recordName: subdomain,
        target: route53.RecordTarget.fromIpAddresses(defaultIpAddress), // IP address
        ttl: cdk.Duration.minutes(5), // Set TTL
      });

      // Optionally, create a CNAME record
      new route53.CnameRecord(this, `${subdomain}CnameRecord`, {
        zone: hostedZone,
        recordName: `${subdomain}-www`,
        domainName: `${subdomain}.${hostedZone.zoneName}`,
      });
    });
  }
}

module.exports = { RouteConstructs };