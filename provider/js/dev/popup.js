import { s as slideUp, a as slideToggle, d as dataMediaQueries, b as bodyLock, c as bodyUnlock, e as bodyLockStatus, f as bodyLockToggle } from "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-fls-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.flsFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-fls-form-error>${formRequiredItem.dataset.flsFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-fls-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-fls-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  removeFocus(formRequiredItem) {
    formRequiredItem.classList.remove("--form-focus");
    formRequiredItem.parentElement.classList.remove("--form-focus");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        formValidate.removeFocus(el);
        formValidate.removeSuccess(el);
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            window["flsSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
class SelectConstructor {
  constructor(props, data = null) {
    let defaultConfig = {
      init: true,
      speed: 150
    };
    this.config = Object.assign(defaultConfig, props);
    this.selectClasses = {
      classSelect: "select",
      // Головний блок
      classSelectBody: "select__body",
      // Тіло селекту
      classSelectTitle: "select__title",
      // Заголовок
      classSelectValue: "select__value",
      // Значення у заголовку
      classSelectLabel: "select__label",
      // Лабел
      classSelectInput: "select__input",
      // Поле введення
      classSelectText: "select__text",
      // Оболонка текстових даних
      classSelectLink: "select__link",
      // Посилання в елементі
      classSelectOptions: "select__options",
      // Випадаючий список
      classSelectOptionsScroll: "select__scroll",
      // Оболонка при скролі
      classSelectOption: "select__option",
      // Пункт
      classSelectContent: "select__content",
      // Оболонка контенту в заголовку
      classSelectRow: "select__row",
      // Ряд
      classSelectData: "select__asset",
      // Додаткові дані
      classSelectDisabled: "--select-disabled",
      // Заборонено
      classSelectTag: "--select-tag",
      // Клас тега
      classSelectOpen: "--select-open",
      // Список відкритий
      classSelectActive: "--select-active",
      // Список вибрано
      classSelectFocus: "--select-focus",
      // Список у фокусі
      classSelectMultiple: "--select-multiple",
      // Мультивибір
      classSelectCheckBox: "--select-checkbox",
      // Стиль чекбоксу
      classSelectOptionSelected: "--select-selected",
      // Вибраний пункт
      classSelectPseudoLabel: "--select-pseudo-label"
      // Псевдолейбл
    };
    this._this = this;
    if (this.config.init) {
      const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll("select[data-fls-select]");
      if (selectItems.length) {
        this.selectsInit(selectItems);
      }
    }
  }
  // Конструктор CSS класу
  getSelectClass(className) {
    return `.${className}`;
  }
  // Геттер елементів псевдоселекту
  getSelectElement(selectItem, className) {
    return {
      originalSelect: selectItem.querySelector("select"),
      selectElement: selectItem.querySelector(this.getSelectClass(className))
    };
  }
  // Функція ініціалізації всіх селектів
  selectsInit(selectItems) {
    selectItems.forEach((originalSelect, index) => {
      this.selectInit(originalSelect, index + 1);
    });
    document.addEventListener("click", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusin", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusout", (function(e) {
      this.selectsActions(e);
    }).bind(this));
  }
  // Функція ініціалізації конкретного селекту
  selectInit(originalSelect, index) {
    index ? originalSelect.dataset.flsSelectId = index : null;
    if (originalSelect.options.length) {
      const _this = this;
      let selectItem = document.createElement("div");
      selectItem.classList.add(this.selectClasses.classSelect);
      originalSelect.parentNode.insertBefore(selectItem, originalSelect);
      selectItem.appendChild(originalSelect);
      originalSelect.hidden = true;
      if (this.getSelectPlaceholder(originalSelect)) {
        originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
        if (this.getSelectPlaceholder(originalSelect).label.show) {
          const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
          selectItemTitle.insertAdjacentHTML("afterbegin", `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
        }
      }
      selectItem.insertAdjacentHTML("beforeend", `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
      this.selectBuild(originalSelect);
      originalSelect.dataset.flsSelectSpeed = originalSelect.dataset.flsSelectSpeed ? originalSelect.dataset.flsSelectSpeed : this.config.speed;
      this.config.speed = +originalSelect.dataset.flsSelectSpeed;
      originalSelect.addEventListener("change", function(e) {
        _this.selectChange(e);
      });
    }
  }
  // Конструктор псевдоселекту
  selectBuild(originalSelect) {
    const selectItem = originalSelect.parentElement;
    if (originalSelect.id) {
      selectItem.id = originalSelect.id;
      originalSelect.removeAttribute("id");
    }
    selectItem.dataset.flsSelectId = originalSelect.dataset.flsSelectId;
    originalSelect.dataset.flsSelectModif ? selectItem.classList.add(`select--${originalSelect.dataset.flsSelectModif}`) : null;
    originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
    originalSelect.hasAttribute("data-fls-select-checkbox") && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setOptions(selectItem, originalSelect);
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
    originalSelect.hasAttribute("data-fls-select-open") ? this.selectAction(selectItem) : null;
    this.selectDisabled(selectItem, originalSelect);
  }
  // Функція реакцій на події
  selectsActions(e) {
    const t = e.target, type = e.type;
    const isSelect = t.closest(this.getSelectClass(this.selectClasses.classSelect));
    const isTag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
    if (!isSelect && !isTag) return this.selectsСlose();
    const selectItem = isSelect || document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${isTag.dataset.flsSelectId}"]`);
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    if (originalSelect.disabled) return;
    if (type === "click") {
      const tag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
      const title = t.closest(this.getSelectClass(this.selectClasses.classSelectTitle));
      const option = t.closest(this.getSelectClass(this.selectClasses.classSelectOption));
      if (tag) {
        const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${tag.dataset.flsSelectId}"] .select__option[data-fls-select-value="${tag.dataset.flsSelectValue}"]`);
        this.optionAction(selectItem, originalSelect, optionItem);
      } else if (title) {
        this.selectAction(selectItem);
      } else if (option) {
        this.optionAction(selectItem, originalSelect, option);
      }
    } else if (type === "focusin" || type === "focusout") {
      if (isSelect) selectItem.classList.toggle(this.selectClasses.classSelectFocus, type === "focusin");
    } else if (type === "keydown" && e.code === "Escape") {
      this.selectsСlose();
    }
  }
  // Функція закриття всіх селектів
  selectsСlose(selectOneGroup) {
    const selectsGroup = selectOneGroup ? selectOneGroup : document;
    const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
    if (selectActiveItems.length) {
      selectActiveItems.forEach((selectActiveItem) => {
        this.selectСlose(selectActiveItem);
      });
    }
  }
  // Функція закриття конкретного селекту
  selectСlose(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    if (!selectOptions.classList.contains("_slide")) {
      selectItem.classList.remove(this.selectClasses.classSelectOpen);
      slideUp(selectOptions, originalSelect.dataset.flsSelectSpeed);
      setTimeout(() => {
        selectItem.style.zIndex = "";
      }, originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Функція відкриття/закриття конкретного селекту
  selectAction(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
    const selectOpenzIndex = originalSelect.dataset.flsSelectZIndex ? originalSelect.dataset.flsSelectZIndex : 3;
    this.setOptionsPosition(selectItem);
    if (originalSelect.closest("[data-fls-select-one]")) {
      const selectOneGroup = originalSelect.closest("[data-fls-select-one]");
      this.selectsСlose(selectOneGroup);
    }
    setTimeout(() => {
      if (!selectOptions.classList.contains("--slide")) {
        selectItem.classList.toggle(this.selectClasses.classSelectOpen);
        slideToggle(selectOptions, originalSelect.dataset.flsSelectSpeed);
        if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
          selectItem.style.zIndex = selectOpenzIndex;
        } else {
          setTimeout(() => {
            selectItem.style.zIndex = "";
          }, originalSelect.dataset.flsSelectSpeed);
        }
      }
    }, 0);
  }
  // Сеттер значення заголовка селекту
  setSelectTitleValue(selectItem, originalSelect) {
    const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
    const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
    if (selectItemTitle) selectItemTitle.remove();
    selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
  }
  // Конструктор значення заголовка
  getSelectTitleValue(selectItem, originalSelect) {
    let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
    if (originalSelect.multiple && originalSelect.hasAttribute("data-fls-select-tags")) {
      selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map((option) => `<span role="button" data-fls-select-id="${selectItem.dataset.flsSelectId}" data-fls-select-value="${option.value}" class="--select-tag">${this.getSelectElementContent(option)}</span>`).join("");
      if (originalSelect.dataset.flsSelectTags && document.querySelector(originalSelect.dataset.flsSelectTags)) {
        document.querySelector(originalSelect.dataset.flsSelectTags).innerHTML = selectTitleValue;
        if (originalSelect.hasAttribute("data-fls-select-search")) selectTitleValue = false;
      }
    }
    selectTitleValue = selectTitleValue.length ? selectTitleValue : originalSelect.dataset.flsSelectPlaceholder || "";
    if (!originalSelect.hasAttribute("data-fls-select-tags")) {
      selectTitleValue = selectTitleValue ? selectTitleValue.map((item) => item.replace(/"/g, "&quot;")) : "";
    }
    let pseudoAttribute = "";
    let pseudoAttributeClass = "";
    if (originalSelect.hasAttribute("data-fls-select-pseudo-label")) {
      pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Заповніть атрибут"`;
      pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
    }
    this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
    if (originalSelect.hasAttribute("data-fls-select-search")) {
      return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-fls-select-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
    } else {
      const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass}` : "";
      return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
    }
  }
  // Конструктор даних для значення заголовка
  getSelectElementContent(selectOption) {
    const selectOptionData = selectOption.dataset.flsSelectAsset ? `${selectOption.dataset.flsSelectAsset}` : "";
    const selectOptionDataHTML = selectOptionData.indexOf("img") >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
    let selectOptionContentHTML = ``;
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : "";
    selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : "";
    selectOptionContentHTML += selectOption.textContent;
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    return selectOptionContentHTML;
  }
  // Отримання даних плейсхолдера
  getSelectPlaceholder(originalSelect) {
    const selectPlaceholder = Array.from(originalSelect.options).find((option) => !option.value);
    if (selectPlaceholder) {
      return {
        value: selectPlaceholder.textContent,
        show: selectPlaceholder.hasAttribute("data-fls-select-show"),
        label: {
          show: selectPlaceholder.hasAttribute("data-fls-select-label"),
          text: selectPlaceholder.dataset.flsSelectLabel
        }
      };
    }
  }
  // Отримання даних із вибраних елементів
  getSelectedOptionsData(originalSelect, type) {
    let selectedOptions = [];
    if (originalSelect.multiple) {
      selectedOptions = Array.from(originalSelect.options).filter((option) => option.value).filter((option) => option.selected);
    } else {
      selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
    }
    return {
      elements: selectedOptions.map((option) => option),
      values: selectedOptions.filter((option) => option.value).map((option) => option.value),
      html: selectedOptions.map((option) => this.getSelectElementContent(option))
    };
  }
  // Конструктор елементів списку
  getOptions(originalSelect) {
    const selectOptionsScroll = originalSelect.hasAttribute("data-fls-select-scroll") ? `` : "";
    +originalSelect.dataset.flsSelectScroll ? +originalSelect.dataset.flsSelectScroll : null;
    let selectOptions = Array.from(originalSelect.options);
    if (selectOptions.length > 0) {
      let selectOptionsHTML = ``;
      if (this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show || originalSelect.multiple) {
        selectOptions = selectOptions.filter((option) => option.value);
      }
      selectOptionsHTML += `<div ${selectOptionsScroll} ${""} class="${this.selectClasses.classSelectOptionsScroll}">`;
      selectOptions.forEach((selectOption) => {
        selectOptionsHTML += this.getOption(selectOption, originalSelect);
      });
      selectOptionsHTML += `</div>`;
      return selectOptionsHTML;
    }
  }
  // Конструктор конкретного елемента списку
  getOption(selectOption, originalSelect) {
    const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : "";
    const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute("data-fls-select-show-selected") && !originalSelect.multiple ? `hidden` : ``;
    const selectOptionClass = selectOption.dataset.flsSelectClass ? ` ${selectOption.dataset.flsSelectClass}` : "";
    const selectOptionLink = selectOption.dataset.flsSelectHref ? selectOption.dataset.flsSelectHref : false;
    const selectOptionLinkTarget = selectOption.hasAttribute("data-fls-select-href-blank") ? `target="_blank"` : "";
    let selectOptionHTML = ``;
    selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-fls-select-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-fls-select-value="${selectOption.value}" type="button">`;
    selectOptionHTML += this.getSelectElementContent(selectOption);
    selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
    return selectOptionHTML;
  }
  // Сеттер елементів списку (options)
  setOptions(selectItem, originalSelect) {
    const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectItemOptions.innerHTML = this.getOptions(originalSelect);
  }
  // Визначаємо, де видобразити випадаючий список
  setOptionsPosition(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
    const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? `${+originalSelect.dataset.flsSelectScroll}px` : ``;
    const selectOptionsPosMargin = +originalSelect.dataset.flsSelectOptionsMargin ? +originalSelect.dataset.flsSelectOptionsMargin : 10;
    if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
      selectOptions.hidden = false;
      const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue("max-height"));
      const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
      const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
      selectOptions.hidden = true;
      const selectItemHeight = selectItem.offsetHeight;
      const selectItemPos = selectItem.getBoundingClientRect().top;
      const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
      const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);
      if (selectItemResult < 0) {
        const newMaxHeightValue = selectOptionsHeight + selectItemResult;
        if (newMaxHeightValue < 100) {
          selectItem.classList.add("select--show-top");
          selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
        } else {
          selectItem.classList.remove("select--show-top");
          selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
        }
      }
    } else {
      setTimeout(() => {
        selectItem.classList.remove("select--show-top");
        selectItemScroll.style.maxHeight = customMaxHeightValue;
      }, +originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Обробник кліку на пункт списку
  optionAction(selectItem, originalSelect, optionItem) {
    const optionsBox = selectItem.querySelector(this.getSelectClass(this.selectClasses.classSelectOptions));
    if (optionsBox.classList.contains("--slide")) return;
    if (originalSelect.multiple) {
      optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
      const selectedEls = this.getSelectedOptionsData(originalSelect).elements;
      for (const el of selectedEls) {
        el.removeAttribute("selected");
      }
      const selectedUI = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
      for (const el of selectedUI) {
        const val = el.dataset.flsSelectValue;
        const opt = originalSelect.querySelector(`option[value="${val}"]`);
        if (opt) opt.setAttribute("selected", "selected");
      }
    } else {
      if (!originalSelect.hasAttribute("data-fls-select-show-selected")) {
        setTimeout(() => {
          const hiddenOpt = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`);
          if (hiddenOpt) hiddenOpt.hidden = false;
          optionItem.hidden = true;
        }, this.config.speed);
      }
      originalSelect.value = optionItem.dataset.flsSelectValue || optionItem.textContent;
      this.selectAction(selectItem);
    }
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Реакція на зміну оригінального select
  selectChange(e) {
    const originalSelect = e.target;
    this.selectBuild(originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Обробник зміни у селекті
  setSelectChange(originalSelect) {
    if (originalSelect.hasAttribute("data-fls-select-validate")) {
      formValidate.validateInput(originalSelect);
    }
    if (originalSelect.hasAttribute("data-fls-select-submit") && originalSelect.value) {
      let tempButton = document.createElement("button");
      tempButton.type = "submit";
      originalSelect.closest("form").append(tempButton);
      tempButton.click();
      tempButton.remove();
    }
    const selectItem = originalSelect.parentElement;
    this.selectCallback(selectItem, originalSelect);
  }
  // Обробник disabled
  selectDisabled(selectItem, originalSelect) {
    if (originalSelect.disabled) {
      selectItem.classList.add(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
    } else {
      selectItem.classList.remove(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
    }
  }
  // Обробник пошуку за елементами списку
  searchActions(selectItem) {
    const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectInput.addEventListener("input", () => {
      const inputValue = selectInput.value.toLowerCase();
      const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
      selectOptionsItems.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        item.hidden = !itemText.includes(inputValue);
      });
      if (selectOptions.hidden) {
        this.selectAction(selectItem);
      }
    });
  }
  // Коллбек функція
  selectCallback(selectItem, originalSelect) {
    document.dispatchEvent(new CustomEvent("selectCallback", {
      detail: {
        select: originalSelect
      }
    }));
  }
}
document.querySelector("select[data-fls-select]") ? window.addEventListener("load", () => window.flsSelect = new SelectConstructor({})) : null;
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody(spollersBlock, false);
        }
      });
    }, initSpollerBody = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    document.addEventListener("click", setSpollerAction);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
class Popup {
  constructor(options) {
    let config = {
      logging: true,
      init: true,
      //Для кнопок
      attributeOpenButton: "data-fls-popup-link",
      // Атрибут для кнопки, яка викликає попап
      attributeCloseButton: "data-fls-popup-close",
      // Атрибут для кнопки, що закриває попап
      // Для сторонніх об'єктів
      fixElementSelector: "[data-fls-lp]",
      // Атрибут для елементів із лівим паддингом (які fixed)
      // Для об'єкту попапа
      attributeMain: "data-fls-popup",
      youtubeAttribute: "data-fls-popup-youtube",
      // Атрибут для коду youtube
      youtubePlaceAttribute: "data-fls-popup-youtube-place",
      // Атрибут для вставки ролика youtube
      setAutoplayYoutube: true,
      // Зміна класів
      classes: {
        popup: "popup",
        // popupWrapper: 'popup__wrapper',
        popupContent: "data-fls-popup-body",
        popupActive: "data-fls-popup-active",
        // Додається для попапа, коли він відкривається
        bodyActive: "data-fls-popup-open"
        // Додається для боді, коли попап відкритий
      },
      focusCatch: true,
      // Фокус усередині попапа зациклений
      closeEsc: true,
      // Закриття ESC
      bodyLock: true,
      // Блокування скролла
      hashSettings: {
        location: true,
        // Хеш в адресному рядку
        goHash: true
        // Перехід по наявності в адресному рядку
      },
      on: {
        // Події
        beforeOpen: function() {
        },
        afterOpen: function() {
        },
        beforeClose: function() {
        },
        afterClose: function() {
        }
      }
    };
    this.youTubeCode;
    this.isOpen = false;
    this.targetOpen = {
      selector: false,
      element: false
    };
    this.previousOpen = {
      selector: false,
      element: false
    };
    this.lastClosed = {
      selector: false,
      element: false
    };
    this._dataValue = false;
    this.hash = false;
    this._reopen = false;
    this._selectorOpen = false;
    this.lastFocusEl = false;
    this._focusEl = [
      "a[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "button:not([disabled]):not([aria-hidden])",
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "area[href]",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"])'
    ];
    this.options = {
      ...config,
      ...options,
      classes: {
        ...config.classes,
        ...options?.classes
      },
      hashSettings: {
        ...config.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...config.on,
        ...options?.on
      }
    };
    this.bodyLock = false;
    this.options.init ? this.initPopups() : null;
  }
  initPopups() {
    this.buildPopup();
    this.eventsPopup();
  }
  buildPopup() {
  }
  eventsPopup() {
    document.addEventListener(
      "click",
      (function(e) {
        const buttonOpen = e.target.closest(
          `[${this.options.attributeOpenButton}]`
        );
        if (buttonOpen) {
          e.preventDefault();
          this._dataValue = buttonOpen.getAttribute(
            this.options.attributeOpenButton
          ) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
          this.youTubeCode = buttonOpen.getAttribute(
            this.options.youtubeAttribute
          ) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
          if (this._dataValue !== "error") {
            if (!this.isOpen) this.lastFocusEl = buttonOpen;
            this.targetOpen.selector = `${this._dataValue}`;
            this._selectorOpen = true;
            this.open();
            return;
          }
          return;
        }
        const buttonClose = e.target.closest(
          `[${this.options.attributeCloseButton}]`
        );
        if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
          e.preventDefault();
          this.close();
          return;
        }
      }).bind(this)
    );
    document.addEventListener(
      "keydown",
      (function(e) {
        if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
          e.preventDefault();
          this.close();
          return;
        }
        if (this.options.focusCatch && e.which == 9 && this.isOpen) {
          this._focusCatch(e);
          return;
        }
      }).bind(this)
    );
    if (this.options.hashSettings.goHash) {
      window.addEventListener(
        "hashchange",
        (function() {
          if (window.location.hash) {
            this._openToHash();
          } else {
            this.close(this.targetOpen.selector);
          }
        }).bind(this)
      );
      if (window.location.hash) {
        this._openToHash();
      }
    }
  }
  open(selectorValue) {
    if (bodyLockStatus) {
      this.bodyLock = document.documentElement.hasAttribute("data-fls-scrolllock") && !this.isOpen ? true : false;
      if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen)
        this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;
      this.targetOpen.element = document.querySelector(
        `[${this.options.attributeMain}=${this.targetOpen.selector}]`
      );
      if (this.targetOpen.element) {
        const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(
          `${this.options.youtubeAttribute}`
        );
        if (codeVideo) {
          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
          const iframe = document.createElement("iframe");
          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
          iframe.setAttribute("src", urlVideo);
          if (!this.targetOpen.element.querySelector(
            `[${this.options.youtubePlaceAttribute}]`
          )) {
            this.targetOpen.element.querySelector("[data-fls-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
          }
          this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          this._getHash();
          this._setHash();
        }
        this.options.on.beforeOpen(this);
        document.dispatchEvent(
          new CustomEvent("beforePopupOpen", {
            detail: {
              popup: this
            }
          })
        );
        this.targetOpen.element.setAttribute(
          this.options.classes.popupActive,
          ""
        );
        document.documentElement.setAttribute(
          this.options.classes.bodyActive,
          ""
        );
        if (!this._reopen) {
          !this.bodyLock ? bodyLock() : null;
        } else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;
        setTimeout(() => {
          this._focusTrap();
        }, 50);
        this.options.on.afterOpen(this);
        document.dispatchEvent(
          new CustomEvent("afterPopupOpen", {
            detail: {
              popup: this
            }
          })
        );
      }
    }
  }
  close(selectorValue) {
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    if (!this.isOpen || !bodyLockStatus) {
      return;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(
      new CustomEvent("beforePopupClose", {
        detail: {
          popup: this
        }
      })
    );
    if (this.targetOpen.element.querySelector(
      `[${this.options.youtubePlaceAttribute}]`
    )) {
      setTimeout(() => {
        this.targetOpen.element.querySelector(
          `[${this.options.youtubePlaceAttribute}]`
        ).innerHTML = "";
      }, 500);
    }
    this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
    this.previousOpen.element.setAttribute("aria-hidden", "true");
    if (!this._reopen) {
      document.documentElement.removeAttribute(this.options.classes.bodyActive);
      !this.bodyLock ? bodyUnlock() : null;
      this.isOpen = false;
    }
    this._removeHash();
    if (this._selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(
      new CustomEvent("afterPopupClose", {
        detail: {
          popup: this
        }
      })
    );
    setTimeout(() => {
      this._focusTrap();
    }, 50);
  }
  // Отримання хешу
  _getHash() {
    if (this.options.hashSettings.location) {
      this.hash = `#${this.targetOpen.selector}`;
    }
  }
  _openToHash() {
    let classInHash = window.location.hash.replace("#", "");
    const openButton = document.querySelector(
      `[${this.options.attributeOpenButton}="${classInHash}"]`
    );
    if (openButton) {
      this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
    }
    if (classInHash) this.open(classInHash);
  }
  // Встановлення хеша
  _setHash() {
    history.pushState("", "", this.hash);
  }
  _removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  _focusCatch(e) {
    const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
    const focusArray = Array.prototype.slice.call(focusable);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  _focusTrap() {
    if (!this.previousOpen.element) return;
    const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
    if (!this.isOpen) {
      if (this.lastFocusEl && typeof this.lastFocusEl.focus === "function") {
        this.lastFocusEl.focus();
      }
      return;
    }
    if (focusable.length) {
      focusable[0].focus();
    }
  }
  // _focusTrap() {
  //   const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
  //   if (!this.isOpen && this.lastFocusEl) {
  //     this.lastFocusEl.focus();
  //   } else {
  //     focusable[0].focus();
  //   }
  // }
}
document.querySelector("[data-fls-popup]") ? window.addEventListener("load", () => window.flsPopup = new Popup({})) : null;
function menuInit() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu__list .menu__link--hover").forEach((link) => {
    link.classList.remove("menu__link--active");
  });
  document.querySelectorAll(".menu__list .menu__link--hover").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("menu__link--active");
    }
  });
  const homeLink = document.querySelector(".menu__link-home");
  if (homeLink && (currentPage === "index.html" || currentPage === "")) {
    homeLink.classList.add("menu__link--active");
  }
  document.querySelectorAll(".menu__dropdown-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("menu__link--active");
    }
  });
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("[data-header-login]");
  const signupBtn = document.querySelector("[data-header-signup]");
  const signupWrapper = signupBtn?.closest(".signup-wrapper");
  const profileWrapper = document.querySelector(
    "[data-header-profile-wrapper]"
  );
  const loggedButtons = document.querySelectorAll(
    "[data-profile-myprofile], [data-profile-logout]"
  );
  function setUserLoggedIn() {
    localStorage.setItem("loggedIn", "true");
    if (loginBtn) loginBtn.style.display = "none";
    if (signupWrapper) signupWrapper.classList.add("is-hidden");
    profileWrapper?.removeAttribute("hidden");
    loggedButtons.forEach((btn) => {
      const item = btn.closest("li") || btn;
      item.classList.remove("is-logged-hidden");
    });
  }
  function setUserLoggedOut() {
    localStorage.removeItem("loggedIn");
    if (loginBtn) loginBtn.style.display = "block";
    if (signupWrapper) signupWrapper.classList.remove("is-hidden");
    profileWrapper?.setAttribute("hidden", "");
    loggedButtons.forEach((btn) => {
      const item = btn.closest("li") || btn;
      item.classList.add("is-logged-hidden");
    });
  }
  if (localStorage.getItem("loggedIn") === "true") {
    setUserLoggedIn();
  } else {
    setUserLoggedOut();
  }
  const allLogoutButtons = document.querySelectorAll("[data-profile-logout]");
  allLogoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.flsPopup?.open?.("logout");
    });
  });
  const modalYesLogout = document.querySelector(".button-logout");
  modalYesLogout?.addEventListener("click", () => {
    setUserLoggedOut();
    window.flsPopup?.close?.("logout");
    window.location.href = "/";
  });
});
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => window.flsDynamic = new DynamicAdapt());
}
document.addEventListener("DOMContentLoaded", () => {
  const continueBtn = document.querySelector(".btn-success-continue");
  if (!continueBtn) return;
  continueBtn.addEventListener("click", () => {
    localStorage.setItem("loggedIn", "true");
    if (window.flsPopup?.close) {
      window.flsPopup.close();
    }
    setTimeout(() => {
      window.location.href = "index.html";
    }, 300);
  });
  console.log("✅ Successful module loaded");
});
document.addEventListener("DOMContentLoaded", () => {
  const waitForPopup = setInterval(() => {
    if (window.flsPopup) {
      clearInterval(waitForPopup);
      initPaymentHandler$1();
    }
  }, 100);
});
function initPaymentHandler$1() {
  const cardNumber = document.getElementById("pc-card-number");
  const cardExp = document.getElementById("pc-exp");
  const cardCvc = document.getElementById("pc-cvc");
  const btnCardPay = document.getElementById("pc-pay-btn");
  if (!cardNumber || !cardExp || !cardCvc || !btnCardPay) {
    console.warn("Один або більше елементів платежу не знайдено");
    return;
  }
  cardNumber.addEventListener("input", () => {
    let v = cardNumber.value.replace(/\D/g, "").substring(0, 16);
    cardNumber.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  cardExp.addEventListener("input", () => {
    let v = cardExp.value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 3) {
      v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    cardExp.value = v;
  });
  cardCvc.addEventListener("input", () => {
    cardCvc.value = cardCvc.value.replace(/\D/g, "").substring(0, 4);
  });
  function showError(input, message = "") {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
    if (message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "input-error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "#dc3545";
      errorDiv.style.fontSize = "12px";
      errorDiv.style.marginTop = "4px";
      input.insertAdjacentElement("afterend", errorDiv);
    }
  }
  function showSuccess(input) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
  }
  function validateCardNumber() {
    const cleaned = cardNumber.value.replace(/\s/g, "");
    if (!cleaned) {
      showError(cardNumber, "Enter card number");
      return false;
    }
    if (cleaned.length !== 16) {
      showError(cardNumber, "Card number must be 16 digits");
      return false;
    }
    if (!/^\d{16}$/.test(cleaned)) {
      showError(cardNumber, "Only numbers allowed");
      return false;
    }
    showSuccess(cardNumber);
    return true;
  }
  function validateExpiry() {
    const value = cardExp.value.trim();
    if (!value || !value.includes("/")) {
      showError(cardExp, "Enter expiry date MM/YY");
      return false;
    }
    const [mm, yy] = value.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt(yy, 10);
    if (!mm || !yy) {
      showError(cardExp, "Enter expiry date MM/YY");
      return false;
    }
    if (month < 1 || month > 12) {
      showError(cardExp, "Month must be 01-12");
      return false;
    }
    const currentDate = /* @__PURE__ */ new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (year === currentYear && month < currentMonth) {
      showError(cardExp, "Card has expired");
      return false;
    }
    if (year < currentYear) {
      showError(cardExp, "Card has expired");
      return false;
    }
    showSuccess(cardExp);
    return true;
  }
  function validateCVC() {
    const value = cardCvc.value.trim();
    if (!value) {
      showError(cardCvc, "Enter CVC");
      return false;
    }
    if (value.length < 3 || value.length > 4) {
      showError(cardCvc, "CVC must be 3-4 digits");
      return false;
    }
    if (!/^\d+$/.test(value)) {
      showError(cardCvc, "Only numbers allowed");
      return false;
    }
    showSuccess(cardCvc);
    return true;
  }
  function validateAll() {
    const isCardValid = validateCardNumber();
    const isExpValid = validateExpiry();
    const isCvcValid = validateCVC();
    return isCardValid && isExpValid && isCvcValid;
  }
  cardNumber.addEventListener("blur", validateCardNumber);
  cardExp.addEventListener("blur", validateExpiry);
  cardCvc.addEventListener("blur", validateCVC);
  cardNumber.addEventListener("focus", () => {
    cardNumber.classList.remove("input-error");
  });
  cardExp.addEventListener("focus", () => {
    cardExp.classList.remove("input-error");
  });
  cardCvc.addEventListener("focus", () => {
    cardCvc.classList.remove("input-error");
  });
  btnCardPay.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }
    document.activeElement?.blur();
    window.flsPopup.open("payment-processing");
    setTimeout(() => {
      document.activeElement?.blur();
      window.flsPopup.open("payment-success");
      cardNumber.value = "";
      cardExp.value = "";
      cardCvc.value = "";
      cardNumber.classList.remove("input-error", "input-success");
      cardExp.classList.remove("input-error", "input-success");
      cardCvc.classList.remove("input-error", "input-success");
      document.querySelectorAll(".input-error-message").forEach((el) => el.remove());
    }, 3e3);
  });
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.activeElement?.blur();
      window.flsPopup.open("payment-processing");
      setTimeout(() => {
        document.activeElement?.blur();
        window.flsPopup.open("payment-success");
      }, 3e3);
    });
  });
  const cryptoDatabase = {
    1: {
      label: "Bitcoin",
      symbol: "BTC",
      amount: "0.00158039",
      addresses: {
        bitcoin: "3PGgmpAxfzDSyPAGPqdL2oe5yS78UytENU"
      }
    },
    2: {
      label: "Ethereum",
      symbol: "ETH",
      amount: "0.05234567",
      addresses: {
        ethereum: "0x742d35Cc6634C0532925a3b844Bc9e7595f42CD5"
      }
    },
    3: {
      label: "Litecoin",
      symbol: "LTC",
      amount: "0.123456",
      addresses: {
        litecoin: "LhQcyqfQzN5ZPZSg6BEKqqKN5S9VzC9PRT"
      }
    },
    4: {
      label: "Ripple (XRP)",
      symbol: "XRP",
      amount: "123.456789",
      addresses: {
        ripple: "rN7n7otQDd6FczFgLdhmKJW5bZHQhqTNkJ"
      }
    }
  };
  const cryptoSelect1 = document.querySelector(
    '[data-fls-popup="payment-select"] .payment--crypto select'
  );
  const cryptoSelect2 = document.querySelector(
    '[data-fls-popup="payment-crypto"] select'
  );
  const cryptoPayBtn = document.querySelector(
    '[data-fls-popup="payment-crypto"] .payment__actions .button'
  );
  if (cryptoPayBtn) {
    cryptoPayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const crypto1Value = cryptoSelect1?.value || "1";
      const crypto2Value = cryptoSelect2?.value || "bitcoin";
      const cryptoData = cryptoDatabase[crypto1Value] || cryptoDatabase["1"];
      const address = cryptoData.addresses[crypto2Value] || Object.values(cryptoData.addresses)[0];
      const amountEl = document.getElementById("crypto-amount");
      const blockchainEl = document.getElementById("crypto-blockchain");
      const addressEl = document.getElementById("crypto-address");
      if (amountEl)
        amountEl.textContent = `${cryptoData.amount} ${cryptoData.symbol}`;
      if (blockchainEl)
        blockchainEl.textContent = cryptoSelect2?.options[cryptoSelect2.selectedIndex].text || "Bitcoin (BTC) Blockchain";
      if (addressEl) addressEl.textContent = address;
      document.activeElement?.blur();
      window.flsPopup.open("payment-processing");
      setTimeout(() => {
        document.activeElement?.blur();
        window.flsPopup.open("payment-success");
      }, 3e3);
    });
  }
  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const phoneInput = document.getElementById("phone-input");
  const applyBtn = document.querySelector(
    '[data-fls-popup="application"] .button-subscription'
  );
  function showFieldError(input, message) {
    input.classList.add("input-error");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
    if (message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "input-error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "#dc3545";
      errorDiv.style.fontSize = "12px";
      errorDiv.style.marginTop = "4px";
      input.insertAdjacentElement("afterend", errorDiv);
    }
  }
  function removeFieldError(input) {
    input.classList.remove("input-error");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
  }
  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      showFieldError(nameInput, "Enter your name");
      return false;
    }
    if (value.length < 2) {
      showFieldError(nameInput, "Name must be at least 2 characters");
      return false;
    }
    removeFieldError(nameInput);
    return true;
  }
  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      showFieldError(emailInput, "Enter your email");
      return false;
    }
    if (!emailRegex.test(value)) {
      showFieldError(emailInput, "Enter a valid email");
      return false;
    }
    removeFieldError(emailInput);
    return true;
  }
  function validatePhone() {
    const value = phoneInput.value.trim();
    if (!value) {
      showFieldError(phoneInput, "Enter your phone");
      return false;
    }
    if (value.length < 10) {
      showFieldError(phoneInput, "Phone must be at least 10 characters");
      return false;
    }
    removeFieldError(phoneInput);
    return true;
  }
  if (nameInput) {
    nameInput.addEventListener("blur", validateName);
    nameInput.addEventListener("focus", () => removeFieldError(nameInput));
  }
  if (emailInput) {
    emailInput.addEventListener("blur", validateEmail);
    emailInput.addEventListener("focus", () => removeFieldError(emailInput));
  }
  if (phoneInput) {
    phoneInput.addEventListener("blur", validatePhone);
    phoneInput.addEventListener("focus", () => removeFieldError(phoneInput));
  }
  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      if (!isNameValid || !isEmailValid || !isPhoneValid) {
        return;
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const signupPopup = document.querySelector('[data-fls-popup="signup"]');
  if (!signupPopup) return;
  const form = signupPopup.querySelector("[data-signup-form]");
  const nameInput = form.querySelector("#signup-username");
  const emailInput = form.querySelector("#signup-email");
  const passwordInput = form.querySelector("#signup-password");
  const checkboxInput = form.querySelector("#cbx");
  const submitBtn = form.querySelector("[data-signup-submit]");
  function showError(field, text = field.validationMessage) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function isStrongPassword(val) {
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /\d/.test(val);
    return val.length >= 8 && hasUpper && hasLower && hasNumber;
  }
  function validateField(field) {
    if (field === nameInput) {
      const val = field.value.trim();
      if (val.length < 3 || val.length > 20) {
        showError(field, "Username must be 3-20 characters");
        return false;
      }
      removeError(field);
      return true;
    }
    if (field === emailInput) {
      if (!field.checkValidity()) {
        showError(field, "Invalid email");
        return false;
      }
      removeError(field);
      return true;
    }
    if (field === passwordInput) {
      const val = field.value;
      if (!isStrongPassword(val)) {
        showError(field, "Min 8 chars with uppercase, lowercase and a number");
        return false;
      }
      removeError(field);
      return true;
    }
    return true;
  }
  function checkFormValidity() {
    const a = validateField(nameInput);
    const b = validateField(emailInput);
    const c = validateField(passwordInput);
    const d = checkboxInput.checked;
    if (!d) {
      const label = form.querySelector(".check__text");
      if (label && !label.nextElementSibling?.classList?.contains(
        "form-error-text-checkbox"
      )) {
        const err = document.createElement("div");
        err.className = "form-error-text-checkbox";
        err.textContent = "You must accept terms";
        label.insertAdjacentElement("afterend", err);
      }
    } else {
      const label = form.querySelector(".check__text");
      if (label?.nextElementSibling?.classList?.contains(
        "form-error-text-checkbox"
      )) {
        label.nextElementSibling.remove();
      }
    }
    submitBtn.disabled = !(a && b && c && d);
  }
  [nameInput, emailInput, passwordInput].forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      checkFormValidity();
    });
    field.addEventListener("blur", () => {
      validateField(field);
      checkFormValidity();
    });
    field.addEventListener("change", checkFormValidity);
  });
  checkboxInput.addEventListener("change", checkFormValidity);
  checkFormValidity();
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    window.flsPopup?.open?.("email-verification");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const waitForPopup = setInterval(() => {
    if (window.flsPopup) {
      clearInterval(waitForPopup);
      initPaymentHandler();
    }
  }, 100);
});
function initPaymentHandler() {
  const cardNumber = document.getElementById("pc-card-number");
  const cardExp = document.getElementById("pc-exp");
  const cardCvc = document.getElementById("pc-cvc");
  const btnCardPay = document.getElementById("pc-card-pay-btn");
  if (!cardNumber || !cardExp || !cardCvc || !btnCardPay) {
    console.warn("Один або більше елементів платежу не знайдено");
    return;
  }
  cardNumber.addEventListener("input", () => {
    let v = cardNumber.value.replace(/\D/g, "").substring(0, 16);
    cardNumber.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  cardExp.addEventListener("input", () => {
    let v = cardExp.value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 3) {
      v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    cardExp.value = v;
  });
  cardCvc.addEventListener("input", () => {
    cardCvc.value = cardCvc.value.replace(/\D/g, "").substring(0, 4);
  });
  function showError(input, message = "") {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
    if (message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "input-error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "#dc3545";
      errorDiv.style.fontSize = "12px";
      errorDiv.style.marginTop = "4px";
      input.insertAdjacentElement("afterend", errorDiv);
    }
  }
  function showSuccess(input) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
    const oldError = input.nextElementSibling;
    if (oldError && oldError.classList.contains("input-error-message")) {
      oldError.remove();
    }
  }
  function validateCardNumber() {
    const cleaned = cardNumber.value.replace(/\s/g, "");
    if (!cleaned) {
      showError(cardNumber, "Enter card number");
      return false;
    }
    if (cleaned.length !== 16) {
      showError(cardNumber, "Card number must be 16 digits");
      return false;
    }
    if (!/^\d{16}$/.test(cleaned)) {
      showError(cardNumber, "Only numbers allowed");
      return false;
    }
    showSuccess(cardNumber);
    return true;
  }
  function validateExpiry() {
    const value = cardExp.value.trim();
    if (!value || !value.includes("/")) {
      showError(cardExp, "Enter expiry date MM/YY");
      return false;
    }
    const [mm, yy] = value.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt(yy, 10);
    if (!mm || !yy) {
      showError(cardExp, "Enter expiry date MM/YY");
      return false;
    }
    if (month < 1 || month > 12) {
      showError(cardExp, "Month must be 01-12");
      return false;
    }
    const currentDate = /* @__PURE__ */ new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (year === currentYear && month < currentMonth) {
      showError(cardExp, "Card has expired");
      return false;
    }
    if (year < currentYear) {
      showError(cardExp, "Card has expired");
      return false;
    }
    showSuccess(cardExp);
    return true;
  }
  function validateCVC() {
    const value = cardCvc.value.trim();
    if (!value) {
      showError(cardCvc, "Enter CVC");
      return false;
    }
    if (value.length < 3 || value.length > 4) {
      showError(cardCvc, "CVC must be 3-4 digits");
      return false;
    }
    if (!/^\d+$/.test(value)) {
      showError(cardCvc, "Only numbers allowed");
      return false;
    }
    showSuccess(cardCvc);
    return true;
  }
  function validateAll() {
    const isCardValid = validateCardNumber();
    const isExpValid = validateExpiry();
    const isCvcValid = validateCVC();
    return isCardValid && isExpValid && isCvcValid;
  }
  cardNumber.addEventListener("blur", validateCardNumber);
  cardExp.addEventListener("blur", validateExpiry);
  cardCvc.addEventListener("blur", validateCVC);
  cardNumber.addEventListener("focus", () => {
    cardNumber.classList.remove("input-error");
  });
  cardExp.addEventListener("focus", () => {
    cardExp.classList.remove("input-error");
  });
  cardCvc.addEventListener("focus", () => {
    cardCvc.classList.remove("input-error");
  });
  btnCardPay.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }
    window.flsPopup.open("payment-processing");
    setTimeout(() => {
      window.flsPopup.open("payment-success");
      cardNumber.value = "";
      cardExp.value = "";
      cardCvc.value = "";
      cardNumber.classList.remove("input-error", "input-success");
      cardExp.classList.remove("input-error", "input-success");
      cardCvc.classList.remove("input-error", "input-success");
      document.querySelectorAll(".input-error-message").forEach((el) => el.remove());
    }, 3e3);
  });
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.flsPopup.open("payment-processing");
      setTimeout(() => {
        window.flsPopup.open("payment-success");
      }, 3e3);
    });
  });
  const cryptoDatabase = {
    1: {
      label: "Bitcoin",
      symbol: "BTC",
      amount: "0.00158039",
      addresses: {
        bitcoin: "3PGgmpAxfzDSyPAGPqdL2oe5yS78UytENU"
      }
    },
    2: {
      label: "Ethereum",
      symbol: "ETH",
      amount: "0.05234567",
      addresses: {
        ethereum: "0x742d35Cc6634C0532925a3b844Bc9e7595f42CD5"
      }
    },
    3: {
      label: "Litecoin",
      symbol: "LTC",
      amount: "0.123456",
      addresses: {
        litecoin: "LhQcyqfQzN5ZPZSg6BEKqqKN5S9VzC9PRT"
      }
    },
    4: {
      label: "Ripple (XRP)",
      symbol: "XRP",
      amount: "123.456789",
      addresses: {
        ripple: "rN7n7otQDd6FczFgLdhmKJW5bZHQhqTNkJ"
      }
    }
  };
  const cryptoSelect1 = document.querySelector(
    '[data-fls-popup="payment-select"] .payment--crypto select'
  );
  const cryptoSelect2 = document.querySelector(
    '[data-fls-popup="payment-crypto"] select'
  );
  const cryptoPayBtn = document.querySelector(
    '[data-fls-popup="crypto-address"] #pc-payment-btn'
  );
  if (cryptoPayBtn) {
    cryptoPayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const crypto1Value = cryptoSelect1?.value || "1";
      const crypto2Value = cryptoSelect2?.value || "bitcoin";
      const cryptoData = cryptoDatabase[crypto1Value] || cryptoDatabase["1"];
      const address = cryptoData.addresses[crypto2Value] || Object.values(cryptoData.addresses)[0];
      const amountEl = document.getElementById("crypto-amount");
      const blockchainEl = document.getElementById("crypto-blockchain");
      const addressEl = document.getElementById("crypto-address");
      if (amountEl)
        amountEl.textContent = `${cryptoData.amount} ${cryptoData.symbol}`;
      if (blockchainEl)
        blockchainEl.textContent = cryptoSelect2?.options[cryptoSelect2.selectedIndex].text || "Bitcoin (BTC) Blockchain";
      if (addressEl) addressEl.textContent = address;
      window.flsPopup.open("payment-processing");
      setTimeout(() => {
        window.flsPopup.open("payment-success");
      }, 2e3);
    });
  }
  const successBtn = document.getElementById("pc-success-continue");
  if (successBtn) {
    successBtn.addEventListener("click", () => {
      window.flsPopup.close();
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const togglers = document.querySelectorAll("[data-fls-passwordeye]");
  togglers.forEach((toggle) => {
    const parent = toggle.closest(".password-wrap");
    const input = parent?.querySelector(
      "input[type='password'], input[type='text']"
    );
    if (!input) return;
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("active", isPassword);
      toggle.setAttribute("aria-pressed", isPassword);
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const logoutPopup = document.querySelector("[data-fls-logout]");
  if (!logoutPopup) return;
  const cancelBtn = logoutPopup.querySelector(".button-cancel");
  const logoutBtn = logoutPopup.querySelector(".button-logout");
  cancelBtn?.addEventListener("click", () => {
    PopupManager.close("logout");
  });
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    PopupManager.closeAll();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 300);
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const loginPopup = document.querySelector('[data-fls-popup="login"]');
  if (!loginPopup) return;
  const signInButtons = document.querySelectorAll("[data-signin]");
  const headerProfile = document.querySelector("[data-header-profile]");
  const menuProfile = document.querySelector("[data-menu-profile]");
  const dropdown = document.querySelector("[data-profile-dropdown]");
  const form = loginPopup.querySelector("[data-login-form]");
  const email = form?.querySelector("#login-email");
  const password = form?.querySelector("#login-password");
  const loginSubmitBtn = form?.querySelector("[data-login-submit]");
  const socialButtons = loginPopup.querySelectorAll(".social-login-btn");
  function showError(field, text) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function checkLoginValidity() {
    if (!form || !loginSubmitBtn) return;
    let valid = true;
    if (!email.checkValidity()) {
      showError(email, "Invalid email");
      valid = false;
    } else {
      removeError(email);
    }
    if (password.value.trim().length < 8) {
      showError(password, "Password must be at least 8 characters");
      valid = false;
    } else {
      removeError(password);
    }
    loginSubmitBtn.disabled = !valid;
  }
  [email, password].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", checkLoginValidity);
    field.addEventListener("blur", checkLoginValidity);
    field.addEventListener("change", checkLoginValidity);
  });
  checkLoginValidity();
  function openSuccessfulLogin() {
    window.flsPopup?.open?.("successful-login");
  }
  loginSubmitBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (loginSubmitBtn.disabled) return;
    openSuccessfulLogin();
  });
  socialButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      openSuccessfulLogin();
    });
  });
  function setLoggedIn() {
    localStorage.setItem("loggedIn", "true");
    signInButtons.forEach((btn) => btn.setAttribute("hidden", true));
    headerProfile?.removeAttribute("hidden");
    menuProfile?.removeAttribute("hidden");
  }
  document.addEventListener("click", (e) => {
    if (e.target.matches(".btn-success-continue")) {
      setLoggedIn();
      window.flsPopup?.close?.("successful-login");
      window.location.href = "index.html";
    }
    ev;
  });
  if (localStorage.getItem("loggedIn") === "true") {
    setLoggedIn();
  }
  headerProfile?.addEventListener("click", () => {
    dropdown?.toggleAttribute("hidden");
  });
  dropdown?.querySelector(".dropdown-item:last-child")?.addEventListener("click", () => {
    dropdown?.setAttribute("hidden", true);
    window.flsPopup?.open?.("logout");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector('[data-fls-popup="forget-second"]');
  if (!popup) return;
  const codeInput = popup.querySelector("#forget-code");
  const submitBtn = popup.querySelector("[data-forget-submit]");
  const resendBtn = popup.querySelector(".resend-btn");
  let timer = null;
  function showError(field, text = "Enter 4 digits") {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function checkCode() {
    const val = codeInput.value.trim();
    const isValid = /^\d{4}$/.test(val);
    if (!isValid && val.length > 0) {
      showError(codeInput);
    } else {
      removeError(codeInput);
    }
    submitBtn.disabled = !isValid;
  }
  codeInput.addEventListener("input", checkCode);
  codeInput.addEventListener("blur", checkCode);
  submitBtn.addEventListener("click", () => {
    if (submitBtn.disabled) return;
    window.flsPopup?.open?.("forget-final");
  });
  function startTimer() {
    let timeLeft = 15;
    resendBtn.disabled = true;
    resendBtn.classList.add("disabled");
    resendBtn.textContent = `Resend in ${timeLeft}s`;
    timer = setInterval(() => {
      timeLeft--;
      resendBtn.textContent = `Resend in ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
        resendBtn.classList.remove("disabled");
        resendBtn.textContent = "Resend code";
      }
    }, 1e3);
  }
  resendBtn.addEventListener("click", () => {
    console.log("Resend code triggered");
    startTimer();
  });
  checkCode();
  startTimer();
});
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector('[data-fls-popup="forget-final"]');
  if (!popup) return;
  const form = popup.querySelector("[data-forgetfinal-form]");
  const passwordInput = form.querySelector("#password-3");
  const confirmInput = form.querySelector("#password-2");
  const submitBtn = form.querySelector("[data-forgetfinal-submit]");
  form.querySelectorAll("[data-fls-passwordeye]");
  function showError(field, text) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function isStrongPassword(val) {
    return val.length >= 8;
  }
  function checkForm() {
    let valid = true;
    if (!isStrongPassword(passwordInput.value)) {
      showError(
        passwordInput,
        "Min 8 chars with uppercase, lowercase and a number"
      );
      valid = false;
    } else {
      removeError(passwordInput);
    }
    if (confirmInput.value !== passwordInput.value || confirmInput.value.length === 0) {
      showError(confirmInput, "Passwords do not match");
      valid = false;
    } else {
      removeError(confirmInput);
    }
    submitBtn.disabled = !valid;
  }
  passwordInput.addEventListener("input", checkForm);
  confirmInput.addEventListener("input", checkForm);
  passwordInput.addEventListener("blur", checkForm);
  confirmInput.addEventListener("blur", checkForm);
  checkForm();
});
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector('[data-fls-popup="forget"]');
  if (!popup) return;
  const form = popup.querySelector("[data-forget-form]");
  const emailInput = form.querySelector("#forget-email");
  const submitBtn = form.querySelector("[data-forget-submit]");
  function showError(field, text = "Invalid email") {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function checkEmail() {
    if (!emailInput.checkValidity()) {
      showError(emailInput);
      submitBtn.disabled = true;
    } else {
      removeError(emailInput);
      submitBtn.disabled = false;
    }
  }
  emailInput.addEventListener("input", checkEmail);
  emailInput.addEventListener("blur", checkEmail);
  submitBtn.addEventListener("click", () => {
    if (submitBtn.disabled) return;
    window.flsPopup?.open?.("forget-second");
  });
  checkEmail();
});
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.querySelector('[data-fls-popup="email-verification"]');
  if (!popup) return;
  const codeInput = popup.querySelector("#verification-code");
  const submitBtn = popup.querySelector("[data-verification-submit]");
  const resendBtn = popup.querySelector(".resend-btn");
  const resendLink = popup.querySelector(".resend-link");
  let timer = null;
  function showError(field, text = "Enter 6 digits") {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.textContent = text;
    } else {
      const errorText = document.createElement("div");
      errorText.className = "form-error-text";
      errorText.textContent = text;
      field.insertAdjacentElement("afterend", errorText);
    }
    field.classList.add("--form-error");
  }
  function removeError(field) {
    if (field.nextElementSibling?.classList.contains("form-error-text")) {
      field.nextElementSibling.remove();
    }
    field.classList.remove("--form-error");
  }
  function checkCode() {
    const val = codeInput.value.trim();
    const isValid = /^\d{6}$/.test(val);
    if (!isValid && val.length > 0) {
      showError(codeInput);
    } else {
      removeError(codeInput);
    }
    submitBtn.disabled = !isValid;
  }
  codeInput.addEventListener("input", checkCode);
  codeInput.addEventListener("blur", checkCode);
  submitBtn.addEventListener("click", () => {
    if (submitBtn.disabled) return;
    window.flsPopup?.open?.("successful");
  });
  function startTimer() {
    let timeLeft = 15;
    resendBtn.disabled = true;
    resendBtn.classList.add("disabled");
    resendBtn.textContent = `Resend in ${timeLeft}s`;
    timer = setInterval(() => {
      timeLeft--;
      resendBtn.textContent = `Resend in ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
        resendBtn.classList.remove("disabled");
        resendBtn.textContent = "Resend code";
      }
    }, 1e3);
  }
  function triggerResend() {
    console.log("Resend code triggered");
    startTimer();
  }
  resendBtn.addEventListener("click", triggerResend);
  resendLink.addEventListener("click", (e) => {
    e.preventDefault();
    triggerResend();
  });
  checkCode();
  startTimer();
});
