import { put } from "@vercel/blob";

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.error("[UPLOAD] BLOB_READ_WRITE_TOKEN not configured");
            return res
                .status(500)
                .json({ error: "BLOB_READ_WRITE_TOKEN not configured" });
        }

        // Get image buffer from request body
        const buffer = req.body;
        if (!buffer || buffer.length === 0) {
            return res.status(400).json({ error: "No image data provided" });
        }

        // Get gift_id from query or headers
        const giftId = req.query.gift_id || req.headers["x-gift-id"];
        const fileName = req.headers["x-file-name"] || "image.jpg";

        // Generate pathname
        const timestamp = Date.now();
        const pathname = giftId
            ? `gifts/${giftId}/${timestamp}-${fileName}`
            : `gifts/${timestamp}-${fileName}`;

        console.log(
            `[UPLOAD] Uploading to Vercel Blob: ${pathname}, size: ${buffer.length} bytes`
        );

        // Upload to Vercel Blob
        const blob = await put(pathname, buffer, {
            access: "public",
            token: token,
        });

        console.log(`[UPLOAD] Success: ${blob.url}`);

        return res.status(200).json({
            url: blob.url,
            pathname: blob.pathname,
        });
    } catch (error: any) {
        console.error("[UPLOAD] Error:", error);
        return res.status(500).json({
            error: "Upload failed",
            details: error.message || "Unknown error",
        });
    }
}
