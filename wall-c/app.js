(function () {
  "use strict";

  var STORAGE_KEY = "wallc.items";
  var TIMER_KEY = "wallc.startedAt";
  var DURATION_MS = 90 * 60 * 1000;

  var items = [];
  var startedAt = null;
  var vibratedAtZero = false;
  var summaryMode = false;
  var activeItemId = null;
  var timerInterval = null;

  var el = {
    timer: document.getElementById("timer"),
    uncatCount: document.getElementById("uncat-count"),
    quickAdd: document.getElementById("quick-add"),
    nameInput: document.getElementById("name-input"),
    qtyInput: document.getElementById("qty-input"),
    summaryToggle: document.getElementById("summary-toggle"),
    resetBtn: document.getElementById("reset-btn"),
    listView: document.getElementById("list-view"),
    summaryView: document.getElementById("summary-view"),
    groups: document.getElementById("groups"),
    summaryGroups: document.getElementById("summary-groups"),
    copyBtn: document.getElementById("copy-btn"),
    sheetOverlay: document.getElementById("sheet-overlay"),
    sheet: document.getElementById("sheet"),
    sheetName: document.getElementById("sheet-name"),
    typeButtons: document.getElementById("type-buttons"),
    actionButtons: document.getElementById("action-buttons"),
    sheetQty: document.getElementById("sheet-qty"),
    locationGroup: document.getElementById("location-group"),
    sheetLocation: document.getElementById("sheet-location"),
    deleteBtn: document.getElementById("delete-btn"),
    sheetClose: document.getElementById("sheet-close")
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      items = [];
    }
    var t = localStorage.getItem(TIMER_KEY);
    startedAt = t ? parseInt(t, 10) : null;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function saveTimer() {
    if (startedAt === null) {
      localStorage.removeItem(TIMER_KEY);
    } else {
      localStorage.setItem(TIMER_KEY, String(startedAt));
    }
  }

  // ---- Timer ----

  function formatTime(ms) {
    var sign = ms < 0 ? "-" : "";
    var abs = Math.abs(ms);
    var totalSeconds = Math.floor(abs / 1000);
    var mm = Math.floor(totalSeconds / 60);
    var ss = totalSeconds % 60;
    return sign + String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
  }

  function tickTimer() {
    if (startedAt === null) {
      el.timer.textContent = "90:00";
      el.timer.classList.remove("expired");
      return;
    }
    var elapsed = Date.now() - startedAt;
    var remaining = DURATION_MS - elapsed;
    el.timer.textContent = formatTime(remaining);
    if (remaining <= 0) {
      el.timer.classList.add("expired");
      if (!vibratedAtZero) {
        vibratedAtZero = true;
        if (navigator.vibrate) {
          navigator.vibrate(500);
        }
      }
    } else {
      el.timer.classList.remove("expired");
    }
  }

  function ensureTimerStarted() {
    if (startedAt === null) {
      startedAt = Date.now();
      saveTimer();
    }
  }

  // ---- Rendering ----

  function uncategorizedCount() {
    return items.filter(function (it) { return !it.type || !it.action; }).length;
  }

  function updateUncatCount() {
    var n = uncategorizedCount();
    el.uncatCount.textContent = n + " uncategorized";
  }

  function itemMetaText(it) {
    if (!it.action) return "";
    var label = it.action.charAt(0).toUpperCase() + it.action.slice(1);
    if (it.action === "safekeep" && it.location) {
      label += " — " + it.location;
    }
    return label;
  }

  function makeRow(it) {
    var row = document.createElement("div");
    var isUncat = !it.type || !it.action;
    row.className = "item-row" + (isUncat ? " uncategorized" : "");
    row.dataset.id = it.id;

    var main = document.createElement("div");
    main.className = "item-main";

    var name = document.createElement("div");
    name.className = "item-name";
    name.textContent = it.name;
    main.appendChild(name);

    var meta = itemMetaText(it);
    if (meta) {
      var metaEl = document.createElement("div");
      metaEl.className = "item-meta";
      metaEl.textContent = meta;
      main.appendChild(metaEl);
    }

    row.appendChild(main);

    var qty = document.createElement("div");
    qty.className = "item-qty";
    qty.textContent = "x" + it.qty;
    row.appendChild(qty);

    row.addEventListener("click", function () {
      openSheet(it.id);
    });

    return row;
  }

  function renderList() {
    el.groups.innerHTML = "";

    var groups = [
      { key: "uncategorized", label: "Uncategorized", filter: function (it) { return !it.type || !it.action; } },
      { key: "utility", label: "Utility", filter: function (it) { return it.type === "utility" && it.action; } },
      { key: "memento", label: "Memento", filter: function (it) { return it.type === "memento" && it.action; } },
      { key: "rubbish", label: "Rubbish", filter: function (it) { return it.type === "rubbish" && it.action; } }
    ];

    groups.forEach(function (g) {
      var groupItems = items.filter(g.filter);
      if (groupItems.length === 0) return;
      var header = document.createElement("div");
      header.className = "group-header";
      header.textContent = g.label + " (" + groupItems.length + ")";
      el.groups.appendChild(header);
      groupItems.forEach(function (it) {
        el.groups.appendChild(makeRow(it));
      });
    });

    if (items.length === 0) {
      var note = document.createElement("div");
      note.className = "empty-note";
      note.textContent = "No items yet. Add one above.";
      el.groups.appendChild(note);
    }
  }

  function renderSummary() {
    el.summaryGroups.innerHTML = "";

    function section(title, list, showLocation) {
      var h = document.createElement("h3");
      var totalQty = list.reduce(function (sum, it) { return sum + it.qty; }, 0);
      h.textContent = title + " (" + totalQty + ")";
      el.summaryGroups.appendChild(h);
      if (list.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-note";
        empty.textContent = "None";
        el.summaryGroups.appendChild(empty);
        return;
      }
      list.forEach(function (it) {
        var row = document.createElement("div");
        row.className = "summary-item";
        var left = document.createElement("span");
        left.textContent = it.name + (showLocation && it.location ? " — " + it.location : "");
        var right = document.createElement("span");
        right.textContent = "x" + it.qty;
        row.appendChild(left);
        row.appendChild(right);
        el.summaryGroups.appendChild(row);
      });
    }

    var display = items.filter(function (it) { return it.action === "display"; });
    var safekeep = items.filter(function (it) { return it.action === "safekeep"; })
      .slice()
      .sort(function (a, b) { return (a.location || "").localeCompare(b.location || ""); });
    var discard = items.filter(function (it) { return it.action === "discard"; });

    section("Display", display, false);
    section("Safekeep", safekeep, true);
    section("Discard", discard, false);
  }

  function render() {
    updateUncatCount();
    if (summaryMode) {
      renderSummary();
    } else {
      renderList();
    }
  }

  // ---- Bottom sheet ----

  function findItem(id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function openSheet(id) {
    var it = findItem(id);
    if (!it) return;
    activeItemId = id;
    el.sheetName.textContent = it.name;
    el.sheetQty.value = it.qty;
    el.sheetLocation.value = it.location || "";
    updateSheetSelection(it);
    el.locationGroup.hidden = it.action !== "safekeep";
    el.sheetOverlay.hidden = false;
    el.sheet.hidden = false;
    requestAnimationFrame(function () {
      el.sheet.classList.add("open");
    });
  }

  function closeSheet() {
    el.sheet.classList.remove("open");
    setTimeout(function () {
      el.sheet.hidden = true;
      el.sheetOverlay.hidden = true;
    }, 200);
    activeItemId = null;
  }

  function updateSheetSelection(it) {
    Array.prototype.forEach.call(el.typeButtons.children, function (btn) {
      btn.classList.toggle("selected", btn.dataset.type === it.type);
    });
    Array.prototype.forEach.call(el.actionButtons.children, function (btn) {
      btn.classList.toggle("selected", btn.dataset.action === it.action);
    });
  }

  function mutateActiveItem(fn) {
    var it = findItem(activeItemId);
    if (!it) return;
    fn(it);
    save();
    render();
  }

  el.typeButtons.addEventListener("click", function (e) {
    var btn = e.target.closest(".opt-btn");
    if (!btn) return;
    var type = btn.dataset.type;
    mutateActiveItem(function (it) {
      it.type = type;
      if (type === "rubbish") {
        it.action = "discard";
        it.location = "";
      }
    });
    var it = findItem(activeItemId);
    updateSheetSelection(it);
    el.locationGroup.hidden = it.action !== "safekeep";
  });

  el.actionButtons.addEventListener("click", function (e) {
    var btn = e.target.closest(".opt-btn");
    if (!btn) return;
    var action = btn.dataset.action;
    mutateActiveItem(function (it) {
      it.action = action;
      if (action !== "safekeep") {
        it.location = "";
      }
    });
    var it = findItem(activeItemId);
    updateSheetSelection(it);
    el.locationGroup.hidden = it.action !== "safekeep";
    el.sheetLocation.value = it.location || "";
  });

  el.sheetQty.addEventListener("input", function () {
    var val = parseInt(el.sheetQty.value, 10);
    if (isNaN(val) || val < 1) return;
    mutateActiveItem(function (it) {
      it.qty = val;
    });
  });

  el.sheetLocation.addEventListener("input", function () {
    var val = el.sheetLocation.value;
    mutateActiveItem(function (it) {
      it.location = val;
    });
  });

  el.deleteBtn.addEventListener("click", function () {
    items = items.filter(function (it) { return it.id !== activeItemId; });
    save();
    render();
    closeSheet();
  });

  el.sheetClose.addEventListener("click", closeSheet);
  el.sheetOverlay.addEventListener("click", closeSheet);

  // ---- Quick add ----

  el.quickAdd.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = el.nameInput.value.trim();
    if (!name) return;
    var qty = parseInt(el.qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    ensureTimerStarted();

    items.push({
      id: uid(),
      name: name,
      qty: qty,
      type: null,
      action: null,
      location: "",
      createdAt: Date.now()
    });
    save();
    render();

    el.nameInput.value = "";
    el.qtyInput.value = "1";
    el.nameInput.focus();
  });

  // ---- Summary toggle / copy ----

  el.summaryToggle.addEventListener("click", function () {
    summaryMode = !summaryMode;
    el.listView.hidden = summaryMode;
    el.summaryView.hidden = !summaryMode;
    el.summaryToggle.textContent = summaryMode ? "List" : "Summary";
    render();
  });

  function buildSummaryText() {
    function section(title, list, showLocation) {
      var lines = [title + ":"];
      if (list.length === 0) {
        lines.push("  (none)");
      } else {
        list.forEach(function (it) {
          var line = "  " + it.name + " x" + it.qty;
          if (showLocation && it.location) line += " — " + it.location;
          lines.push(line);
        });
      }
      return lines.join("\n");
    }

    var display = items.filter(function (it) { return it.action === "display"; });
    var safekeep = items.filter(function (it) { return it.action === "safekeep"; })
      .slice()
      .sort(function (a, b) { return (a.location || "").localeCompare(b.location || ""); });
    var discard = items.filter(function (it) { return it.action === "discard"; });

    return [
      section("Display", display, false),
      section("Safekeep", safekeep, true),
      section("Discard", discard, false)
    ].join("\n\n");
  }

  el.copyBtn.addEventListener("click", function () {
    var text = buildSummaryText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ---- Reset ----

  el.resetBtn.addEventListener("click", function () {
    if (!confirm("Clear all items and reset the timer?")) return;
    items = [];
    startedAt = null;
    vibratedAtZero = false;
    save();
    saveTimer();
    render();
  });

  // ---- Init ----

  load();
  render();
  tickTimer();
  timerInterval = setInterval(tickTimer, 1000);
})();
