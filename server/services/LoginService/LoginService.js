const database = require("../../src/models");
const config = require("dotenv").config();
const jwt = require("jsonwebtoken");
const mailService = require("../EmailService/EmailService");
const fs = require("fs");
var os = require("os");
os.tmpDir = os.tmpdir;
const crypto = require("crypto");
sha512 = require("js-sha512").sha512;
require("dotenv").config();

const LoginService = {
  async addLoginAttempts(user) {
    try {
      const date = new Date().getTime();
      return await database.sequelize
        .query(
          `INSERT INTO login_attempts (user_id, time) VALUES (${user.id}, ${date})`
        )
        .then(res => {
          return res[0];
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async addUserActivity(user) {
    try {
      return await database.sequelize
        .query(
          `INSERT INTO activity (member, lastenter) VALUES (${user.id}, CURRENT_TIMESTAMP)`
        )
        .then(res => {
          return res[0];
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async findOne(whereCondition) {
    try {
      return await database.sequelize
        .query(
          `select id, username, email, role from dbo.members where ${whereCondition}`
        )
        .then(res => {
          return res[0];
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async findOneUser(whereCondition) {
    try {
      return await database.sequelize
        .query(
          `select members.id, username, email, role, salt, members.password, dlr_reg_number, 
          ISNULL(EMPLOYEE.EmpLevel, 9) as EmpLevel from members 
		      left join EMPLOYEE on EMPLOYEE.EmailAddress = members.email
          left join TBLDEALERREGISTRATION on TBLDEALERREGISTRATION.DLRREGNUMBER = members.dlr_reg_number 
          and TBLDEALERREGISTRATION.DLRACTIVE = 1
          where ${whereCondition}`
        )
        .then(res => {
          return res[0];
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  IfSuperAdminEmail(email) {
    try {
      if (
        email === process.env.SUPERADMIN_EMAIL ||
        email === process.env.DEVELOPER_EMAIL
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  },

  createToken(user) {
    try {
      return jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          role: user.role,
          is_super_admin: user.is_superAdmin,
          dlr_reg_number: user.dlr_reg_number,
          emp_level: user.EmpLevel
        },
        config.parsed.JWT_SECRET,
        {
          expiresIn: "24h" // expires in 24 hours
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async accessToken(data) {
    let user = await database.sequelize
      .query(
        `select id, username, email, role, dlr_reg_number, legal_name, trade_name, business_name, reg_date, restore_key_expired from dbo.members where id = '${data.id}'`
      )
      .then(res => {
        return res[0][0];
      })
      .catch(err => {
        throw err;
      });
    return {
      token: data.token,
      user: user
    };
  },

  async updateMemberRepo(token, userId) {
    try {
      return await database.sequelize
        .query(`update dbo.members set salt = '${token}' where id = ${userId}`)
        .then(res => {
          return true;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async sendForgotPasswordEmail(data) {
    try {
      let context = fs.readFileSync(
        "./server/email-templates/forgot-password.html",
        "utf8"
      );
      const url = `http://23.92.29.196:3030/#/reset-password/${data.token}`;
      context = context.replace("{{ name }}", data.email.split("@")[0]);
      context = context.replace("{{ reset_password_url }}", url);
      context = context.replace("{{ APP_NAME }}", "VOS Motors");
      await mailService.sendMail(
        data.email,
        "Forgot Password Request",
        context
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(data) {
    try {
      return await database.sequelize
        .query(
          `update dbo.members set password = '${data.password}', salt = '${data.salt}' where id = ${data.id}`
        )
        .then(res => {
          return "Password changed successfully.";
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async sha512Funtion(password, salt) {
    const m2 = crypto.createHash("sha512");
    const hash = m2.update(password).digest("hex");
    var sha512_2 = sha512(hash + salt);
    return sha512_2;
  }
};

module.exports = LoginService;
