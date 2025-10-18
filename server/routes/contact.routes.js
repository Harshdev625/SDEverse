const express = require("express");
const contactController = require( "../controllers/contact.controller");

const router = express.Router();

router.post("/", contactController.submitContactForm); // POST /api/contact
router.get("/", contactController.getAllContacts);     // GET /api/contact (admin route)
router.delete("/:id", contactController.deleteContactById);


module.exports = router;