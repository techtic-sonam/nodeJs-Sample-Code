const { Router } = require("express");
const DealController = require("../controllers/Deal/DealController");
const validateToken = require("../services/jwtValidateToken").validateToken;
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `${__dirname}/../../uploads/`);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.get(
  "/dealerDeals",
  validateToken,
  DealController.ShowAllDealsBasedOnDealerId
);
router.get("/dealNotes", validateToken, DealController.getDealNotes);
router.get(
  "/internalorExternaldealNotes",
  validateToken,
  DealController.getInternalNotes
);
router.post("/addDealNotes", validateToken, DealController.addDealNotes);
router.get("/yearList", DealController.getYearsForVehicles);
router.get("/makeList", DealController.getMakesBasedOnYear);
router.get("/modelList", DealController.getModelsBasedOnMakeAndYear);
router.get("/trimList", DealController.getTrimsBasedOnMakeYearModel);
router.get("/cityList", DealController.getCitiesForProvince);
router.post("/addCosigner", validateToken, DealController.addCosignerToDeals);
router.post("/addCreditFrom", validateToken, DealController.addCosignerToDeals);
router.post(
  "/addCreditFromwithoutLogin/:dlrregnumber",
  DealController.addCosignerToDeals
);
router.get("/APFormData", validateToken, DealController.getAPFormInfo);
router.post(
  "/updateDataforAPform",
  validateToken,
  DealController.updateApprovedForm
);
router.post(
  "/uploadFiles",
  validateToken,
  upload.any(),
  DealController.uploadFilesInGoogelDrive
);
router.get("/uploadFilesType", validateToken, DealController.uploadFilesType);
router.get(
  "/uploadedFiles",
  validateToken,
  DealController.getListOfUploadedFiles
);

module.exports = router;
