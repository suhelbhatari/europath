const express = require('express')
const router = express.Router()
const countriesCtrl = require('../controllers/countries')
const pathwaysCtrl = require('../controllers/pathways')
const compareCtrl = require('../controllers/compare')
const searchCtrl = require('../controllers/search')
const statsCtrl = require('../controllers/stats')

router.get('/countries', countriesCtrl.list)
router.get('/countries/:id', countriesCtrl.get)
router.get('/countries/:id/pathways', pathwaysCtrl.get)
router.get('/countries/:id/visas', pathwaysCtrl.visas)
router.get('/compare', compareCtrl.compare)
router.get('/search', searchCtrl.search)
router.get('/stats', statsCtrl.stats)

module.exports = router
