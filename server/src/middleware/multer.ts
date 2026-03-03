import multer, { diskStorage } from "multer"

const upload = multer({
    storage: diskStorage({}),
    limits: { fileSize: 104857600 }
})

export default upload