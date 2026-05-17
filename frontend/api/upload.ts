import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Readable } from "stream";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const token = process.env.S3_READ_WRITE_TOKEN;
        if (!token) {
            console.error("[UPLOAD] S3_READ_WRITE_TOKEN not configured");
            return res
                .status(500)
                .json({ error: "S3_READ_WRITE_TOKEN not configured" });
        }

        // Read buffer from request
        let buffer: Buffer;

        if (Buffer.isBuffer(req.body)) {
            buffer = req.body;
        } else if (req.body instanceof ArrayBuffer) {
            buffer = Buffer.from(req.body);
        } else if (typeof req.body === "string") {
            buffer = Buffer.from(req.body, "utf-8");
        } else {
            // If req.body doesn't exist, read from stream
            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
                req.on("data", (chunk: Buffer) => chunks.push(chunk));
                req.on("end", () => resolve());
                req.on("error", reject);
            });
            buffer = Buffer.concat(chunks);
        }

        if (!buffer || buffer.length === 0) {
            console.error("[UPLOAD] No image data provided");
            return res.status(400).json({ error: "No image data provided" });
        }

        // Get gift_id from query or headers
        const giftId = req.query.gift_id || req.headers["x-gift-id"];
        const fileName = (req.headers["x-file-name"] as string) || "image.jpg";

        // Generate pathname
        const timestamp = Date.now();
        const pathname = giftId
            ? `gifts/${giftId}/${timestamp}-${fileName}`
            : `gifts/${timestamp}-${fileName}`;

        console.log(
            `[UPLOAD] Uploading to Vercel Blob: ${pathname}, size: ${buffer.length} bytes`
        );

        // Convert Buffer to Readable stream for Vercel Blob
        const readable = Readable.from(buffer);

        const blob = await put(pathname, readable, {
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
