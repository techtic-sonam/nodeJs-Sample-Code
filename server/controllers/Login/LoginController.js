const LoginService = require("../../services/LoginService/LoginService");
const Util = require("../../Utils");
const util = new Util();
var randomize = require("randomatic");
const jwt = require("jsonwebtoken");

class LoginController {
  static async validateUser(req, res) {
    try {
      if (!req.body.email || !req.body.password) {
        util.setError(400, "Invalid email or password. Please try again.");
        return util.send(res);
      } else {
        const email = `email = '${req.body.email}' and (is_deleted = 0 or is_deleted is null)`;
        const validUser = await LoginService.findOneUser(email);
        if (validUser.length > 0) {
          const hash = await LoginService.sha512Funtion(
            req.body.password,
            validUser[0].salt
          );
          if (hash === validUser[0].password) {
            // check whether given user is superAdmin or not
            const is_superAdmin = LoginService.IfSuperAdminEmail(
              req.body.email
            );
            validUser[0].is_superAdmin = is_superAdmin;
            // based on that need to pass that thing in create token api
            const token = await LoginService.createToken(validUser[0]);
            const response = await LoginService.addUserActivity(validUser[0]);
            const data = {
              token: token,
              user: {
                id: validUser[0].id,
                username: validUser[0].username,
                email: validUser[0].email,
                role: validUser[0].role,
                is_superAdmin: validUser[0].is_superAdmin,
                EmpLevel: validUser[0].EmpLevel,
                dlr_reg_number: validUser[0].dlr_reg_number
              }
            };
            util.setSuccess(200, "Logged In Successfully", data);
          } else {
            // Password is not correct
            // We record this attempt in the database
            const response = await LoginService.addLoginAttempts(validUser[0]);
            util.setError(401, "Invalid password. Please try again.");
          }
          return util.send(res);
        } else {
          util.setError(404, "No Record Found");
          return util.send(res);
        }
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async refreshToken(req, res) {
    try {
      if (!req.body.token) {
        util.setError(404, "No Token was Provided.");
        return util.send(res);
      } else {
        const decoded = jwt.decode(req.body.token, { complete: true });
        const payload = decoded["payload"];
        if (payload) {
          delete payload.iat;
          delete payload.exp;
        }
        const email = `email = ${payload.email}`;
        const user = await LoginService.findOne(email);
        const token = LoginService.createToken(user);
        const data = {
          refreshToken: token,
          user: user
        };
        util.setSuccess(200, "Refresh Token", data);
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async accessToken(req, res) {
    try {
      if (!req.query.token) {
        util.setError(404, "Please provide token.");
        return util.send(res);
      } else {
        req.query.id = req.decoded.user_id;
        const result = await LoginService.accessToken(req.query);
        if (result.user) {
          util.setSuccess(200, "Access Token", result);
        } else {
          util.setError(404, "No Record Found");
        }
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async forgotPasword(req, res) {
    try {
      const email = `email = '${req.body.email}'`;
      const user = await LoginService.findOneUser(email);
      if (user.length > 0) {
        req.body.token = user[0].salt;
        const response = await LoginService.sendForgotPasswordEmail(req.body);
        if (response) {
          util.setSuccess(
            200,
            "We have sent a reset password link mail to your registered email.",
            response
          );
        } else {
          util.setError(404, response);
        }
      } else {
        util.setError(404, "No Record Found");
      }
      return util.send(res);
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async resetUserPassword(req, res) {
    try {
      if (!req.body.salt || !req.body.new_password) {
        util.setError(
          400,
          "Salt or new password is empty. Please provide the same."
        );
        return util.send(res);
      } else {
        const salt = `salt = '${req.body.salt}'`;
        const user = await LoginService.findOne(salt);
        if (user.length > 0) {
          req.body.id = user[0].id;
          req.body.salt = randomize("Aa0", 128);
          req.body.password = await LoginService.sha512Funtion(
            req.body.new_password,
            req.body.salt
          );
          const response = await LoginService.resetPassword(req.body);
          if (response) {
            util.setSuccess(200, response);
            return util.send(res);
          }
        } else {
          util.setError(401, "URL for reset password has been expired.");
          return util.send(res);
        }
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }
}
module.exports = LoginController;
