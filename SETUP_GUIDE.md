# Ecommerce Store Setup Guide

Congratulations on building your complete Vanilla JS Ecommerce Store! Follow these final steps to get your backend functions deployed and your website live.

## 1. Supabase Edge Functions Deployment

You need to deploy the two edge functions (`create-razorpay-order` and `verify-payment`) to your Supabase project and set the secure environment variables.

### Prerequisites
Make sure you have the Supabase CLI installed on your computer. 
If not, you can install it via npm or Chocolatey (Windows):
`npm install -g supabase` or `choco install supabase`

### Deployment Steps
Run these commands in your project folder (`C:\Users\amrit\.gemini\antigravity\scratch\ecommerce-store`):

1. **Login to Supabase CLI:**
   ```bash
   supabase login
   ```
   (Create an access token from your Supabase Dashboard -> Access Tokens and paste it in).

2. **Initialize the local project (if not done already):**
   ```bash
   supabase init
   ```

3. **Link your Supabase Project:**
   ```bash
   supabase link --project-ref uxjghsgpnkivfowwyzuo
   ```
   (You will need your database password for this step).

4. **Set the secure environment variables:**
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_ShFueUhy0O9Z3K
   supabase secrets set RAZORPAY_KEY_SECRET=eFCuhw70eYitoI84iqynqYvl
   supabase secrets set SUPABASE_URL=https://uxjghsgpnkivfowwyzuo.supabase.co
   ```
   *(Note: You will also need to add your `SUPABASE_SERVICE_ROLE_KEY` which you can find in Project Settings -> API in your Supabase Dashboard)*:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

5. **Deploy the Edge Functions:**
   ```bash
   supabase functions deploy create-razorpay-order --no-verify-jwt
   supabase functions deploy verify-payment --no-verify-jwt
   ```

## 2. GitHub Pages Deployment (Frontend)

You have already pushed your code to GitHub! Now let's make it live:

1. Go to your repository on GitHub: `https://github.com/mohitasdeveloper/ECommerce`
2. Click on **Settings** (top tab).
3. On the left sidebar, click on **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the **`main`** branch and the **`/ (root)`** folder, then click **Save**.
6. Wait 1-2 minutes. Your live site URL will appear at the top of the Pages settings!

## 3. Razorpay Webhook (Optional but Recommended)

For maximum reliability, you should set up a Razorpay Webhook to update order statuses automatically if the user closes the browser before the frontend completes the transaction.

1. Go to your Razorpay Dashboard -> **Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL:** `https://uxjghsgpnkivfowwyzuo.supabase.co/functions/v1/verify-payment`
4. **Active Events:** Select `payment.captured` and `order.paid`.
5. Save the webhook!

## You're all set! 🚀
You can now visit your live GitHub Pages URL, test the checkout flow using Razorpay's test mode (use any test card), and manage your products via the `/admin` path.
