import multer from "multer";
import path from "path";
import { sendResponse } from "../Utils/response.js";

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'))
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 10
  }
})


const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendResponse(res, 200, "File size too large. Maximum 5MB allowed.", null, 413, false)
    }
    return sendResponse(res, 200, err.message, null, 400, false)
  } else if (err) {
    return sendResponse(res, 200, err.message, null, 400, false)
  }
  next()
};

export { upload, handleMulterErrors }