// Filled in from the output of aws/dashboard/06-lambdas.sh.
// None of these are secrets — the app client is public and every call is
// authorised server-side by the JWT, never by knowing a URL.
const DASHBOARD_CONFIG = {
  region: 'ap-south-1',
  userPoolId: 'ap-south-1_b6QxqqrZG',
  clientId: '2injilo1qen4hua9ohvpcu4hpv',
  hostedUi: 'https://policyraj.auth.ap-south-1.amazoncognito.com',
  readUrl: 'https://kjocdsctgwjvqqlzyux7y6hoga0wwchs.lambda-url.ap-south-1.on.aws/',
  saveUrl: 'https://oqlv2xexczm6u6dhlpbjgrtlzm0zxpeg.lambda-url.ap-south-1.on.aws/',
  adminUrl: 'https://obmllvpt35g6xhynydnugl3piy0cnxoc.lambda-url.ap-south-1.on.aws/',
  redirectPath: '/dashboard',
  maxUploadBytes: 10 * 1024 * 1024
};
