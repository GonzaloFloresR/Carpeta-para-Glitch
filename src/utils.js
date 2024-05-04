const multer = require("multer");

const storage = multer.diskStorage({
    destination:(request, file, cb) => {
        cb(null, __dirname+'/public/img');
    },
    filename:(request, file, cb) => {
        cb(null, file.originalname);
    }
});

const uploader = multer({storage: storage});
module.exports = uploader;