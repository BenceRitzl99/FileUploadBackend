const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, res, cb)=>{
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb)=>{
        const unique = Date.now() + '-'+ Math.round(Math.random() * 1E9);
        cb(null, unique + '-' + file.originalname);
    }
});

const upload = multer({storage:storage});


app.get('/', (req, res) => {
    return res.send(200).json({"message":"ok"});
})

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {return res.status(400).send("No file uploaded");
        
    }
    res.status(200).json({
        message: "File uploaded successfully",
        filename: req.file.filename,
        path: req.file.path
    })

    app.use('/uploads', express.static (UPLOAD_DIR));

})

app.get('/files', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) res.status(500).send("Unable to list files");
        res.status(200).json(files);
    })
})


app.delete('/files/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    fs.unlink(filePath, (err) => {
        if (err) res.status(500).send("Unable to delete file");
        res.status(204).json({message: "File deleted successfully"});
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})