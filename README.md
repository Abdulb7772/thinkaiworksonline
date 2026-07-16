# ThinkAIWorks Dashboard

## Backend Email Setup

Transactional emails use [Resend](https://resend.com).

1. **Install dependencies** — already done: `npm install resend` in `backend/`
2. **Create a Resend account** at https://resend.com
3. **Add your API key** to `backend/.env`: `RESEND_API_KEY=re_...`
4. **Set the sender address** in `backend/.env`: `EMAIL_FROM=noreply@yourdomain.com`
5. **Verify your sending domain** in the Resend dashboard
6. **Restart the backend**

Never commit real API keys.
