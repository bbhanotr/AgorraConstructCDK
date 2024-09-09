const cdk = require('aws-cdk-lib');
const route53 = require('aws-cdk-lib/aws-route53');
const { Construct } = require('constructs');
const targets = require('aws-cdk-lib/aws-route53-targets');

class RouteConstructs extends Construct {
  constructor(scope, id, props) {
    super(scope, id);

    const { hostedZone, domainNames } = props;

    const albDnsName = cdk.Fn.importValue('ALBDNSName');
    const albHostedZoneId = cdk.Fn.importValue('ALBCanonicalHostedZoneID');

    const alb = {
      loadBalancerDnsName: albDnsName,
      loadBalancerCanonicalHostedZoneId: albHostedZoneId
    };

    if (!alb) {
      throw new Error('ALB must be provided to RouteConstructs');
    }

    domainNames.forEach(domainName => {
      new route53.ARecord(this, `${domainName.replace(/\./g, '-')}-AliasRecord`, {
        zone: hostedZone,
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget({
          loadBalancerDnsName: alb.loadBalancerDnsName,
          loadBalancerCanonicalHostedZoneId: alb.loadBalancerCanonicalHostedZoneId
        })),
      });
    });
  }
}

module.exports = { RouteConstructs };