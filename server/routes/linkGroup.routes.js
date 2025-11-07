const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addLink,
  updateLink,
  removeLink,
  shareGroup,
  unshareGroup,
  getGroupsSharedWithMe,
} = require('../controllers/linkGroup.controller');

router.post('/', protect, createGroup);
router.get('/my', protect, getMyGroups);
router.get('/:id', getGroupById); // allow public access depending on privacy inside controller
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);

// link management
router.post('/:id/links', protect, addLink);
router.put('/:id/links/:linkId', protect, updateLink);
router.delete('/:id/links/:linkId', protect, removeLink);

// sharing
router.get('/shared', protect, getGroupsSharedWithMe);
router.post('/:id/share', protect, shareGroup);
router.delete('/:id/share/:userId', protect, unshareGroup);

module.exports = router;
