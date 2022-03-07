const { Router } = require("express");
const LoginController = require("../controllers/Login/LoginController");
const validateToken = require("../services/jwtValidateToken").validateToken;

const router = Router();

router.post("/login", LoginController.validateUser);
router.post("/refresh-token", validateToken, LoginController.refreshToken);
router.get("/access-token", validateToken, LoginController.accessToken);
router.post("/forgot-password", LoginController.forgotPasword);
router.post("/reset-password", LoginController.resetUserPassword);

module.exports = router;
