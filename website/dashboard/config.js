// Filled in from the output of aws/dashboard/06-lambdas.sh.
// None of these are secrets — the app client is public and every call is
// authorised server-side by the JWT, never by knowing a URL.
const DASHBOARD_CONFIG = {
  region: 'ap-south-1',
  userPoolId: 'PASTE_USER_POOL_ID',
  clientId: 'PASTE_APP_CLIENT_ID',
  hostedUi: 'https://policyraj.auth.ap-south-1.amazoncognito.com',
  readUrl: 'PASTE_READ_FUNCTION_URL',
  saveUrl: 'PASTE_SAVE_FUNCTION_URL',
  adminUrl: 'PASTE_ADMIN_FUNCTION_URL',
  redirectPath: '/dashboard',
  maxUploadBytes: 10 * 1024 * 1024
};
