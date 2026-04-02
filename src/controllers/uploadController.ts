import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure local storage
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const timestamp = Date.now();
    const originalName = file.originalname.split('.')[0];
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}-${timestamp}${extension}`);
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 files
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

export const uploadController = {
  // Upload single image
  uploadSingle: async (req: Request, res: Response) => {
    try {
      const singleUpload = upload.single('image');

      singleUpload(req, res, async (err: any) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 10MB.',
              });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 5 files.',
              });
            }
          }
          return res.status(400).json({
            success: false,
            error: err.message || 'File upload failed',
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded',
          });
        }

        try {
          // Create public URL (in production, this would be your domain)
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
          
          res.status(201).json({
            success: true,
            data: {
              url: fileUrl,
              filename: req.file.filename,
              originalName: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
            },
            message: 'File uploaded successfully',
          });
        } catch (uploadError: any) {
          res.status(500).json({
            success: false,
            error: uploadError.message || 'Failed to process uploaded file',
          });
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed',
      });
    }
  },

  // Upload multiple images
  uploadMultiple: async (req: Request, res: Response) => {
    try {
      const multipleUpload = upload.array('images', 5);

      multipleUpload(req, res, async (err: any) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 10MB.',
              });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 5 files.',
              });
            }
          }
          return res.status(400).json({
            success: false,
            error: err.message || 'File upload failed',
          });
        }

        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No files uploaded',
          });
        }

        try {
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          const uploadedFiles = files.map((file: Express.Multer.File) => ({
            url: `${baseUrl}/uploads/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          }));

          res.status(201).json({
            success: true,
            data: uploadedFiles,
            message: `${files.length} files uploaded successfully`,
          });
        } catch (uploadError: any) {
          res.status(500).json({
            success: false,
            error: uploadError.message || 'Failed to process uploaded files',
          });
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed',
      });
    }
  },

  // Delete uploaded file
  deleteFile: async (req: Request, res: Response) => {
    try {
      const { filename } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          error: 'Filename is required',
        });
      }

      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      try {
        await fs.unlink(filePath);
        res.json({
          success: true,
          message: 'File deleted successfully',
        });
      } catch (deleteError: any) {
        if (deleteError.code === 'ENOENT') {
          res.status(404).json({
            success: false,
            error: 'File not found',
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to delete file',
          });
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete file',
      });
    }
  },

  // Get file info
  getFileInfo: async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({
          success: false,
          error: 'Filename is required',
        });
      }

      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      try {
        const stats = await fs.stat(filePath);
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        
        res.json({
          success: true,
          data: {
            url: `${baseUrl}/uploads/${filename}`,
            filename: filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          },
        });
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          res.status(404).json({
            success: false,
            error: 'File not found',
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to fetch file info',
          });
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch file info',
      });
    }
  },

  // Upload middleware for use in other routes
  uploadSingleMiddleware: upload.single('image'),
  uploadMultipleMiddleware: upload.array('images', 5),
};
