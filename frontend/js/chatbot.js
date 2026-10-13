/* =============================================
   Mindfuturetech — Chat assistant (lead capture)
   Self-contained: no libraries, builds its own DOM, loads css/chatbot.css
   (or chatbot.css next to this file if there is no js/ folder).

   Optional settings — define BEFORE this script loads:
     window.MFT_CHATBOT_CONFIG = {
       apiUrl: 'https://api.yourdomain.com/api/v1/chatbot/leads',
       defaultCountryCode: '+91'
     };

   Open it from your own buttons:  MFTChatbot.open()
   ============================================= */
(function () {
  "use strict";

  if (window.__mftChatbotLoaded) return;
  window.__mftChatbotLoaded = true;

  var CONFIG = Object.assign(
    {
      apiUrl: "https://mft.mindfuturetechsupport.com/api/v1/chatbot/leads",
      botName: "MFT Assistant",
      defaultCountryCode: "+91",
      teaserText: "Hi! 👋 Need any help?",
      teaserDelayMs: 4000,
      requestTimeoutMs: 15000,
    },
    window.MFT_CHATBOT_CONFIG || {},
  );

  /* ---------- load the stylesheet that sits next to this script ---------- */
  (function loadCss() {
    var script = document.currentScript;
    if (!script || !script.src) return;
    var href = /\/js\/chatbot\.js(\?.*)?$/.test(script.src)
      ? script.src.replace(/\/js\/chatbot\.js(\?.*)?$/, "/css/chatbot.css") // js/ + css/ folders
      : script.src.replace(/chatbot\.js(\?.*)?$/, "chatbot.css"); // same folder
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  })();

  /* ---------- the conversation ---------- */
  var STEPS = [
    {
      key: "name",
      ask: "Hello Guest, may I know your name?",
      kind: "text",
      placeholder: "Your name",
    },
    {
      key: "query",
      ask: "How can I help you? Please enter your query.",
      kind: "textarea",
      placeholder: "Type your query here",
    },
    {
      key: "mobile",
      ask: "Please provide your mobile number?",
      kind: "phone",
      placeholder: "Mobile number",
    },
    {
      key: "email",
      ask: "Please provide your email id?",
      kind: "email",
      placeholder: "you@company.com",
    },
  ];

  var THANKS = [
    "Thank you for sharing your details, our team will get to know you better once they reach out to you.",
    "Have a great day! 😊",
  ];

  /* ---------- validation (the server checks again) ---------- */
  var validators = {
    name: function (value) {
      var v = clean(value);
      if (v.length < 2 || !/[A-Za-zÀ-ɏऀ-ॿ]/.test(v)) {
        return { error: "Please enter your name (at least 2 letters)." };
      }
      if (v.length > 60)
        return {
          error: "That name is a bit long. Please use up to 60 characters.",
        };
      return { value: v, display: v };
    },

    query: function (value) {
      var v = String(value || "")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (v.length < 5)
        return {
          error: "Please tell us a little more, at least 5 characters.",
        };
      if (v.length > 1000)
        return { error: "Please keep your query under 1000 characters." };
      return { value: v, display: v };
    },

    mobile: function (value) {
      var code = String(value.countryCode || "").replace(/\s+/g, "");
      var number = String(value.number || "").replace(/[\s\-().]/g, "");

      if (!/^\+[1-9]\d{0,3}$/.test(code)) {
        return {
          error: "Please check the country code. It should look like +91.",
        };
      }
      if (!/^\d+$/.test(number)) {
        return { error: "The mobile number should contain digits only." };
      }
      if (code === "+91") {
        if (number.length === 11 && number.charAt(0) === "0")
          number = number.slice(1);
        if (!/^[6-9]\d{9}$/.test(number)) {
          return {
            error: "Please enter a valid 10-digit Indian mobile number.",
          };
        }
      } else if (
        number.length < 6 ||
        number.length > 14 ||
        (code + number).length - 1 > 15
      ) {
        return {
          error: "That number looks too short or too long. Please check it.",
        };
      }
      return {
        value: { countryCode: code, number: number },
        display: code + " " + number,
      };
    },

    email: function (value) {
      var v = clean(value).toLowerCase();
      if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return {
          error:
            "That email doesn’t look right. Please check it and try again.",
        };
      }
      return { value: v, display: v };
    },
  };

  function clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- tiny DOM helper ---------- */
  function el(tag, className, attrs, children) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) {
      Object.keys(attrs).forEach(function (name) {
        if (attrs[name] === false || attrs[name] == null) return;
        if (name === "text") node.textContent = attrs[name];
        else node.setAttribute(name, attrs[name] === true ? "" : attrs[name]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  /* ---------- the robot (same artwork for launcher, header, messages) ---------- */
  var svgCount = 0;

  function robotSvg(withBody) {
    svgCount += 1;
    var id = "mftcb-g" + svgCount;
    var body = withBody
      ? '<path d="M32 7 53 19v26L32 57 11 45V19Z" fill="url(#' +
        id +
        ')" stroke="url(#' +
        id +
        ')" stroke-width="6" stroke-linejoin="round"/>' +
        '<path d="M32 32 53 19v26L32 57Z" fill="#7a3200" opacity=".16"/>' +
        '<path d="M32 7 53 19 32 32 11 19Z" fill="#fff" opacity=".14"/>'
      : "";
    var html =
      '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' +
      id +
      '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ffb55c"/><stop offset="1" stop-color="#e0700e"/></linearGradient></defs>' +
      body +
      '<line x1="32" y1="25" x2="32" y2="17.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle class="mftcb-antenna-dot" cx="32" cy="15" r="2.9" fill="#fff"/>' +
      '<rect x="14.4" y="31" width="3.8" height="8.5" rx="1.9" fill="#fff"/>' +
      '<rect x="45.8" y="31" width="3.8" height="8.5" rx="1.9" fill="#fff"/>' +
      '<rect x="19" y="25" width="26" height="20" rx="8" fill="#0b1a2f"/>' +
      '<rect x="19" y="25" width="26" height="20" rx="8" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>' +
      '<circle class="mftcb-eye" cx="27" cy="34" r="3" fill="#ffd9a0"/>' +
      '<circle class="mftcb-eye" cx="37" cy="34" r="3" fill="#ffd9a0"/>' +
      '<path d="M28.5 40.2Q32 42.6 35.5 40.2" fill="none" stroke="#ffd9a0" stroke-width="1.7" stroke-linecap="round"/>' +
      "</svg>";
    var wrap = document.createElement("span");
    wrap.innerHTML = html;
    return wrap.firstChild;
  }

  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>';
  var ICON_X =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var ICON_X_SMALL =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var ICON_DOWN =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function icon(markup) {
    var wrap = document.createElement("span");
    wrap.style.display = "contents";
    wrap.innerHTML = markup;
    return wrap;
  }

  /* ---------- state ---------- */
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = {
    started: false,
    stepIndex: 0,
    answers: {},
    busy: false,
    done: false,
    lastRole: null,
  };

  var ui = {};

  /* ---------- build ---------- */
  function build() {
    ui.root = el("div", "mftcb", { "data-open": "false" });

    /* launcher */
    var robot = el("span", "mftcb-launcher-robot");
    robot.appendChild(robotSvg(true));
    var x = el("span", "mftcb-launcher-x");
    x.appendChild(icon(ICON_X));

    ui.launcher = el(
      "button",
      "mftcb-launcher",
      {
        type: "button",
        "aria-label": "Chat with us",
        "aria-expanded": "false",
        "aria-controls": "mftcb-card",
      },
      [robot, x],
    );

    /* teaser */
    var teaserClose = el("button", "mftcb-teaser-close", {
      type: "button",
      "aria-label": "Dismiss",
    });
    teaserClose.appendChild(icon(ICON_X_SMALL));
    ui.teaser = el("div", "mftcb-teaser", { hidden: true, role: "status" }, [
      el("span", null, { text: CONFIG.teaserText }),
      teaserClose,
    ]);
    teaserClose.addEventListener("click", function (e) {
      e.stopPropagation();
      hideTeaser(true);
    });

    /* card */
    var avatar = el("span", "mftcb-head-avatar");
    avatar.appendChild(robotSvg(true));

    var close = el("button", "mftcb-close", {
      type: "button",
      "aria-label": "Close chat",
    });
    close.appendChild(icon(ICON_DOWN));

    var head = el("header", "mftcb-head", null, [
      avatar,
      el("div", "mftcb-head-text", null, [
        el("div", "mftcb-title", { text: CONFIG.botName }),
        el("div", "mftcb-status", { text: "Online · replies instantly" }),
      ]),
      close,
    ]);

    ui.body = el("div", "mftcb-body", {
      role: "log",
      "aria-live": "polite",
      "aria-label": "Conversation",
    });
    ui.foot = el("div", "mftcb-foot");

    ui.card = el(
      "section",
      "mftcb-card",
      {
        id: "mftcb-card",
        role: "dialog",
        "aria-label": "Chat with Mindfuturetech",
        hidden: true,
      },
      [head, ui.body, ui.foot],
    );

    ui.root.appendChild(ui.teaser);
    ui.root.appendChild(ui.card);
    ui.root.appendChild(ui.launcher);
    document.body.appendChild(ui.root);

    ui.launcher.addEventListener("click", toggle);
    close.addEventListener("click", closeChat);
    ui.card.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeChat();
        ui.launcher.focus();
      }
    });

    scheduleTeaser();
  }

  /* ---------- open / close ---------- */
  function openChat() {
    hideTeaser(true);
    ui.card.hidden = false;
    ui.root.setAttribute("data-open", "true");
    ui.launcher.setAttribute("aria-expanded", "true");
    ui.launcher.setAttribute("aria-label", "Close chat");

    if (!state.started) {
      state.started = true;
      askStep();
    } else {
      scrollToEnd();
      focusInput();
    }
  }

  function closeChat() {
    ui.card.hidden = true;
    ui.root.setAttribute("data-open", "false");
    ui.launcher.setAttribute("aria-expanded", "false");
    ui.launcher.setAttribute("aria-label", "Chat with us");
  }

  function toggle() {
    if (ui.card.hidden) openChat();
    else closeChat();
  }

  /* ---------- teaser ---------- */
  function seenTeaser() {
    try {
      return sessionStorage.getItem("mftcb_teaser") === "1";
    } catch (e) {
      return false;
    }
  }

  function hideTeaser(remember) {
    ui.teaser.hidden = true;
    if (remember) {
      try {
        sessionStorage.setItem("mftcb_teaser", "1");
      } catch (e) {
        /* storage unavailable: fine */
      }
    }
  }

  function scheduleTeaser() {
    if (seenTeaser()) return;
    window.setTimeout(function () {
      if (!ui.card.hidden || seenTeaser()) return;
      ui.teaser.hidden = false;
      window.setTimeout(function () {
        hideTeaser(true);
      }, 9000);
    }, CONFIG.teaserDelayMs);
  }

  /* ---------- messages ---------- */
  function scrollToEnd() {
    ui.body.scrollTop = ui.body.scrollHeight;
  }

  function addMessage(role, text, extraClass) {
    var row = el(
      "div",
      "mftcb-msg mftcb-msg--" + role + (extraClass ? " " + extraClass : ""),
    );

    if (role === "bot") {
      var av = el(
        "span",
        "mftcb-msg-avatar" +
          (state.lastRole === "bot" ? " mftcb-msg-avatar--blank" : ""),
      );
      if (state.lastRole !== "bot") av.appendChild(robotSvg(true));
      row.appendChild(av);
    }

    row.appendChild(el("div", "mftcb-bubble", { text: text }));
    ui.body.appendChild(row);
    state.lastRole = role;
    scrollToEnd();
    return row;
  }

  function showTyping() {
    var row = el("div", "mftcb-msg mftcb-msg--bot");
    var av = el(
      "span",
      "mftcb-msg-avatar" +
        (state.lastRole === "bot" ? " mftcb-msg-avatar--blank" : ""),
    );
    if (state.lastRole !== "bot") av.appendChild(robotSvg(true));
    row.appendChild(av);
    row.appendChild(
      el(
        "div",
        "mftcb-bubble mftcb-typing",
        { "aria-label": "Assistant is typing" },
        [el("span"), el("span"), el("span")],
      ),
    );
    ui.body.appendChild(row);
    scrollToEnd();
    return row;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, reducedMotion ? Math.min(ms, 80) : ms);
    });
  }

  /** Bot speaks one or more lines, each preceded by a short "typing…" pause. */
  function botSay(lines, opts) {
    var list = Array.isArray(lines) ? lines : [lines];
    var extra = (opts && opts.className) || "";

    return list.reduce(function (chain, line) {
      return chain.then(function () {
        var typing = showTyping();
        return wait(Math.min(350 + line.length * 12, 1100)).then(function () {
          typing.remove();
          addMessage("bot", line, extra);
        });
      });
    }, Promise.resolve());
  }

  /* ---------- the input dock ---------- */
  function clearDock() {
    while (ui.foot.firstChild) ui.foot.removeChild(ui.foot.firstChild);
    ui.fields = null;
  }

  function sendButton() {
    var btn = el("button", "mftcb-send", {
      type: "submit",
      "aria-label": "Send",
    });
    btn.appendChild(icon(ICON_SEND));
    return btn;
  }

  function renderInput(step) {
    clearDock();
    var form = el("form", "mftcb-form", { novalidate: true });
    var fields = el("div", "mftcb-fields");
    var inputs = {};

    if (step.kind === "phone") {
      inputs.code = el("input", "mftcb-input mftcb-input--code", {
        type: "text",
        inputmode: "tel",
        maxlength: "5",
        autocomplete: "tel-country-code",
        "aria-label": "Country code",
        value: CONFIG.defaultCountryCode,
      });
      inputs.code.value = CONFIG.defaultCountryCode;
      inputs.number = el("input", "mftcb-input", {
        type: "tel",
        inputmode: "numeric",
        maxlength: "16",
        autocomplete: "tel-national",
        "aria-label": "Mobile number",
        placeholder: step.placeholder,
      });
      fields.appendChild(inputs.code);
      fields.appendChild(inputs.number);
      inputs.main = inputs.number;
    } else if (step.kind === "textarea") {
      inputs.main = el("textarea", "mftcb-input", {
        rows: "1",
        maxlength: "1100",
        "aria-label": "Your query",
        placeholder: step.placeholder,
      });
      inputs.main.addEventListener("input", function () {
        inputs.main.style.height = "auto";
        inputs.main.style.height =
          Math.min(inputs.main.scrollHeight, 112) + "px";
      });
      inputs.main.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          form.requestSubmit
            ? form.requestSubmit()
            : form.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      });
      fields.appendChild(inputs.main);
    } else {
      inputs.main = el("input", "mftcb-input", {
        type: step.kind === "email" ? "email" : "text",
        maxlength: step.kind === "email" ? "254" : "60",
        autocomplete: step.kind === "email" ? "email" : "name",
        "aria-label": step.placeholder,
        placeholder: step.placeholder,
      });
      fields.appendChild(inputs.main);
    }

    form.appendChild(fields);
    form.appendChild(sendButton());
    ui.foot.appendChild(form);
    ui.foot.appendChild(
      el("p", "mftcb-foot-note", {
        text: "We only use your details to respond to your query.",
      }),
    );
    ui.fields = inputs;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      onSubmit(step);
    });
  }

  function setDockBusy(isBusy) {
    if (!ui.foot) return;
    ui.foot
      .querySelectorAll("input, textarea, button")
      .forEach(function (node) {
        node.disabled = isBusy;
      });
  }

  function focusInput() {
    if (ui.fields && ui.fields.main && !state.busy && !ui.card.hidden) {
      ui.fields.main.focus();
    }
  }

  function renderActions(actions) {
    clearDock();
    actions.forEach(function (a) {
      var btn = el(
        "button",
        "mftcb-action" + (a.ghost ? " mftcb-action--ghost" : ""),
        {
          type: "button",
          text: a.label,
        },
      );
      btn.style.marginTop = ui.foot.children.length ? "8px" : "0";
      btn.addEventListener("click", a.onClick);
      ui.foot.appendChild(btn);
    });
    var first = ui.foot.querySelector("button");
    if (first) first.focus({ preventScroll: true });
    // the dock just grew, so the last bubble must be pulled back into view
    scrollToEnd();
    setTimeout(scrollToEnd, 60);
  }

  /* ---------- flow ---------- */
  function askStep() {
    var step = STEPS[state.stepIndex];
    state.busy = true;
    clearDock();

    botSay(step.ask).then(function () {
      state.busy = false;
      renderInput(step);
      focusInput();
    });
  }

  function onSubmit(step) {
    if (state.busy) return;

    var raw;
    if (step.kind === "phone") {
      raw = {
        countryCode: ui.fields.code.value,
        number: ui.fields.number.value,
      };
    } else {
      raw = ui.fields.main.value;
    }

    var result = validators[step.key](raw);

    if (result.error) {
      state.busy = true;
      setDockBusy(true);
      botSay(result.error, { className: "mftcb-msg--error" }).then(function () {
        state.busy = false;
        setDockBusy(false);
        focusInput();
      });
      return;
    }

    state.answers[step.key] = result.value;
    addMessage("user", result.display);
    state.stepIndex += 1;

    if (state.stepIndex < STEPS.length) {
      askStep();
    } else {
      submitLead();
    }
  }

  function buildPayload() {
    var a = state.answers;
    return {
      name: a.name,
      query: a.query,
      countryCode: a.mobile.countryCode,
      mobile: a.mobile.number,
      email: a.email,
      pageUrl: window.location.href.slice(0, 500),
      source: "website-chatbot",
    };
  }

  function postLead(payload) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller
      ? window.setTimeout(function () {
          controller.abort();
        }, CONFIG.requestTimeoutMs)
      : null;

    return fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok || data.success === false) {
              var err = new Error(data.message || "Request failed");
              err.status = res.status;
              throw err;
            }
            return data;
          });
      })
      .finally(function () {
        if (timer) window.clearTimeout(timer);
      });
  }

  function submitLead() {
    state.busy = true;
    clearDock();

    var typing = showTyping();

    postLead(buildPayload())
      .then(function () {
        typing.remove();
        state.done = true;
        return botSay(THANKS);
      })
      .then(function () {
        state.busy = false;
        renderActions([
          { label: "Start a new chat", ghost: true, onClick: restart },
        ]);
      })
      .catch(function (err) {
        typing.remove();
        var userFault = err && err.status === 400 && err.message;
        var message = userFault
          ? "We couldn’t save your details: " + err.message
          : "Sorry, something went wrong while sending your details. Please check your connection and try again.";

        return botSay(message, { className: "mftcb-msg--error" }).then(
          function () {
            state.busy = false;
            renderActions(
              userFault
                ? [{ label: "Start over", onClick: restart }]
                : [
                    { label: "Try again", onClick: submitLead },
                    { label: "Start over", ghost: true, onClick: restart },
                  ],
            );
          },
        );
      });
  }

  function restart() {
    while (ui.body.firstChild) ui.body.removeChild(ui.body.firstChild);
    state.stepIndex = 0;
    state.answers = {};
    state.done = false;
    state.busy = false;
    state.lastRole = null;
    askStep();
  }

  /* ---------- public API ---------- */
  window.MFTChatbot = {
    open: function () {
      if (ui.card && ui.card.hidden) openChat();
    },
    close: function () {
      if (ui.card && !ui.card.hidden) closeChat();
    },
    toggle: function () {
      if (ui.card) toggle();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
