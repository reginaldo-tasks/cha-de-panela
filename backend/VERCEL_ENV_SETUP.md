# Vercel Environment Variables Setup - Critical for Database Migrations

## Problem
The database migrations are failing because **environment variables are not set in your Vercel project dashboard**. Without these variables, Django cannot connect to the PostgreSQL database during the build phase.

## Solution: Set Environment Variables in Vercel Dashboard

Follow these exact steps:

### Step 1: Go to Your Vercel Project
1. Open [vercel.com](https://vercel.com)
2. Log in to your account
3. Navigate to: **cha-de-panela-api** project
4. Click **Settings** tab

### Step 2: Add Environment Variables
In the **Settings → Environment Variables** section, add these variables:

```
Name: DB_NAME
Value: chapanela
```

```
Name: DB_USER
Value: chapanela_user
```

```
Name: DB_PASSWORD
Value: 0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC
```

```
Name: DB_HOST
Value: dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com
```

```
Name: DB_PORT
Value: 5432
```

```
Name: SECRET_KEY
Value: django-insecure-your-secret-key-here-change-this-random-string
```

```
Name: JWT_SECRET_KEY
Value: your-jwt-secret-key-here-change-this-random-string
```

```
Name: DEBUG
Value: False
```

```
Name: ALLOWED_HOSTS
Value: cha-de-panela-api.vercel.app,.vercel.app
```

```
Name: CORS_ORIGINS
Value: https://cha-de-panela-web.vercel.app
```

### Step 3: Important Environment Variable Details

- **DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT**: Your Render PostgreSQL credentials (provided above)
- **SECRET_KEY**: Generate a secure random key (at least 50 characters)
- **JWT_SECRET_KEY**: Generate another secure random key for JWT signing
- **DEBUG**: Set to `False` for production
- **ALLOWED_HOSTS**: Vercel domain + preview deployments
- **CORS_ORIGINS**: Your frontend URL(s)

### ⚠️ IMPORTANT: Generate Secure Keys

For **SECRET_KEY** and **JWT_SECRET_KEY**, use Python to generate secure random keys:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Run this command twice and paste the outputs as your SECRET_KEY and JWT_SECRET_KEY.

### Step 4: Trigger a Rebuild

After adding all environment variables:

1. Go to your Vercel project **Deployments** tab
2. Click the three-dot menu on the latest failed deployment
3. Select **Redeploy**
4. Watch the build logs to see migrations run

### Step 5: Verify Migrations Ran

After redeploy, check the Vercel logs:
- Should see: `✓ Database connection successful`
- Should see: `✓ Migrations completed successfully`
- Should see: `✓ Superuser created` (on first deployment)

### Step 6: Test the API

Once deployment succeeds with "Ready" status:

```bash
curl -X POST https://cha-de-panela-api.vercel.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "couple_name": "Test Couple"
  }'
```

Expected response: `201 Created` with JWT token

## Troubleshooting

### Build still fails with "relation X does not exist"
- ✓ Verify ALL 10 environment variables are set in Vercel dashboard
- ✓ Check Vercel logs for `Database connection failed` messages
- ✓ Render PostgreSQL must be accessible from Vercel IPs (usually allowed by default)

### Build times out
- The first build may take 2-3 minutes for migrations. This is normal.
- Check Vercel logs for progress

### "ProgrammingError: relation does not exist"
- This means migrations didn't apply during build
- Root cause: Missing environment variables
- Solution: Go back to Step 2 and verify ALL variables are set

## Database Connection Verification

Your Render PostgreSQL is accessible with:
```
Host: dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com
Port: 5432
Database: chapanela
User: chapanela_user
Password: 0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC
```

To test locally:
```bash
psql -h dpg-d770ol9aae7s73dilprg-a.oregon-postgres.render.com \
     -U chapanela_user \
     -d chapanela
```

When prompted, enter password: `0IYYYDFVS4CKmd8sL0VZCU7Fi9xeDRJC`

## Next Steps After Verify Success

1. Deploy frontend to separate Vercel project
2. Set frontend environment variable: `VITE_API_URL=https://cha-de-panela-api.vercel.app`
3. Test end-to-end integration (register → login → add gifts)

---

**⏱️ Expected Time**: 15-30 minutes from now
**Next Check**: Vercel dashboard → Deployments → Latest → See build logs for "✓ Migrations completed"
