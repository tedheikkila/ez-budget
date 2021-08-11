const router = require("express").Router();
const path = require("path")

// gets homepage (index.html)
router.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../public/index.html'))
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router