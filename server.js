'use strict';

let express = require('express');

let router = express.Router();
router.route('/').get((req, res) => {
  res.sendFile('index.html', {root: './assets/'});
});

let app = express();
app.use('/', router);
app.use(express.static('public'))
app.listen(3000, () => { console.log(`Magick happens on port ${3000}!`); });
