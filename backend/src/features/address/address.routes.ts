import express from "express";
import * as addressController from "./address.controller";

const router = express.Router();

// Public routes (no authentication required for address autocomplete)
router.get("/cities", addressController.searchCities);
router.get("/streets", addressController.searchStreets);
router.get("/postal-code", addressController.lookupPostalCode);

export default router;
