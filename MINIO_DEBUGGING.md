# MinIO Image Upload - Debugging Guide

## Issues & Solutions

### Issue 1: 403 Forbidden Error on PutObject

**Symptoms:**
- `Error uploading image: An error occurred (403) when calling the PutObject operation: Forbidden`
- Status Code 500 returned from `/api/gifts/{id}/upload-image/`

**Possible Causes:**

1. **Environment Variables Not Set in Vercel**
   - Check if `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` are configured
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Verify both variables are set correctly

2. **Incorrect Credentials**
   - MinIO admin credentials should work for all operations
   - If not working, try creating a specific MinIO user with S3 permissions

3. **Bucket Permissions**
   - The bucket might exist but with restricted permissions
   - Check MinIO console for bucket policies

4. **SSL Certificate Validation**
   - Self-signed certificates might still be causing issues
   - Current code uses `verify=False` which should disable validation
   - Check Vercel logs for `InsecureRequestWarning`

## Testing Steps

### 1. Test Locally (Development)

```bash
# From backend directory
export MINIO_ROOT_USER="your_user"
export MINIO_ROOT_PASSWORD="your_password"
export MINIO_ENDPOINT="https://minio-latest-2yx5.onrender.com"

python test_minio_connection.py
```

This will:
- ✓ Check if credentials are configured
- ✓ Connect to MinIO endpoint
- ✓ List available buckets
- ✓ Attempt to upload a test file
- ✓ Report any permission issues

### 2. Check Vercel Environment

1. Go to https://vercel.com/dashboard
2. Select project `cha-de-panela-api`
3. Click Settings → Environment Variables
4. Verify:
   - `MINIO_ENDPOINT` = `https://minio-latest-2yx5.onrender.com`
   - `MINIO_ROOT_USER` = Your admin user
   - `MINIO_ROOT_PASSWORD` = Your admin password
5. Redeploy (Force Redeploy) if you made changes

### 3. Check MinIO Server

1. Access MinIO Console: https://minio-latest-2yx5.onrender.com/minio
2. Check if server is running
3. Log in with admin credentials
4. Check if `gifts` bucket exists
5. Check bucket policies (should allow public read)

### 4. Check Vercel Logs

1. Go to Vercel Dashboard
2. Project: `cha-de-panela-api`
3. Click "Logs" tab
4. Run the upload again and look for:
   - `Error uploading image to MinIO:` messages
   - `MinIO client created successfully` (confirms init worked)
   - Full error stack trace

## Enhanced Error Messages

The latest deployment includes better error logging:
- Shows exact error code (403 = Permission Denied, 404 = Not Found, etc.)
- Shows full error message from MinIO
- Shows what credentials are being used
- Shows the endpoint and bucket being targeted

These messages will appear in Vercel Function Logs.

## Quick Checklist

- [ ] MinIO server running on Render
- [ ] Credentials set in Vercel environment variables
- [ ] `gifts` bucket exists in MinIO
- [ ] Bucket has public read policy
- [ ] MINIO_ROOT_USER has write permissions
- [ ] SSL verification disabled in boto3 client
- [ ] Image file provided in request
- [ ] Gift ID is valid UUID
- [ ] User owns the gift being updated

## Next Steps

1. **If 403 persists:**
   - Run `test_minio_connection.py` locally with your credentials
   - Check if issue is environment-specific
   - Verify bucket permissions in MinIO console

2. **If 404 (bucket not found):**
   - Check bucket name matches ("gifts")
   - MinIO will auto-create on first upload attempt
   - Check Vercel logs for creation messages

3. **If SSL errors:**
   - Current code has `verify=False` to disable SSL verification
   - Check urllib3 warnings in Vercel logs
   - These warnings can be safely ignored if request succeeds

4. **For production debugging:**
   - Check Vercel deployment logs
   - Look for "MinIO client created successfully" message
   - Search for specific error codes in logs (403, 404, 401, etc.)
