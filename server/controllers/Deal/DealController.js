const Util = require("../../Utils");
const util = new Util();
const DealService = require("../../services/DealService/DealService");
const mailService = require("../../services/EmailService/EmailService");
const DealerService = require("../../services/DealerService/DealerService");

class DealController {
  static async ShowAllDealsBasedOnDealerId(req, res) {
    try {
      if (req.decoded.is_super_admin && !req.query.dlrregnumber) {
        // get all the deals List if loggedIn user is Super Admin
        req.query.email = req.decoded.email;
        req.query.is_superAdmin = req.decoded.is_super_admin;
        req.query.role = req.decoded.role;
        const starting_page =
          parseInt(req.query.current_page) === 1
            ? req.query.filter !== "" && req.query.current_page === 1
              ? 0
              : 0
            : parseInt(req.query.current_page) * req.query.limit - 9;
        const response = await DealService.getAllDealsForSuperAdmin(
          req.query,
          starting_page
        );
        const total_no_records = await DealService.getTotalDealsForSuperAdmin(
          req.query
        );
        const n = total_no_records / req.query.limit;
        const meta = {
          current_page: req.query.current_page,
          from: starting_page,
          per_page: req.query.limit,
          last_page: Math.ceil(n),
          to: req.query.current_page * req.query.limit,
          total: total_no_records
        };
        await util.setSuccess(
          200,
          "All Deals For Super Admin Access",
          response,
          meta
        );
        return util.send(res);
      } else {
        if (!req.query.dlrregnumber && req.decoded.dlr_reg_number === 0) {
          util.setError(400, "Dealer Id is empty. Please try again.");
          return util.send(res);
        } else {
          if (!req.query.dlrregnumber) {
            req.query.dlrregnumber = req.decoded.dlr_reg_number;
          }
          const starting_page =
            parseInt(req.query.current_page) === 1
              ? req.query.filter !== "" && req.query.current_page === 1
                ? 0
                : 0
              : parseInt(req.query.current_page) * req.query.limit - 9;
          const deals = await DealService.getDealList(req.query, starting_page);
          const total_no_records = await DealService.getTotalDealList(
            req.query
          );
          const n = total_no_records / req.query.limit;
          const meta = {
            current_page: req.query.current_page,
            from: starting_page,
            per_page: req.query.limit,
            last_page: Math.ceil(n),
            to: parseInt(req.query.current_page * req.query.limit),
            total: total_no_records
          };
          await util.setSuccess(200, "", deals, meta);
          return util.send(res);
        }
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getDealNotes(req, res) {
    try {
      if (!req.query.DealNumber) {
        util.setError(401, "Please provide Deal ID");
        return util.send(res);
      } else {
        const starting_page =
          req.query.current_page === 1
            ? 0
            : Number(
                parseInt(req.query.current_page) * parseInt(req.query.limit)
              ) - 9;
        const response = await DealService.getDealNotesByDealId(
          req.query,
          starting_page
        );
        const totalNotes = await DealService.getTotalDealNotesByDealId(
          req.query
        );
        await util.setSuccess(200, "", response, {
          current_page: req.query.current_page,
          from:
            req.query.current_page > 1
              ? Number(
                  parseInt(req.query.current_page) * parseInt(req.query.limit)
                ) - 9
              : Number(req.query.current_page),
          per_page: req.query.limit,
          last_page: totalNotes,
          to: Number(
            parseInt(req.query.current_page) * parseInt(req.query.limit)
          ),
          total: totalNotes
        });
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async addDealNotes(req, res) {
    try {
      if (!req.body.note || !req.body.DealNumber) {
        util.setError(400, "Invalid DealId or note. Please try again.");
        return util.send(res);
      } else {
        req.body.email = req.decoded.email;
        // req.body.role = req.decoded.role;
        req.body.isInternal =
          req.decoded.role === "rep"
            ? req.body.isInternal === false
              ? 0
              : 1
            : 0;
        const user = await DealService.checkifDealExists(req.body);
        if (user.length > 0) {
          await DealService.addNotesToDeal(req.body);
          util.setSuccess(200, "Deal's Note added successfully");
          return util.send(res);
        } else {
          util.setError(200, "Deal not found");
          return util.send(res);
        }
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getInternalNotes(req, res) {
    try {
      if (!req.query.isInternal || !req.query.DealNumber) {
        util.setError(
          401,
          "Please provide you need internal notes or external notes or Deal ID"
        );
        return util.send(res);
      } else {
        const response = await DealService.getListOfInternalNotes(req.query);
        await util.setSuccess(200, "", response);
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getYearsForVehicles(req, res) {
    try {
      const yearList = await DealService.getListOfYearsForVehicles();
      await util.setSuccess(200, "", yearList);
      return util.send(res);
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getMakesBasedOnYear(req, res) {
    try {
      if (req.query.year) {
        const makeList = await DealService.getListOfMakesBasedOnYear(
          req.query.year
        );
        await util.setSuccess(200, "", makeList);
        return util.send(res);
      } else {
        util.setError(500, "Please provide year");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getModelsBasedOnMakeAndYear(req, res) {
    try {
      if (req.query.year && req.query.make) {
        const modelList = await DealService.getListOfModelsBasedOnYearandMake(
          req.query
        );
        await util.setSuccess(200, "", modelList);
        return util.send(res);
      } else {
        util.setError(500, "Please provide year and make");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getTrimsBasedOnMakeYearModel(req, res) {
    try {
      if (req.query.year && req.query.make && req.query.model) {
        const trimList = await DealService.getListOfTrimBasedOnYearMakeAndModel(
          req.query
        );
        await util.setSuccess(200, "", trimList);
        return util.send(res);
      } else {
        util.setError(500, "Please provide model, year and make");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getCitiesForProvince(req, res) {
    try {
      if (req.query.province) {
        const cityList = await DealService.getListOfCitiesForProvince(
          req.query
        );
        await util.setSuccess(200, "", cityList);
        return util.send(res);
      } else {
        util.setError(500, "Please provide province");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async addCosignerToDeals(req, res) {
    const transactionQuery = await DealService.startTransaction();
    try {
      // Main Applicant
      let promise = new Promise(async (resolve, reject) => {
        try {
          if (
            !req.body.last_name ||
            !req.body.first_name ||
            !req.body.date_of_birth
          ) {
            req.body.customerID = null;
          } else {
            const date5 = new Date(req.body.date_of_birth);
            const expiryDate5 = DealService.formatDate(date5);
            req.body.date_of_birth = `${expiryDate5}`;
            req.body.customerID = await DealService.getCustomerId(req.body);
          }
          if (!req.body.cosignerOnly) {
            // We either have an existing customer to update or we should run the insert statement
            req.body.first_name = `'${req.body.first_name}'`;
            req.body.last_name = `'${req.body.last_name}'`;
            req.body.cell = req.body.cell
              ? `'${req.body.cell.replace(/[^0-9]/g, "")}'`
              : null;
            req.body.phone = req.body.phone
              ? `'${req.body.phone.replace(/[^0-9]/g, "")}'`
              : null;
            req.body.address = `'${req.body.address}'`;
            req.body.province = `'${req.body.province}'`;
            req.body.city = `'${req.body.city}'`;
            req.body.postal = req.body.postal
              ? `'${req.body.postal.replace("-", "")}'`
              : null;
            req.body.email = req.body.email ? `'${req.body.email}'` : null;
            req.body.marital = req.body.marital
              ? `'${req.body.marital}'`
              : null;
            if (req.body.sin) {
              req.body.sin = req.body.sin.toString().replace("-", "");
              req.body.sin = req.body.sin.toString().replace("-", "");
              req.body.sin = `'${req.body.sin}'`;
            } else {
              req.body.sin = null;
            }
            req.body.driver_class = req.body.driver_class
              ? `'${req.body.driver_class}'`
              : null;
            req.body.driver_license = req.body.driver_license
              ? `'${req.body.driver_license}'`
              : null;
            const date = new Date(req.body.driver_expiry);
            const expiryDate1 = DealService.formatDate(date);
            req.body.driver_expiry = req.body.driver_expiry
              ? `'${expiryDate1}'`
              : null;
            const newDate2 = new Date(req.body.discharge);
            const expiryDate2 = DealService.formatDate(newDate2);
            req.body.discharge = req.body.discharge ? `'${expiryDate2}'` : null;
            req.body.property = req.body.property
              ? `'${req.body.property}'`
              : null;
            req.body.mortgage_payment = req.body.mortgage_payment
              ? `'${req.body.mortgage_payment.replace(/,/g, "")}'`
              : null;
            req.body.home_value = req.body.home_value
              ? `'${req.body.home_value.replace(/,/g, "")}'`
              : null;
            req.body.mortgage_balance = req.body.mortgage_balance
              ? `'${req.body.mortgage_balance.replace(/,/g, "")}'`
              : null;
            req.body.lender = req.body.lender ? `'${req.body.lender}'` : null;
            if (req.body.res_year && req.body.res_month) {
              req.body.CustTimeataddress = parseFloat(
                (parseInt(req.body.res_year) * 12 +
                  parseInt(req.body.res_month)) /
                  12
              );
            } else {
              req.body.CustTimeataddress = null;
            }
            if (req.body.e_address && req.body.e_city && req.body.e_postal) {
              req.body.CustWorkAddress =
                req.body.e_address.trim() +
                " " +
                req.body.e_postal.charAt(0).toUpperCase() +
                req.body.e_postal.slice(1) +
                " " +
                req.body.e_city.trim();
              req.body.CustWorkAddress = `'${req.body.CustWorkAddress}'`;
            } else {
              req.body.CustWorkAddress = null;
            }
            req.body.e_company = req.body.e_company
              ? `'${req.body.e_company}'`
              : null;
            if (req.body.e_year && req.body.e_month) {
              req.body.Custyearsatemployer =
                (parseInt(req.body.e_year) * 12 + parseInt(req.body.e_month)) /
                12;
            } else {
              req.body.Custyearsatemployer = null;
            }
            req.body.occupation = req.body.occupation
              ? `'${req.body.occupation}'`
              : null;
            req.body.income = req.body.income
              ? `'${req.body.income.replace(/,/g, "")}'`
              : null;
            req.body.custbankrupt = req.body.custbankrupt === true ? 1 : 0;
            req.body.CustWorkNumber = req.body.e_phone
              ? `'${req.body.e_phone.replace(/[^0-9]/g, "")}'`
              : null;
            req.body.CustEmploystatus = req.body.employment
              ? `'${req.body.employment}'`
              : null;
            const newDate = new Date(req.body.date_of_birth);
            const expiryDate = DealService.formatDate(newDate);
            req.body.date_of_birth = req.body.date_of_birth
              ? `'${expiryDate}'`
              : null;
            req.body.CustRelatedToApplicant = null;
            req.body.CustEmpCity = req.body.e_city
              ? `'${req.body.e_city}'`
              : null;
            req.body.CustOtherIncomeSource = req.body.CustOtherIncomeSource
              ? `'${req.body.CustOtherIncomeSource}'`
              : null;
            if (req.body.CustOtherIncomeAmount) {
              req.body.CustOtherIncomeAmount = req.body.CustOtherIncomeAmount.replace(
                /,/g,
                ""
              );
            } else {
              req.body.CustOtherIncomeAmount = null;
            }
            if (req.body.otherIncomeYear && req.body.otherIncomeMonth) {
              req.body.CustOtherIncomeTime = parseFloat(
                (parseInt(req.body.otherIncomeYear) * 12 +
                  parseInt(req.body.otherIncomeMonth)) /
                  12
              );
            } else {
              req.body.CustOtherIncomeTime = null;
            }
            req.body.CustEmpProvince = req.body.e_province
              ? `'${req.body.e_province}'`
              : null;
            if (req.body.e_postal) {
              let upperCase = req.body.e_postal.replace("-", "");
              let newString =
                upperCase.charAt(0).toUpperCase() + upperCase.slice(1);
              req.body.CustEmpPostalCode = `'${newString}'`;
            } else {
              req.body.CustEmpPostalCode = null;
            }
            req.body.CustUnitNumber = req.body.aptnumber
              ? `'${req.body.aptnumber}'`
              : null;
            req.body.CustAddressNumber = req.body.streetnumber
              ? `'${req.body.streetnumber}'`
              : null;
            req.body.CustAddressStreet = req.body.address
              ? `${req.body.address}`
              : null;
            if (req.body.customerID === null) {
              req.body.customerID = await DealService.InsertDataIntoCustomerTable(
                req.body,
                transactionQuery
              );
            } else {
              await DealService.updateCustomerData(req.body, transactionQuery);
            }
          }
          // CoSigner
          // insert cosigner if we have one
          if (req.body.co_first_name) {
            // We bound these variables to the prepared query above.
            req.body.first_name = `'${req.body.co_first_name}'`;
            req.body.last_name = `'${req.body.co_last_name}'`;
            req.body.cell = req.body.co_cell
              ? `'${req.body.co_cell.replace(/[^0-9]/g, "")}'`
              : null;
            req.body.phone = req.body.co_phone
              ? `'${req.body.co_phone.replace(/[^0-9]/g, "")}'`
              : null;
            if (req.body.co_aptnumber != "") {
              req.body.address =
                req.body.co_aptnumber +
                " " +
                req.body.co_streetnumber +
                " " +
                req.body.co_address;
            }
            if (req.body.address.length > 50) {
              req.body.address = substr(req.body.address, 0, 50);
              req.body.address = `'${req.body.address}'`;
            } else {
              req.body.address = `'${req.body.address}'`;
            }
            req.body.city = `'${req.body.co_city}'`;
            req.body.province = `'${req.body.co_province}'`;
            if (req.body.co_postal) {
              let upperCase = req.body.co_postal.replace("-", "");
              let newString =
                upperCase.charAt(0).toUpperCase() + upperCase.slice(1);
              req.body.postal = `'${newString}'`;
            } else {
              req.body.postal = null;
            }
            req.body.email = req.body.co_email
              ? `'${req.body.co_email}'`
              : null;
            if (req.body.co_sin) {
              req.body.sin = req.body.co_sin.split("-").join("");
              req.body.sin = `'${req.body.sin}'`;
            } else {
              req.body.sin = null;
            }
            // req.body.marital = null;
            const newDate1 = new Date(req.body.co_date_of_birth);
            const expiryDate1 = DealService.formatDate(newDate1);
            req.body.date_of_birth = req.body.co_date_of_birth
              ? `'${expiryDate1}'`
              : null;
            req.body.driver_class = req.body.co_driver_class
              ? `'${req.body.co_driver_class}'`
              : null;
            req.body.driver_license =
              req.body.co_driver_license === ""
                ? null
                : `'${req.body.co_driver_license}'`;
            if (req.body.co_driver_expiry === "") {
              req.body.driver_expiry = null;
            } else {
              const newDate2 = new Date(req.body.co_driver_expiry);
              const expiryDate2 = DealService.formatDate(newDate2);
              req.body.driver_expiry = `'${expiryDate2}'`;
            }
            req.body.custbankrupt = req.body.cosignerbankrupt === true ? 1 : 0;
            const newDate3 = new Date(req.body.co_discharge);
            const expiryDate3 = await DealService.formatDate(newDate3);
            req.body.discharge = req.body.co_discharge
              ? `'${expiryDate3}'`
              : null;
            req.body.property = req.body.co_property
              ? `'${req.body.co_property}'`
              : null;
            if (req.body.property == "2") {
              req.body.mortgage_payment = req.body.co_rent_payment
                ? parseInt(req.body.co_rent_payment.replace(/,/g, ""))
                : null;
            } else {
              req.body.mortgage_payment = req.body.co_mortgage_payment
                ? parseInt(req.body.co_mortgage_payment.replace(/,/g, ""))
                : null;
            }
            req.body.home_value = req.body.co_home_value
              ? parseInt(req.body.co_home_value.replace(/,/g, ""))
              : null;
            req.body.mortgage_balance = req.body.co_mortgage_balance
              ? parseInt(req.body.co_mortgage_balance.replace(/,/g, ""))
              : null;
            req.body.lender = req.body.co_lender
              ? `'${req.body.co_lender}'`
              : null;
            if (req.body.co_res_year && req.body.co_res_month) {
              req.body.CustTimeataddress = parseFloat(
                (parseInt(req.body.co_res_year) * 12 +
                  parseInt(req.body.co_res_month)) /
                  12
              ).toFixed(5);
            } else {
              req.body.CustTimeataddress = null;
            }
            if (
              req.body.co_e_address &&
              req.body.co_e_city &&
              req.body.co_e_postal &&
              req.body.co_e_province
            ) {
              req.body.CustWorkAddress =
                req.body.co_e_address.trim() +
                " " +
                req.body.co_e_postal.charAt(0).toUpperCase() +
                req.body.co_e_postal.slice(1) +
                " " +
                req.body.co_e_city.trim() +
                " " +
                req.body.co_e_province.trim();
              req.body.CustWorkAddress = `'${req.body.CustWorkAddress}'`;
            } else {
              req.body.CustWorkAddress = null;
            }
            req.body.CustWorkNumber = req.body.co_e_phone
              ? `'${req.body.co_e_phone.replace(/[^0-9]/g, "")}'`
              : null;
            req.body.e_company = req.body.co_e_company
              ? `'${req.body.co_e_company}'`
              : null;
            req.body.CustEmpCity = req.body.co_e_city
              ? `'${req.body.co_e_city}'`
              : null;
            if (req.body.co_e_year && req.body.co_e_month) {
              req.body.Custyearsatemployer =
                (parseInt(req.body.co_e_year) * 12 +
                  parseInt(req.body.co_e_month)) /
                12;
            } else {
              req.body.Custyearsatemployer = null;
            }
            req.body.occupation = req.body.co_occupation
              ? `'${req.body.co_occupation}'`
              : null;
            req.body.income = req.body.co_income
              ? parseInt(req.body.co_income.replace(/,/g, ""))
              : null;
            req.body.CustRelatedToApplicant = req.body.co_related
              ? `'${req.body.co_related}'`
              : null;
            req.body.CustEmploystatus = req.body.co_employment
              ? parseInt(req.body.co_employment)
              : null;
            req.body.CustOtherIncomeSource = req.body.co_CustOtherIncomeSource
              ? `'${req.body.co_CustOtherIncomeSource}'`
              : null;
            req.body.CustOtherIncomeAmount = req.body.co_CustOtherIncomeAmount
              ? parseInt(req.body.co_CustOtherIncomeAmount.replace(/,/g, ""))
              : null;
            if (req.body.co_otherIncomeYear && req.body.co_otherIncomeMonth) {
              req.body.CustOtherIncomeTime = parseFloat(
                (parseInt(req.body.co_otherIncomeYear) * 12 +
                  parseInt(req.body.co_otherIncomeMonth)) /
                  12
              );
            } else {
              req.body.CustOtherIncomeTime = null;
            }
            req.body.CustEmpProvince = req.body.co_e_province
              ? `'${req.body.co_e_province.trim()}'`
              : null;
            if (req.body.co_e_postal) {
              let upperCase = req.body.co_e_postal.replace("-", "");
              let newString =
                upperCase.charAt(0).toUpperCase() + upperCase.slice(1);
              req.body.CustEmpPostalCode = `'${newString}'`;
            } else {
              req.body.CustEmpPostalCode = null;
            }
            req.body.CustUnitNumber = req.body.co_aptnumber
              ? `'${req.body.co_aptnumber}'`
              : null;
            req.body.CustAddressNumber = req.body.co_streetnumber
              ? `'${req.body.co_streetnumber}'`
              : null;
            req.body.CustAddressStreet = req.body.co_address
              ? `'${req.body.co_address}'`
              : null;
            // calling same Insert API to get cosigner ID
            req.body.cosignerID = await DealService.InsertDataIntoCustomerTable(
              req.body,
              transactionQuery
            );
          }
          // Insert the deal next. This is using the bound $customerID and $cosignerID variables.
          // We don't want a deal If we are just adding a cosigner.
          // Create a new empty record in the TBLFUNDINGCHECKLIST when new deals are created
          if (!req.body.cosignerOnly) {
            let folder_title = await DealService.createDriveFolderTitle(
              req.body.first_name,
              req.body.last_name,
              req.body.co_first_name,
              req.body.co_last_name
            );

            req.body.vehicle_year = req.body.year ? `'${req.body.year}'` : null;
            req.body.vehicle_make = req.body.make ? `'${req.body.make}'` : null;
            req.body.vehicle_model = req.body.model
              ? `'${req.body.model}'`
              : null;
            req.body.vehicle_trim = req.body.trim ? `'${req.body.trim}'` : null;
            req.body.vin = req.body.vin ? `'${req.body.vin}'` : null;
            req.body.vehicle_distance_travelled = req.body.distance_travelled
              ? `'${req.body.distance_travelled.replace(/,/g, "")}'`
              : null;
            req.body.vehicle_distance_units = req.body.distance_units
              ? `'${req.body.distance_units}'`
              : null;
            req.body.vehicle_sale_price = req.body.sale_price
              ? `'${req.body.sale_price.replace(/,/g, "")}'`
              : null;
            req.body.vehicle_available = req.body.available === true ? 1 : 0;
            req.body.vehicle_type = req.body.vehicle
              ? `'${req.body.vehicle}'`
              : null;
            req.body.vehicle_history_url = req.body.vehicle_history_url
              ? `'${req.body.vehicle_history_url}'`
              : null;
            req.body.cosignerID = req.body.cosignerID
              ? req.body.cosignerID
              : null;
            req.body.vehicle_dealer = req.body.dlrregnumber
              ? req.body.dlrregnumber
              : "1111111";
            req.body.client_ip = req.body.client_ip
              ? `'${req.body.client_ip}'`
              : null;
            const data = await DealService.InsertDataIntoDealWorksheet(
              req.body,
              folder_title,
              process.env.GOOGLE_FOLDER_ID,
              transactionQuery
            );

            req.body.application_id = data.dealId;
            req.body.folderPath = data.path;
            await DealService.updateDataIntoDealWorkSheet(
              req.body,
              transactionQuery
            );
            req.body.fundingID = await DealService.InsertDataIntoFundingChecklist(
              req.body.application_id,
              transactionQuery
            );
          }
          let dealer = [];
          if (req.params.dlrregnumber) {
            dealer = await DealerService.getSingleDealer(
              req.params.dlrregnumber
            );
          } else if (req.decoded.dlr_reg_number) {
            dealer = await DealerService.getSingleDealer(
              req.decoded.dlr_reg_number
            );
          }
          req.body.dealerName = dealer[0].DLRDOINGBUSINESSAS;

          // update the cojoidnumber in dealWorksheet if user have added cosigner along with new deal
          if (req.body.cosignerID) {
            if (req.body.dealId && req.body.cosignerOnly) {
              req.body.application_id = req.body.dealId;
            }
            await DealService.UpdateCOjoIdNumberinDealWorksheet(
              req.body.cosignerID,
              req.body.application_id,
              transactionQuery
            );
          }
          // exit successfully.
          // commit code
          resolve(req.body);
        } catch (error) {
          reject(error);
        }
      });
      promise
        .then(async function(data) {
          //success handler function is invoked
          transactionQuery.commit();
          if (!data.cosignerOnly) {
            await DealService.creditSendEmail(false, data);
          } else {
            await DealService.creditSendEmail(true, data);
          }
          util.setSuccess(200, "Successfully Added the Details", {
            cosignerID: req.body.cosignerID,
            application_id: req.body.application_id
          });
          return util.send(res);
        })
        .catch(function(error) {
          // rollback everything if any error occurs.
          transactionQuery.rollback();
          util.setError(500, 'something wents wrong');
          return util.send(res);
        });
    } catch (error) {
      // rollback everything if any error occurs.
      transactionQuery.rollback();
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async uploadFilesInGoogelDrive(req, res) {
    try {
      const dealer = await DealerService.getSingleDealer(
        req.decoded.dlr_reg_number
      );
      const doc = await req.body.file.map(rec => rec.fileType);
      let unique = [...new Set(doc)];
      let uniqueVal = [];
      unique.forEach(value => {
        uniqueVal.push({
          fileType: value,
          count: doc.filter(str => str === value).length
        });
      });
      let notes = "";
      if (uniqueVal.length) {
        uniqueVal.forEach(rec => {
          if (notes.length) {
            notes += ", ";
          }
          notes +=
            rec.count > 1 ? rec.fileType + " x" + rec.count : rec.fileType;
        });
      }

      let count = 0;
      await req.body.file.map(async (request, i) => {
        if (request.dealID && req.files[i]) {
          let fileArray = [];
          fileArray.push(req.files[i]);
          count = count + 1;
          const response = await DealService.tryToUploadToGoogleDrive(
            fileArray,
            request.dealID,
            request
          );
        } else {
          util.setError(
            500,
            "DealId or file is empty. Please provide all data."
          );
          return util.send(res);
        }
      });
      if (count === req.body.file.length) {
        if (notes) {
          await DealService.insertDataIntoDealNotes(
            req.body.file[0].dealID,
            notes,
            dealer[0].DLRDOINGBUSINESSAS.slice(0, 20)
          );
        }
        util.setSuccess(200, "Successfully uploaded the files");
        return util.send(res);
      } else {
        util.setError(500, "DealId or file is empty. Please provide all data.");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getAPFormInfo(req, res) {
    try {
      if (req.query.dealId) {
        const apDeatils = await DealService.getAllInfoForAPForm(req.query);
        await util.setSuccess(200, "AP Form data", apDeatils);
        return util.send(res);
      } else {
        util.setError(500, "Please provide Deal ID");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async updateApprovedForm(req, res) {
    try {
      if (req.body.dealId) {
        var path_to_file = [
          {
            filename:
              "Approval page completed for " +
              req.body.Customer +
              " for " +
              req.body.Dealer +
              ".pdf",
            path: req.body.path_to_file
          }
        ];
        await DealService.updateAPForm(req.body.dealId);
        await mailService.sendMail(
          req.decoded.email,
          "Approval page completed for " +
            req.body.Customer +
            " for " +
            req.body.Dealer,
          "Approval page completed for " +
            req.body.Customer +
            " for " +
            req.body.Dealer,
          path_to_file
        );
        await util.setSuccess(200, "Response", "Successfully updated AP from");
        return util.send(res);
      } else {
        util.setError(500, "Please provide Deal ID");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async uploadFilesType(req, res) {
    try {
      const uploadTypeList = await DealService.uploadFileTypeList();
      await util.setSuccess(200, "Upload Type List", uploadTypeList);
      return util.send(res);
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }

  static async getListOfUploadedFiles(req, res) {
    try {
      if (req.query.dealId) {
        const { google } = require("googleapis");
        // const fs = require("fs");
        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ["https://www.googleapis.com/auth/drive"]
        });
        const drive = google.drive({
          version: "v3",
          auth: auth
        });
        // getting drive link for particular deal ID
        await DealService.getFolderIdFromDealId(req.query.dealId).then(
          async response => {
            let fileId = response.split("folders/")[1];
            await drive.files.list(
              {
                includeRemoved: false,
                spaces: "drive",
                fileId: fileId,
                fields:
                  "nextPageToken, files(id, name, parents, mimeType, modifiedTime)",
                q: `'${fileId}' in parents`
              },
              function(err, response) {
                if (!err) {
                  util.setSuccess(200, "List of Files", response.data.files);
                  return util.send(res);
                } else {
                  throw err;
                }
              }
            );
          }
        );
      } else {
        util.setError(404, "Please provide the dealId");
        return util.send(res);
      }
    } catch (error) {
      util.setError(500, 'something wents wrong');
      return util.send(res);
    }
  }
}

module.exports = DealController;
