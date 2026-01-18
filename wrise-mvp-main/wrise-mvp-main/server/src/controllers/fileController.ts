import { Request, Response } from "express";
import { supabase } from "../services/supabaseService";
import prisma from "../lib/prisma";
import pdfParse from "pdf-parse";
import fileUpload from "express-fileupload";
import { ingest } from "../lib/ingestEmbeddings";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.files?.file as fileUpload.UploadedFile;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!file.mimetype.includes("pdf")) {
      res.status(400).json({ error: "Only PDF files are supported" });
      return;
    }

    const storagePath = `${Date.now()}-${file.name}`;

    // Upload PDF to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from("uploads")
      .upload(storagePath, file.data, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from("uploads")
      .getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Extract text from PDF
    const pdfData = await pdfParse(file.data);
    const extractedText = pdfData.text;

    // Get user ID from headers (sent from frontend)
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      res.status(400).json({ error: "Missing user ID" });
      return;
    }
    
    // Upsert user using a hardcoded unique email for testing
    await prisma.authUser.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `test+${userId}@wrise.dev`,
        name: "Test User",      
        isCreator: true,       
        subscriberCount: 0,
        revenue: 0,
      },
    });

    // Store content record
     const content= await prisma.content.create({
      data: {
        userId: userId,
        sourceType: "pdf",
        transcript: extractedText,
        title: file.name,
        comment: "Uploaded PDF",
      },
    });

    await ingest(content.contentId); //added ingest here to process the uploaded PDF automatically

    res.json({
      message: "Upload and DB insert successful",
      fileUrl: publicUrl,
    });

  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({
      error: "Upload failed",
      details: (error as any).message,
    });
  }
};
