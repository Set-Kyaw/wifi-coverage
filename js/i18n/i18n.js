const I18nObj = {
  labelObj: {
    en_US: "English",
    my_MM: "မြန်မာ",
    th_TH: "ไทย",
    zh_CN: "简体中文",
    es_ES: "Español",
    fr_FR: "Français",    
    tr_TR: "Türkçe",
    vi_VN: "Tiếng Việt",    
  },

  currentLang: "en_US",

  init: function (data) {
    const self = this;
    const langs = data?.custom_html?.lang;
    if (!langs || langs.length == 0) {
    } else {
      this.currentLang = langs[0];
      this.activedObj = LandObj[this.currentLang];
      this.renderLangMenu(langs);
      this.initEvent();
    }
  },

  renderLangMenu(langs) {
    const menuItems = [];
    langs.forEach((lang) => {
      menuItems.push(`
          <a href="javascript:void(0)" onclick="I18nObj.changeLang('${lang}')">
            ${I18nObj.labelObj[lang]}
          </a>
        `);
    });
    
    // Find the appropriate container for the language selector
    let targetContainer = $("#body_content");
    if (targetContainer.length === 0) {
      // For packages page or other pages without #body_content
      targetContainer = $("#packages_wrapper, .header-section, .body-content-wrapper").first();
    }
    
    if (targetContainer.length > 0) {
      targetContainer.append(`
         <div class="dropdown language-select" id="language_select">
         <span class="dropdown-arrow">▼</span>
          <span class="dropdown-label">${I18nObj.labelObj[this.currentLang]}</span>
          <span class="dropdown-arrow">▼</span>

          <span class="dropdown-menu">
            ${menuItems.join("")}
          </span>
        </div>  
      `);
    }
  },

  initEvent() {
    const self = this;
    // Use event delegation to handle dynamically created language selector
    $(document).on("click", "#language_select", function (event) {
      $(this).toggleClass("actived");
    });
  },

  $t: function (key) {
    if (this.activedObj[key]) {
      return this.activedObj[key];
    } else {
      return key;
    }
  },

  changeLang(lang) {
    $("#login_msg").text("");
    $(".dropdown-label").text(I18nObj.labelObj[lang]);

    this.currentLang = lang;
    this.activedObj = LandObj[lang];
    this.renderHtmlLang();

    // Re-render packages if the function exists (for packages pages)
    if (typeof renderPackages === "function") {
      renderPackages();
    }
    
    // Re-render packages if PackagesPageObj exists (for standalone packages page)
    if (typeof PackagesPageObj !== "undefined" && typeof PackagesPageObj.renderPackages === "function") {
      PackagesPageObj.renderPackages();
    }
  },

  renderHtmlLang() {
    // For text content
    $("[data-i18n]").each(function () {
      var key = $(this).data("i18n");
      var translation = I18nObj.$t(key);
      $(this).text(translation);
    });

    $("[data-i18n-placeholder]").each(function () {
      var key = $(this).data("i18n-placeholder");
      var translation = I18nObj.$t(key);
      $(this).prop("placeholder", translation);
    });
  },
};
