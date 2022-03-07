const database = require("../../src/models");
const mailService = require("../EmailService/EmailService");
const DealerService = require("../DealerService/DealerService");

const DealService = {
  async getDealList(data, starting_page) {
    try {
      let dates = ``;
      if (data.startDate && data.endDate) {
        data.startDate = this.formatDate(data.startDate);
        data.endDate = this.formatDate(data.endDate);
        dates = ` (APPLICATIONDATE IS NULL OR (CAST(ApplicationDate as DATE) BETWEEN '${data.startDate}' and '${data.endDate}'))`;
      } else if (data.startDate) {
        dates = ` (TBLDEALWORKSHEET.APPLICATIONDATE IS NULL OR 
          (TBLDealWorksheet.ApplicationDate >= ${data.startDate}))`;
      } else if (data.endDate) {
        dates = ` (TBLDEALWORKSHEET.APPLICATIONDATE IS NULL OR 
          (TBLDealWorksheet.ApplicationDate <= ${data.endDate}))`;
      }
      if (dates) {
        dates = ` and ${dates}`;
      }
      let filter = ``;
      if (data.filter) {
        filter = ` and (DealIDNumber like '%${data.filter}%' or DealStatus like '%${data.filter}%' or 
        PurchasePrice like '%${data.filter}%' or Deposit like '%${data.filter}%' or CustLastName like '%${data.filter}%'
        or TBLCustomerInfo.CustomerIDNumber like '%${data.filter}%' or CustFirstName like '%${data.filter}%' or 
        CustEmailAddress like '%${data.filter}%' or VehicleYear like '%${data.filter}%' or 
        VehicleMake like '%${data.filter}%' or VehicleModel like '%${data.filter}%' or 
        VehicleTrim like '%${data.filter}%' or ApplicationDate like '%${data.filter}%')`;
      }
      return await database.sequelize
        .query(
          `SELECT DealIDNumber, FinalStatus, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue,
          (Deposit + TotalDownpayment + TradeinTrueValue) AS DownpaymentSum, CustCojoIDNumber, CustLastName,
          CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, VehicleIDNumber,FNDRecCA, FNDRecBOS,
          COUNT(TBDDealNotes.DealNoteID) AS UnreadNotesCount
          FROM TBLDealWorksheet
          LEFT JOIN TBLCustomerInfo ON TBLCustomerInfo.CustomerIDNumber = TBLDealWorksheet.CustomerIDNumber
          LEFT JOIN TBLFUNDINGCHECKLIST ON TBLFUNDINGCHECKLIST.DEALNUMBER = TBLDEALWORKSHEET.DEALIDNUMBER
          LEFT JOIN TBDDealNotes ON TBDDealNotes.DealNumber = TBLDealWorksheet.DealIDNumber AND TBDDealNotes.Processed = 0
          WHERE DLRRegNumber = ${data.dlrregnumber} ${dates} ${filter}
          GROUP BY DealIDNumber, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue,
          CustCojoIDNumber, CustLastName, CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, VehicleIDNumber, FinalStatus, FndRecCA, FNDRecBOS
          ORDER BY ${data.name} ${data.direction}
          OFFSET ${starting_page} ROWS
          FETCH NEXT ${data.limit} ROWS ONLY`
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

  async getTotalDealList(data) {
    try {
      let dates = ``;
      if (data.startDate && data.endDate) {
        data.startDate = this.formatDate(data.startDate);
        data.endDate = this.formatDate(data.endDate);
        dates = ` (APPLICATIONDATE IS NULL OR (CAST(ApplicationDate as DATE) BETWEEN '${data.startDate}' and '${data.endDate}'))`;
      } else if (data.startDate) {
        dates = ` (TBLDEALWORKSHEET.APPLICATIONDATE IS NULL OR 
          (TBLDealWorksheet.ApplicationDate >= ${data.startDate}))`;
      } else if (data.endDate) {
        dates = ` (TBLDEALWORKSHEET.APPLICATIONDATE IS NULL OR 
          (TBLDealWorksheet.ApplicationDate <= ${data.endDate}))`;
      }
      if (dates) {
        dates = ` and ${dates}`;
      }
      let filter = ``;
      if (data.filter) {
        filter = ` and (DealIDNumber like '%${data.filter}%' or DealStatus like '%${data.filter}%' or 
        PurchasePrice like '%${data.filter}%' or Deposit like '%${data.filter}%' or CustLastName like '%${data.filter}%'
        or TBLCustomerInfo.CustomerIDNumber like '%${data.filter}%' or CustFirstName like '%${data.filter}%' or 
        CustEmailAddress like '%${data.filter}%' or VehicleYear like '%${data.filter}%' or 
        VehicleMake like '%${data.filter}%' or VehicleModel like '%${data.filter}%' or 
        VehicleTrim like '%${data.filter}%' or ApplicationDate like '%${data.filter}%')`;
      }
      return await database.sequelize
        .query(
          `SELECT DealIDNumber, FinalStatus, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue,
          (Deposit + TotalDownpayment + TradeinTrueValue) AS DownpaymentSum, CustCojoIDNumber, CustLastName,
          CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, VehicleIDNumber,FNDRecCA, FNDRecBOS,
          COUNT(TBDDealNotes.DealNoteID) AS UnreadNotesCount
          FROM TBLDealWorksheet
          LEFT JOIN TBLCustomerInfo ON TBLCustomerInfo.CustomerIDNumber = TBLDealWorksheet.CustomerIDNumber
          LEFT JOIN TBLFUNDINGCHECKLIST ON TBLFUNDINGCHECKLIST.DEALNUMBER = TBLDEALWORKSHEET.DEALIDNUMBER
          LEFT JOIN TBDDealNotes ON TBDDealNotes.DealNumber = TBLDealWorksheet.DealIDNumber AND TBDDealNotes.Processed = 0
          WHERE DLRRegNumber = ${data.dlrregnumber} ${dates} ${filter} and CUSTFIRSTNAME not like '%_Select%'
          GROUP BY DealIDNumber, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue,
          CustCojoIDNumber, CustLastName, CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, VehicleIDNumber, FinalStatus, FndRecCA, FNDRecBOS`
        )
        .then(res => {
          return res[0].length;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async getAllDealsForSuperAdmin(data, starting_page) {
    try {
      let rep_email_cond = ``;
      let closedDealCondition = ``;
      let datelast = ``;
      let searchCondition = ``;
      if (data.role == "rep" && !data.is_superAdmin) {
        rep_email_cond = ` AND DLRRepEmail = ${data.email}`;
      }
      if (!data.showClosedDeals) {
        closedDealCondition =
          "AND NOT ((tbldealworksheet.dealstatus = 6 AND tbldealworksheet.finalstatus = 0) OR (tbldealworksheet.finalstatus != 0)) ";
      }
      if (data.startDate && data.endDate) {
        data.startDate = this.formatDate(data.startDate);
        data.endDate = this.formatDate(data.endDate);
        datelast = `AND (APPLICATIONDATE IS NULL OR (CAST(ApplicationDate as DATE) BETWEEN '${data.startDate}' and '${data.endDate}'))`;
      }
      if (data.filter && data.filter !== "") {
        searchCondition = `AND DealIDNumber like '%${data.filter}%' or CustFirstName like '%${data.filter}%' or CustLastName like '%${data.filter}%'`;
      } else {
        searchCondition = ``;
      }
      return await database.sequelize
        .query(
          `SELECT DealIDNumber, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue, 
          (Deposit+TotalDownpayment+TradeinTrueValue) AS DownpaymentSum, TBLDealWorksheet.CustomerIDNumber, TBLDEalWorksheet.CustCojoidnumber as CustCojoIDNumber,
          CustLastName, CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, 
          TBLDealerRegistration.DLRDoingBusinessas, TBLDealerRegistration.DLRRegNumber, FinalStatus,
          COUNT(TBDDealNotes.DEALNOTEID) AS UnreadNotesCount
          FROM TBLDealWorksheet
          LEFT JOIN TBLCustomerInfo ON TBLDealWorksheet.CustomerIDNumber = TBLCustomerInfo.CustomerIDNumber
          LEFT JOIN TBLDealerRegistration ON TBLDealWorksheet.DLRRegNumber = TBLDealerRegistration.DLRRegNumber
          LEFT JOIN TBDDealNotes ON TBDDealNotes.DealNumber = TBLDealWorksheet.DealIDNumber AND TBDDealNotes.Processed=0
          WHERE TBLDealWorksheet.DLRRegNumber IS NOT NULL and CUSTFIRSTNAME not like '%_Select%'
          ${closedDealCondition} ${rep_email_cond} ${datelast} ${searchCondition}
          AND TBLDealWorksheet.DLRRegNumber != 9876543
          GROUP BY DealIDNumber, ApplicationDate, DealStatus, PurchasePrice, Deposit, TotalDownpayment, TradeinTrueValue,
          TBLDealWorksheet.CustomerIDNumber, CustLastName, CustFirstName, CustEmailAddress, VehicleYear, VehicleMake, CustCojoidnumber,
          VehicleModel, VehicleTrim, TBLDealerRegistration.DLRDoingBusinessas, TBLDealerRegistration.DLRRegNumber, FinalStatus
          ORDER BY ${data.name} ${data.direction}
          OFFSET ${starting_page} ROWS
          FETCH NEXT ${data.limit} ROWS ONLY`
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

  async getTotalDealsForSuperAdmin(data) {
    try {
      let rep_email_cond = ``;
      let closedDealCondition = ``;
      let datelast = ``;
      let searchCondition = ``;
      if (data.role == "rep" && !data.is_superAdmin) {
        rep_email_cond = ` AND DLRRepEmail = ${data.email}`;
      }
      if (!data.showClosedDeals) {
        closedDealCondition =
          "AND NOT ((tbldealworksheet.dealstatus = 6 AND tbldealworksheet.finalstatus = 0) OR (tbldealworksheet.finalstatus != 0)) ";
      }
      if (data.startDate && data.endDate) {
        data.startDate = this.formatDate(data.startDate);
        data.endDate = this.formatDate(data.endDate);
        datelast = ` and (APPLICATIONDATE IS NULL OR (CAST(ApplicationDate as DATE) BETWEEN '${data.startDate}' and '${data.endDate}'))`;
      }
      if (data.filter && data.filter !== "") {
        searchCondition = `AND DealIDNumber like '%${data.filter}%' or CustFirstName like '%${data.filter}%' or CustLastName like '%${data.filter}%'`;
      }
      return await database.sequelize
        .query(
          `SELECT count(*) as tot_count
          FROM TBLDealWorksheet
          LEFT JOIN TBLCustomerInfo ON TBLDealWorksheet.CustomerIDNumber = TBLCustomerInfo.CustomerIDNumber
          WHERE TBLDealWorksheet.DLRRegNumber IS NOT NULL
          ${closedDealCondition} ${rep_email_cond} ${datelast} ${searchCondition}
          AND TBLDealWorksheet.DLRRegNumber != 9876543`
        )
        .then(res => {
          return res[0][0].tot_count;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async checkifDealExists(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT * FROM TBLDEALWORKSHEET WHERE DEALIDNUMBER = ${data.DealNumber}`
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

  async getDealNotesByDealId(data, starting_page) {
    try {
      return await database.sequelize
        .query(
          `SELECT * FROM TBDDealNotes WHERE DEALNUMBER = ${data.DealNumber}
          order by NOTEINFO desc
          OFFSET ${starting_page} ROWS
        FETCH NEXT ${data.limit} ROWS ONLY`
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

  async getTotalDealNotesByDealId(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT count(*) as tot_count FROM TBDDealNotes WHERE DEALNUMBER = ${data.DealNumber}`
        )
        .then(res => {
          return res[0][0].tot_count;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async getListOfInternalNotes(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT * FROM TBDDealNotes WHERE INTERNALONLY = ${data.isInternal} and DealNumber = ${data.DealNumber}`
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

  async addNotesToDeal(data) {
    try {
      return await database.sequelize
        .query(
          `insert into TBDDealNotes(DEALNUMBER, UPDATEDATE, NOTEINFO, PERSON, INTERNALONLY, Processed, 
            EmailSent, TextSent) values (${data.DealNumber}, GETDATE(), '${
            data.note
          }', '${data.email.split("@")[0]}', ${data.isInternal}, -1, null, '')`
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

  async getListOfYearsForVehicles() {
    try {
      return await database.sequelize
        .query(`SELECT DISTINCT (UNITYEAR) FROM TBLUnit ORDER BY UNITYEAR`)
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

  async getListOfMakesBasedOnYear(year) {
    try {
      return await database.sequelize
        .query(
          `SELECT DISTINCT(UNITMAKE) FROM TBLUnit WHERE UNITYEAR = ${year} ORDER BY UNITMAKE`
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

  async getListOfModelsBasedOnYearandMake(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT DISTINCT(UNITMODEL) FROM TBLUnit WHERE UNITMAKE = '${data.make}' AND UNITYEAR = ${data.year} ORDER BY UNITMODEL`
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

  async getListOfTrimBasedOnYearMakeAndModel(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT DISTINCT(UNITTRIM) FROM TBLUnit WHERE UNITMAKE = '${data.make}' AND UNITYEAR = ${data.year} AND UNITMODEL = '${data.model}' ORDER BY UNITTRIM`
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

  async getListOfCitiesForProvince(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT City from CanadianCitiesLookup WHERE Province = '${data.province}' ORDER BY city`
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

  async getCustomerId(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT customeridnumber
          FROM tblcustomerinfo
          WHERE CUSTLASTNAME = '${data.last_name}'
              and CUSTBIRTHDATE = '${data.date_of_birth}'
              and left(CUSTFIRSTNAME,3) = left('${data.first_name}',3)`
        )
        .then(res => {
          if (res[0][0] && res[0][0].customeridnumber) {
            return res[0][0].customeridnumber;
          } else {
            return null;
          }
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async InsertDataIntoCustomerTable(data, transactionQuery) {
    try {
      return await database.sequelize
        .query(
          `INSERT INTO TBLCustomerInfo (
            CustFirstName, CustLastName, CustCellNumber, CustHomeNumber, CustAddress, CustCity, CustProvince, 
            CustPostalCode, CustEmailAddress, CustMarriedStatus, CustSINNumber, CustDLClass, CustDLNumber, 
            CustDLExpiry, CustBankDischarge, CustHomeStatus, CustMonthlyPayment, CustValueOfHome, 
            CustBallanceMortage, CustMortgageHolder, CustTimeAtAddress, CustWorkAddress, CustWorkName,
            CustYearsAtEmployer, CustPosition, CustMonthlyIncome, CustBankrupt, CustWorkNumber, CustEmployStatus,
            CustBirthdate, CustEmpCity, CustRelatedToApplicant, CustOtherIncomeSource, CustOtherIncomeAmount, 
            CustOtherIncomeTime, CustDateApplied, CustCoJoProvince, CustCoJoPostalCode, CustUnitNumber, 
            CustAddressNumber, CustAddressStreet
          ) VALUES (${data.first_name.trim()}, ${data.last_name.trim()}, ${
            data.cell
          }, ${
            data.phone
          }, ${data.address.trim()}, ${data.city.trim()}, ${data.province.trim()}, ${
            data.postal
          }, ${data.email}, ${data.cosignerOnly ? data.marital : null}, ${
            data.sin
          }, ${data.driver_class}, ${data.driver_license}, ${
            data.driver_expiry
          }, ${data.discharge}, ${data.property}, ${data.mortgage_payment}, ${
            data.home_value
          }, ${data.mortgage_balance}, ${data.lender}, ${
            data.CustTimeataddress
          }, ${data.CustWorkAddress}, ${data.e_company}, ${
            data.Custyearsatemployer
          }, ${data.occupation}, ${data.income}, ${data.custbankrupt}, ${
            data.CustWorkNumber
          }, ${data.CustEmploystatus}, ${data.date_of_birth}, ${
            data.CustEmpCity
          }, ${data.CustRelatedToApplicant}, ${data.CustOtherIncomeSource}, ${
            data.CustOtherIncomeAmount
          }, ${data.CustOtherIncomeTime}, GETDATE(), ${data.CustEmpProvince}, ${
            data.CustEmpPostalCode
          }, ${data.CustUnitNumber}, ${data.CustAddressNumber}, ${
            data.CustAddressStreet
          }); SELECT SCOPE_IDENTITY() AS id;`,
          { transaction: transactionQuery }
        )
        .then(res => {
          return res[0][0].id;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async updateCustomerData(data, transactionQuery) {
    try {
      return await database.sequelize
        .query(
          `update TBLCustomerInfo set CustCellNumber = ${
            data.cell
          }, CustHomeNumber = ${
            data.phone
          }, CustAddress = ${data.address.trim()},
              CustCity = ${data.city}, CustProvince = ${
            data.province
          }, CustPostalCode = ${data.postal}, CustEmailAddress = ${
            data.email
          }, CustMarriedStatus = ${data.marital}, CustSINNumber = ${data.sin},
              CustDLClass = ${data.driver_class}, CustDLNumber = ${
            data.driver_license
          }, CustDLExpiry = ${data.driver_expiry},
              CustBankDischarge = ${data.discharge}, CustHomeStatus = ${
            data.property
          }, CustMonthlyPayment = ${data.mortgage_payment},
              CustValueOfHome = ${data.home_value}, CustBallanceMortage = ${
            data.mortgage_balance
          }, CustMortgageHolder = ${data.lender},
              CustTimeAtAddress = ${
                data.CustTimeataddress
              }, CustWorkAddress = ${data.CustWorkAddress}, CustWorkName = ${
            data.e_company
          }, CustYearsAtEmployer = ${
            data.Custyearsatemployer
          }, CustPosition = ${data.occupation}, CustMonthlyIncome = ${
            data.income
          }, CustBankrupt = ${data.custbankrupt}, CustWorkNumber = ${
            data.CustWorkNumber
          }, CustEmployStatus = ${data.CustEmploystatus},
              CUSTFIRSTNAME = ${data.first_name}, CustEmpCity = ${
            data.CustEmpCity
          }, CustOtherIncomeSource = ${
            data.CustOtherIncomeSource
          }, CustOtherIncomeAmount = ${
            data.CustOtherIncomeAmount
          }, CustOtherIncomeTime = ${
            data.CustOtherIncomeTime
          }, CustUnitNumber = ${data.CustUnitNumber}, CustAddressNumber = ${
            data.CustAddressNumber
          }, CustAddressStreet = ${
            data.CustAddressStreet
          } WHERE CUSTLASTNAME = ${data.last_name}
              and CUSTBIRTHDATE = ${data.date_of_birth}
              and CUSTFIRSTNAME = ${data.first_name}`,
          { transaction: transactionQuery }
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

  async InsertDataIntoDealWorksheet(
    data,
    folderTitle,
    parentFolderID,
    transactionQuery
  ) {
    try {
      return await database.sequelize
        .query(
          `INSERT INTO TBLDealWorksheet (
            ApplicationDate, DLRRegNumber, DealStatus, VehicleYear, VehicleMake, VehicleModel, VehicleTrim, VehicleIdNumber, 
            VehicleDistanceTraveled, VehicleDistanceUnits, PurchasePrice, TotalDownpayment, customeridnumber, CustCojoIDNumber,
            ApplicationType, Notes2, IPAddress
        ) VALUES (
          GETDATE(), ${data.vehicle_dealer}, 2, ${data.vehicle_year}, ${data.vehicle_make}, ${data.vehicle_model}, ${data.vehicle_trim}, ${data.vin},
          ${data.vehicle_distance_travelled}, ${data.vehicle_distance_units}, ${data.vehicle_sale_price}, ${data.vehicle_available}, ${data.customerID}, ${data.cosignerID},
          ${data.vehicle_type}, ${data.vehicle_history_url}, ${data.client_ip}); 
          SELECT SCOPE_IDENTITY() AS id;`,
          { transaction: transactionQuery }
        )
        .then(async res => {
          const folder_path = await this.CreateGoogleDriveFolderForDeal(
            folderTitle,
            parentFolderID
          );
          const response = {
            path: folder_path,
            dealId: res[0][0].id
          };
          return response;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  async updateDataIntoDealWorkSheet(data, transactionQuery) {
    try {
      return await database.sequelize
        .query(
          `update TBLDEALWORKSHEET set notes = '${data.folderPath}' 
          where dealidnumber = ${data.application_id}`,
          { transaction: transactionQuery }
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

  async InsertDataIntoFundingChecklist(applicantID, transactionQuery) {
    try {
      return await database.sequelize
        .query(
          `INSERT INTO TBLFUNDINGCHECKLIST(DEALNUMBER) VALUES (${applicantID})`,
          { transaction: transactionQuery }
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

  async UpdateCOjoIdNumberinDealWorksheet(cojoId, dealId, transactionQuery) {
    try {
      return await database.sequelize
        .query(
          `UPDATE TBLDealWorksheet SET CustCojoIDNumber = ${cojoId} WHERE DealIDNumber = ${dealId}`,
          { transaction: transactionQuery }
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

  async creditSendEmail(cosignerOnly = false, data) {
    try {
      const fs = require("fs");
      let email_html = await this.GetEmailDataHTML(cosignerOnly, data);
      let content = fs.readFileSync(
        `./server/PDF Template/credit-App-form.html`,
        "utf8"
      );
      content = content.replace("{{ table_body }}", email_html);
      let appTitle = "";
      if (cosignerOnly) {
        appTitle = `uploads/cosigner_app.pdf`;
      } else {
        appTitle = `uploads/online_app.pdf`;
      }
      const pdf = require("html-pdf");
      const options = {
        format: "Letter"
      };
      const uploadBuffer = [];
      uploadBuffer.push({
        path: appTitle,
        filename: appTitle.split("/")[1],
        mimeType: "application/pdf"
      });
      pdf.create(content, options).toFile(appTitle, async (err, res) => {
        if (err) {
          console.log(err);
        } else {
          let header = "";
          if (cosignerOnly) {
            header = "A Deal has been updated";
          } else {
            header = `New Deal has been Created`;
          }
          await mailService.sendMail(
            "techtic.avani@gmail.com",
            header,
            header,
            uploadBuffer
          );
          await DealService.tryToUploadToGoogleDrive(
            uploadBuffer,
            data.application_id
          );
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async GetEmailDataHTML(cosignerOnly, data) {
    try {
      let pdfContent = `<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif;"><strong>Dealer name: ${data.dealerName}</strong></td></tr>`;
      if (!cosignerOnly) {
        //---------------------------------------------------------------------------------------
        // Financing Details
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Financing Details</td></tr>`;
        // 1st row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.vehicle ? data.vehicle.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Vehicle</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.sale_price ? data.sale_price.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Sale price</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.vin ? data.vin.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">VIN</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%"></td></tr>`;

        // 2nd row
        pdfContent += `<tr>`;
        // 1st column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.year ? data.year.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Year</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.make ? data.make.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Make</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.model ? data.model.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Model</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.trim ? data.trim.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Trim</td></tr>`;
        pdfContent += `</table></td>`;

        pdfContent += `</table></td></tr>`;

        //---------------------------------------------------------------------------------------
        // Applicant Details
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Applicant Details</td></tr>`;
        // 1st row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.first_name ? data.first_name.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">First Name</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.last_name ? data.last_name.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Last Name</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.cell ? data.cell.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Cell Number</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.phone ? data.phone.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Phone Number</td></tr>`;
        pdfContent += `</table></td>`;

        // 2nd row
        pdfContent += `<tr>`;
        // 1st column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.address ? data.address.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Address</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.city ? data.city.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">City</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.province ? data.province.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Province</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.postal ? data.postal.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Postal code</td></tr>`;
        pdfContent += `</table></td></tr>`;

        // 3rd row
        pdfContent += `<tr>`;
        // 1st column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.email ? data.email.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Email
        </td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.marital
            ? await this.GetMaritalStatus(data.marital.replace(/'/g, ""))
            : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Marital Status</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.sin ? data.sin.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">SIN</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.date_of_birth ? this.formatDate(data.date_of_birth) : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Date of birth</td></tr>`;
        pdfContent += `</table></td>`;

        if (data.driver_license !== "" || data.driver_license !== "9") {
          // 4th row
          pdfContent += `</tr><tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.driver_license ? data.driver_license.replace(/'/g, "") : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Driving License</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.driver_expiry ? this.formatDate(data.driver_expiry) : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Expiry date</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"></td>`;
          // 4th column
          pdfContent += `<td width="25%" style="padding-top: 10px;"></td></tr>`;
        }
        pdfContent += `</table></td></tr>`;

        //---------------------------------------------------------------------------------------
        // Home Information
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Home Information</td></tr>`;
        // 1st row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;

        // 1st column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        if (parseInt(data.property.replace(/'/g, "")) === 4) {
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Own Free & Clear</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.home_value ? data.home_value : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Home Value</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (parseInt(data.property.replace(/'/g, "")) === 3) {
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Living with family</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property Type</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (parseInt(data.property.replace(/'/g, "")) === 2) {
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Rent</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Home Value</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.rent_payment ? data.rent_payment.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Monthly rent payments</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (parseInt(data.property.replace(/'/g, "")) === 1) {
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Own with mortgage</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property Type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.mortgage_payment ? data.mortgage_payment : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Monthly mortgage payments</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.home_value ? data.home_value : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
                    <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Home Value</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.mortgage_balance ? data.mortgage_balance : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
                    <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Mortgage balance</td></tr>`;
          pdfContent += `</table></td></tr>`;
          // 2nd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.lender ? data.lender.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Name of lender
        </td></tr>`;
          pdfContent += `</table></td>`;
        }
        pdfContent += `</table></td></tr>`;
        //---------------------------------------------------------------------------------------
        // Employment details
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Employment details</td></tr>`;
        // 1st row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;

        // 1st column
        if (data.employment == 4) {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.occupation ? data.occupation.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Occupation</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.income ? data.income : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_company ? data.e_company.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
                    <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Company name</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_year
              ? data.e_year.replace(/'/g, "") +
                " Years " +
                data.e_month.replace(/'/g, "") +
                " Months"
              : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
                    <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Time at current employer</td></tr>`;
        } else if (data.employment == 5) {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Retired</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employment type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.income ? data.income : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td>`;
        } else {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_name ? data.e_name.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer name</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.occupation ? data.occupation.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Occupation</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.income ? data.income : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_address ? data.e_address.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer address</td></tr>`;
          pdfContent += `</table></td></tr>`;
          // 2nd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_city ? data.e_city.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer city
        </td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_province ? data.e_province.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer province</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_postal ? data.e_postal.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer postal code</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_phone ? data.e_phone.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer phone number</td></tr>`;
          pdfContent += `</table></td></tr>`;
          // 3rd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.e_year
              ? data.e_year.replace(/'/g, "") +
                " Years " +
                data.e_month.replace(/'/g, "") +
                " Months "
              : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Time at current employer
        </td></tr>`;
        }
        pdfContent += `</table></td></tr>`;

        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        if (data.CustOtherIncomeSource) {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.CustOtherIncomeSource
              ? data.CustOtherIncomeSource.replace(/'/g, "")
              : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
            <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Other Income Source</td></tr>`;
          pdfContent += `</table></td>`;
        }
        // 2nd column
        if (data.CustOtherIncomeAmount) {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.CustOtherIncomeAmount ? data.CustOtherIncomeAmount : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
            <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Other Income Amount</td></tr>`;
          pdfContent += `</table></td>`;
        }
        // 3rd column
        if (data.otherIncomeYear || data.otherIncomeMonth) {
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.otherIncomeYear
              ? data.otherIncomeYear.replace(/'/g, "") +
                " Years " +
                data.otherIncomeMonth.replace(/'/g, "") +
                " Months"
              : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Other Income Time</td></tr>`;
        }

        pdfContent += `</table></td></tr></table></td></tr>`;
      }

      if (data.co_first_name) {
        //---------------------------------------------------------------------------------------
        // Cosigner Details
        if (!cosignerOnly) {
          pdfContent += `<tr style="display: block; page-break-before:always; padding-top: 15px;"><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Cosigner details</td></tr>`;
        } else {
          pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Cosigner details</td></tr>`;
        }
        // 1st row
        // 1st column
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_first_name ? data.co_first_name : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">First Name</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_last_name ? data.co_last_name.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Last Name</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_cell ? data.co_cell.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Cell Number</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_phone ? data.co_phone.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Phone Number</td></tr>`;
        pdfContent += `</table></td></tr>`;
        pdfContent += `</table></td></tr>`;

        // 2nd row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        if (data.co_address) {
          if (data.co_aptnumber) {
            pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
            pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${data.co_aptnumber +
              " " +
              data.co_streetnumber +
              " " +
              data.co_address}</td></tr>`;
            pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
            <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Address</td></tr>`;
            pdfContent += `</table></td>`;
          } else {
            pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
            pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${data.co_streetnumber +
              " " +
              data.co_address}</td></tr>`;
            pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
            <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">First Name</td></tr>`;
            pdfContent += `</table></td>`;
          }
        }
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_city ? data.co_city.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">City</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_province ? data.co_province.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Province</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_postal ? data.co_postal.replace(/'/g, "") : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Postal code</td></tr>`;
        pdfContent += `</table></td></tr>`;
        pdfContent += `</table></td></tr>`;

        // 3rd row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_email ? data.co_email : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Email</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_related != 0 && data.co_related != ""
            ? await this.GetCosignerRelatedText(data.co_related)
            : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Related to applicant</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_sin ? data.co_sin.replace(/'/g, "") : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">SIN</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_date_of_birth ? this.formatDate(data.co_date_of_birth) : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Date of birthday</td></tr>`;
        pdfContent += `</table></td></tr>`;
        pdfContent += `</table></td></tr>`;

        // 3rd row
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>`;
        // 1st column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_driver_class != ""
            ? await this.GetDriverLicenseClass(data.co_driver_class)
            : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Driver's license class</td></tr>`;
        pdfContent += `</table></td>`;
        // 2nd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_driver_license ? data.co_driver_license : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Driver License</td></tr>`;
        pdfContent += `</table></td>`;
        // 3rd column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_driver_expiry ? this.formatDate(data.co_driver_expiry) : ""
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Expiry date</td></tr>`;
        pdfContent += `</table></td>`;
        // 4th column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_discharge ? this.formatDate(data.co_discharge) : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Date of discharge</td></tr>`;
        pdfContent += `</table></td></tr>`;

        // end
        pdfContent += `</table></td></tr>`;

        //---------------------------------------------------------------------------------------
        // Cosigner Home Information
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Cosigner Home Information</td></tr>`;
        // 1st row
        // 1st column
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0">`;
        if (data.co_property == 1) {
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Own with mortgage</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_mortgage_payment
              ? data.co_mortgage_payment.replace(/'/g, "")
              : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Monthly mortgage payments</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_home_value ? data.co_home_value.replace(/'/g, "") : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Home Value</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_mortgage_balance
              ? data.co_mortgage_balance.replace(/'/g, "")
              : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Mortgage balance</td></tr>`;
          pdfContent += `</table></td></tr>`;

          // 2nd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_lender ? data.co_lender : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Name of lender</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (data.co_property == 2) {
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Rent</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_rent_payment ? data.co_rent_payment.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Monthly rent payments</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (data.co_property == 3) {
          pdfContent += `<tr><td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Living with family</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (data.co_property == 4) {
          pdfContent += `<tr><td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Own Free & Clear</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_home_value ? data.co_home_value.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Home Value</td></tr>`;
          pdfContent += `</table></td>`;
        }

        // next column
        pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
        pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
          data.co_res_year
            ? data.co_res_year + " Years " + data.co_res_month + " Months "
            : "-"
        }</td></tr>`;
        pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
      <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Time at current residence</td></tr>`;
        pdfContent += `</table></td></tr>`;
        pdfContent += `</table></td></tr>`;

        //---------------------------------------------------------------------------------------
        // Cosigner Employment details
        pdfContent += `<tr><td style="font-size:20px; color:#063; text-indent:10px; padding-top:15px; padding-bottom:15px;font-family: Arial, Helvetica, sans-serif;">Cosigner Employment details</td></tr>`;
        // 1st row
        // 1st column
        pdfContent += `<tr><td><table width="100%" cellpadding="0" cellspacing="0">`;
        if (
          data.co_employment == 1 ||
          data.co_employment == 2 ||
          data.co_employment == 3
        ) {
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          if (data.co_employment == 1) {
            pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Full Time</td></tr>`;
          } else if (data.co_employment == 2) {
            pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Part Time</td></tr>`;
          } else {
            pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Seasonal</td></tr>`;
          }
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employment type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_name ? data.co_e_name.replace(/'/g, "") : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer name</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_occupation ? data.co_occupation.replace(/'/g, "") : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Occupation</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_income ? data.co_income.replace(/'/g, "") : ""
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td></tr>`;

          // 2nd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_address ? data.co_e_address : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer address</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_city ? data.co_e_city : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer city</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_province ? data.co_e_province : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer province</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_postal ? data.co_e_postal : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer postal code</td></tr>`;
          pdfContent += `</table></td></tr>`;

          // 3rd row
          pdfContent += `<tr>`;
          // 1st column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_phone ? data.co_e_phone : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Employer phone number</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%" style="padding-top: 10px;"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_year
              ? data.co_e_year + " Years " + data.co_e_month + " Months"
              : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
        <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Time at current employer</td></tr>`;
          pdfContent += `</table></td></tr>`;
        } else if (data.co_employment == 4) {
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Self Employed</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_occupation ? data.co_occupation.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Occupation</td></tr>`;
          pdfContent += `</table></td>`;
          // 3rd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_income ? data.co_income.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td>`;
          // 4th column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_company ? data.co_e_company.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Company name</td></tr>`;
          pdfContent += `</table></td></tr>`;
          // 2nd row
          // 1st column
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_e_year
              ? data.co_e_year + " Years " + data.co_e_month + " Months"
              : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Time at current employer</td></tr>`;
          pdfContent += `</table></td>`;
        } else if (data.co_employment == 5) {
          pdfContent += `<tr><td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Retired</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Property type</td></tr>`;
          pdfContent += `</table></td>`;
          // 2nd column
          pdfContent += `<td width="25%"><table width="100%" cellpadding="0" cellspacing="0">`;
          pdfContent += `<tr><td style="text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${
            data.co_income ? data.co_income.replace(/'/g, "") : "-"
          }</td></tr>`;
          pdfContent += `<tr><td style="padding: 5px;"><hr style="margin: 0px;" /></td></tr>
          <tr><td style="padding: 0px 5px;text-align:center;font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #808080;">Gross monthly income</td></tr>`;
          pdfContent += `</table></td></tr>`;
        }

        pdfContent += `</table></td></tr>`;
      }
      return pdfContent;
    } catch (error) {
      throw error;
    }
  },

  async GetMaritalStatus(marital) {
    if (marital == "1") return "Married";
    else if (marital == "2") return "Single";
    else if (marital == "3") return "Divorced";
    else if (marital == "4") return "Widowed";

    return "";
  },

  async GetDriverLicenseClass(driver_class) {
    if (driver_class == "1") return "G1";
    else if (driver_class == "2") return "G2";
    else if (driver_class == "3") return "G";
    else if (driver_class == "4") return "M1";
    else if (driver_class == "5") return "M2";
    else if (driver_class == "6") return "M";
    else if (driver_class == "7") return "Az";
    else if (driver_class == "8") return "Dz";
    else if (driver_class == "9") return "None";

    return "";
  },

  async GetCosignerRelatedText(co_related) {
    if (co_related == "1") return "Spouse";
    else if (co_related == "2") return "Common Law";
    else if (co_related == "3") return "Parental";
    else if (co_related == "4") return "Child";
    else if (co_related == "5") return "Family Member";
    else if (co_related == "6") return "Other";

    return "";
  },

  async startTransaction() {
    try {
      return await database.sequelize.transaction();
    } catch (error) {
      throw error;
    }
  },

  async getAllInfoForAPForm(data) {
    try {
      return await database.sequelize
        .query(
          `SELECT DealIDNumber, TBLDealWorksheet.CustCojoIDNumber, ApplicationDate, DealStatus, PurchasePrice,
          Deposit, TotalDownpayment, TradeinTrueValue, tradeinlien,  tradeinvalue,
          (Deposit + TotalDownpayment + TradeinTrueValue) AS DownpaymentSum, TBLCustomerInfo.CustLastName,
          TBLCustomerInfo.CustFirstName, TBLCustomerInfoCojo.CustLastName AS CojoLastName,
          TBLCustomerInfoCojo.CustFirstName AS CojoFirstName, TBLCustomerInfo.CustEmailAddress, VehicleYear,
          VehicleMake,VehicleModel, VehicleTrim, VehicleColor, DLRDoingBusinessas, DLRPhone, DLRFax, DLRemail,
          VehicleDistanceTraveled, VehicleDistanceUnits, VehicleIDNumber, Notes
          FROM TBLDealWorksheet
          LEFT JOIN TBLCustomerInfo AS TBLCustomerInfo ON TBLCustomerInfo.CustomerIDNumber = TBLDealWorksheet.CustomerIDNumber
          LEFT JOIN TBLCustomerInfo AS TBLCustomerInfoCojo ON TBLCustomerInfoCojo.CustomerIDNumber = TBLDealWorksheet.CustCojoIDNumber
          LEFT JOIN TBLDealerRegistration ON TBLDealerRegistration.DLRRegNumber = TBLDealWorksheet.DLRRegNumber
          WHERE DealIDNumber = ${data.dealId}`
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

  async updateAPForm(dealId) {
    try {
      return await database.sequelize
        .query(
          `update TBLFundingChecklist set FNDRecCa = GETDATE() where dealnumber = ${dealId}`
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

  async createDriveFolderTitle(
    first_name,
    last_name,
    cosFirstname,
    cosLastName
  ) {
    let folderTitle = first_name + " " + last_name;
    if (typeof cosFirstname === "string" && typeof cosLastName === "string") {
      folderTitle += " & " + cosFirstname + " " + cosLastName;
    }
    var today = new Date();
    var date =
      today.getMonth() + 1 + "-" + today.getDate() + "-" + today.getFullYear();
    folderTitle += " " + date;
    return folderTitle;
  },

  async CreateGoogleDriveFolderForDeal(folderTitle, parentFolderID) {
    try {
      const { google } = require("googleapis");

      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/drive"]
      });

      var fileMetadata = {
        name: folderTitle,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderID]
      };

      const drive = google.drive({
        version: "v3",
        auth: auth
      });

      const response = await drive.files.create({
        resource: fileMetadata,
        fields: "id"
      });
      return "https://drive.google.com/drive/folders/" + response.data.id;
    } catch (error) {
      throw error;
    }
  },

  async tryToUploadToGoogleDrive(uploads, dealidnumber, data = null) {
    try {
      const { google } = require("googleapis");
      const fs = require("fs");
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/drive"]
      });
      const drive = google.drive({
        version: "v3",
        auth: auth
      });
      // getting drive link for particular deal ID
      let fileName = "";
      if (data) {
        fileName = data.fileType + " - " + this.formatDate(new Date());
      }
      var folderId = await this.getFolderIdFromDealId(dealidnumber);
      var fileMetadata = {
        name: data === null ? uploads[0].filename : fileName,
        mimeType: uploads[0].mimeType,
        parents: [folderId.split("folders/")[1]]
      };
      var media = {
        mimeType: uploads[0].mimeType,
        body: fs.createReadStream(uploads[0].path)
      };
      // upload the file in google drive
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id"
      });
      // remove the files from the local storage once it got uploaded successfully in google drive
      if (fs.existsSync(uploads[0].path)) {
        fs.unlinkSync(uploads[0].path);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getFolderIdFromDealId(dealId) {
    try {
      return await database.sequelize
        .query(
          `select notes from TBLDEALWORKSHEET where dealidnumber = ${dealId}`
        )
        .then(res => {
          return res[0][0].notes;
        })
        .catch(err => {
          throw err;
        });
    } catch (error) {
      throw error;
    }
  },

  formatDate(date) {
    try {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return year + "-" + month + "-" + day;
    } catch (error) {
      throw error;
    }
  },

  async uploadFileTypeList() {
    try {
      return await database.sequelize
        .query(
          `SELECT NAME FROM TBLUPLOADDROPDOWNS where DEALERENABLED = 1 ORDER BY NAME ASC `
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

  async insertDataIntoDealNotes(dealId, notes, person) {
    try {
      notes = `Dealer has uploaded ${notes}`;
      return await database.sequelize
        .query(
          `insert into TBDDealNotes(DEALNUMBER, UPDATEDATE, NOTEINFO, PERSON, INTERNALONLY, CarfTimeStamp, Processed, EmailSent)
          values (${dealId}, GETDATE(), '${notes}', '${person}', 0, null, -1, null)`
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
  }
};

module.exports = DealService;
