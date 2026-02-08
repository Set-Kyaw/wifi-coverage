function loadConfig(data) {
  IndexObj.init(data);
}

function detectDefaultLang() {
  const lang = navigator.language || navigator.userLanguage || "";

  if (lang.toLowerCase().startsWith("th")) {
    return "th_TH";
  }

  return "en_US"; // fallback
}

const IndexObj = {
  currentOption: "",
  loginOptions: [],

  LOGIN_OPTION: {
    VOUCHER: "voucher",
    FIXACCOUNT: "fixaccount",
    /* PASS: "pass", */
  },

  init: function (data) {
    this.loadJson(data);
    setTimeout(function () {
      $("#body_loading").addClass("hide");
    }, 1000);

    this.initEvent();
    renderPackages();
  },

  loadJson: function (data) {
    const detectedLang = detectDefaultLang();

    // force detected language ONLY if allowed in config
    if (data?.custom_html?.lang?.includes(detectedLang)) {
      I18nObj.currentLang = detectedLang;
    }

    I18nObj.init(data);
    this.renderHtml(data);
  },

  initEvent: function () {
    const self = this;
    $("#login_btn").on("click", function () {
      self.onLogin();
    });
  },

  renderHtml: function (data) {
    const loginOptions = data?.custom_html?.login_options;
    this.loginOptions = loginOptions;

    if (!loginOptions) {
      return false;
    }

    // Define priority order
    const priorityOrder = [
      this.LOGIN_OPTION.FIXACCOUNT,
      this.LOGIN_OPTION.VOUCHER,
      this.LOGIN_OPTION.PASS,
    ];
    let currentOption = null;

    // Search for the default option according to the priority order
    for (const option of priorityOrder) {
      if (loginOptions.includes(option)) {
        currentOption = option;
        this.currentOption = currentOption;
        break;
      }
    }

    if (!currentOption) {
      return false;
    }

    I18nObj.renderHtmlLang();
    this.renderLoginHtml(loginOptions);
    this.renderCurrentLogin(currentOption);
  },

  renderLoginHtml: function (loginOptions) {
    // Control priority through styles: Voucher > Account > Oneclick
    if (loginOptions.length > 1) {
      $("#login_split_line").removeClass("hide");
    }

    const allOptions = [
      this.LOGIN_OPTION.VOUCHER,
      this.LOGIN_OPTION.FIXACCOUNT,
      this.LOGIN_OPTION.PASS,
    ];
    const missOptions = allOptions.filter(
      (option) => !loginOptions.includes(option),
    );

    missOptions.forEach((item) => {
      $(`.login-item-${item}`).remove();
    });
  },

  renderCurrentLogin(currentOption) {
    switch (currentOption) {
      /*
      case this.LOGIN_OPTION.PASS:
        $(".login-form-title").text(I18nObj.$t("one_click_login"));
        $('.login-form-title').attr('data-i18n', 'one_click_login')
        break;
      */
      case this.LOGIN_OPTION.FIXACCOUNT:
        $(".login-form-title").text(I18nObj.$t("account_login"));
        $(".login-form-title").attr("data-i18n", "account_login");
        break;
      case this.LOGIN_OPTION.VOUCHER:
      default:
        $(".login-form-title").text(I18nObj.$t("voucher_login"));
        $(".login-form-title").attr("data-i18n", "voucher_login");
        break;
    }

    const loginOptions = this.loginOptions;
    $(".login-form-wrapper .login-item").addClass("hide");
    $(".login-form-wrapper .login-item-" + currentOption).removeClass("hide");

    $(".other-btn-wrapper .login-item").addClass("hide");
    loginOptions.forEach((loginOpt) => {
      if (loginOpt !== currentOption) {
        $(".other-btn-wrapper .login-item-" + loginOpt).removeClass("hide");
      }
    });
  },

  changeLoginOption(currentOption) {
    this.currentOption = currentOption;
    this.renderCurrentLogin(currentOption);
  },

  onLogin() {
    let paramObj = {};

    switch (this.currentOption) {
      case this.LOGIN_OPTION.FIXACCOUNT:
        paramObj.account = $("#account_input").val();
        paramObj.password = $("#account_password").val();
        break;
      case this.LOGIN_OPTION.VOUCHER:
        paramObj.account = $("#voucher_code").val();
      case this.LOGIN_OPTION.PASS:
        break;
    }

    const validRes = this.validateLoginForm();
    if (!validRes) {
      return false;
    }

    paramObj = {
      lang: I18nObj.currentLang,
      authType: this.currentOption,
      sessionId: this._getParamVal("sessionId"),
      ...paramObj,
    };

    $.post({
      url: "/api/auth/general",
      data: JSON.stringify(paramObj),
      contentType: "application/json",
      success: function (response) {
        console.log("Server Response:", response);
        if (response.success) {
          location.href = response.result.logonUrl;
        } else {
          $("#login_msg").text(response.message);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error:", textStatus, errorThrown);
      },
    });
  },

  validateLoginForm() {
    $("#login_msg").text("");
    if (!this.currentOption) {
      return true;
    }

    switch (this.currentOption) {
      /*
      case this.LOGIN_OPTION.PASS:
        break; */

      case this.LOGIN_OPTION.FIXACCOUNT:
        return this.validateAccountForm();
      case this.LOGIN_OPTION.VOUCHER:
      default:
        return this.validateVoucherForm();
    }

    return true;
  },

  validateVoucherForm() {
    const voucherCode = $("#voucher_code").val().trim();
    if (!voucherCode) {
      $("#login_msg").text(I18nObj.$t("please_enter_access_code"));
      return false;
    }
    return true;
  },

  validateAccountForm() {
    const accountVal = $("#account_input").val().trim();
    const accountPwd = $("#account_password").val().trim();
    if (!accountVal) {
      $("#login_msg").text(I18nObj.$t("please_enter_account"));
      return false;
    }
    if (!accountPwd) {
      $("#login_msg").text(I18nObj.$t("please_enter_pwd"));
      return false;
    }
    return true;
  },

  _getParamVal(paras) {
    try {
      const topUrl = decodeURI(window.top.location.href);
      const queryString = topUrl.split("?")[1];
      if (!queryString) {
        return null;
      }

      const paraString = queryString.split("&");
      const paraObj = {};
      for (var i = 0; i < paraString.length; i++) {
        const pair = paraString[i].split("=");
        if (pair.length === 2) {
          paraObj[pair[0].toLowerCase()] = pair[1];
        }
      }

      const returnValue = paraObj[paras.toLowerCase()];
      return returnValue !== undefined ? returnValue : null;
    } catch (e) {
      console.error("Error accessing top window URL:", e);
      return null;
    }
  },
};

const packages = [
  // DATA (Group 1)
  { order: 1, type: "data", value: "1GB", day: 1, price_baht: 20 },
  { order: 2, type: "data", value: "3GB", day: 3, price_baht: 30 },
  { order: 3, type: "data", value: "5GB", day: 5, price_baht: 40 },
  { order: 4, type: "data", value: "7GB", day: 7, price_baht: 50 },

  // DATA (Group 2)
  { order: 5, type: "data", value: "3GB", day: 1, price_baht: 30 },
  { order: 6, type: "data", value: "6GB", day: 3, price_baht: 50 },
  { order: 7, type: "data", value: "9GB", day: 5, price_baht: 80 },
  { order: 8, type: "data", value: "12GB", day: 7, price_baht: 110 },

  // SPEED
  { order: 9, type: "speed", value: "10Mbps", day: 1, price_baht: 50 },
  { order: 10, type: "speed", value: "10Mbps", day: 3, price_baht: 80 },
  { order: 11, type: "speed", value: "10Mbps", day: 5, price_baht: 120 },
  { order: 12, type: "speed", value: "10Mbps", day: 7, price_baht: 150 },

  // UNLIMITED
  { order: 13, type: "unlimited", value: "Unlimited", day: 1, price_baht: 70 },
  { order: 14, type: "unlimited", value: "Unlimited", day: 3, price_baht: 100 },
  { order: 15, type: "unlimited", value: "Unlimited", day: 5, price_baht: 150 },
  { order: 16, type: "unlimited", value: "Unlimited", day: 7, price_baht: 200 },

  // LONG-TERM PACKAGES
  { order: 17, type: "speed", value: "10Mbps", day: 15, price_baht: 300 },
  { order: 18, type: "speed", value: "10Mbps", day: 30, price_baht: 500 },
  {
    order: 19,
    type: "unlimited",
    value: "Unlimited",
    day: 30,
    price_baht: 600,
  },
];

const sortedPackages = packages.sort((a, b) => a.order - b.order);

function renderPackages() {
  const container = $("#packages_container");
  container.empty();

  sortedPackages.forEach((pkg) => {
    const isUnlimited = pkg.type === "unlimited";
    const isSpeed = pkg.type === "speed";

    container.append(`
      <div class="package-card">

        <div class="package-title">
      <img src="./img/logo.png" alt="AIS 5G Logo" class="package-logo">
        </div>    

        <div class="package-data">
        ${
          pkg.type === "data"
            ? pkg.value
            : pkg.type === "speed"
              ? `${pkg.value} ${I18nObj.$t("unlimited")}`
              : I18nObj.$t("unlimited")
        }
      </div>

        <!-- Main price (THB highlighted) -->
        <div class="package-price-main">
             ${pkg.price_baht} ฿ 
            </div>
              
        <!-- Speed + Day -->
        <div class="package-meta">
          <span class="package-speed">
  ${pkg.type !== "speed" ? I18nObj.$t("up_to_speed") : ""}
          </span>
          <span class="package-day">
            ${pkg.day} ${I18nObj.$t("day")}
          </span>
        </div>

        <a href="tel:09454821595"
           class="package-btn"
           data-i18n="contact_sales"></a>

      </div>
    `);
  });

  // re-apply translations
  I18nObj.renderHtmlLang();
}
