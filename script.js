const stickyCta = document.querySelector(".sticky-cta");
const hero = document.querySelector(".hero");
const siteHeader = document.querySelector(".site-header");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

const updateStickyCta = () => {
  if (!stickyCta || !hero) return;
  const heroBottom = hero.getBoundingClientRect().bottom;
  stickyCta.classList.toggle("show", heroBottom < 120);
};

window.addEventListener("scroll", updateStickyCta, { passive: true });
window.addEventListener("load", updateStickyCta);

mobileMenuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader?.classList.toggle("nav-open");
  mobileMenuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      openItem.classList.remove("open");
      openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    siteHeader?.classList.remove("nav-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".back-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const rewardCategories = document.querySelectorAll(".reward-category");
const rewardStore = document.querySelector(".reward-store");
const mobileVoucherPanel = document.createElement("div");

mobileVoucherPanel.className = "mobile-voucher-panel";

if (rewardStore) {
  rewardStore.insertAdjacentElement("afterend", mobileVoucherPanel);
}

const updateMobileVoucherPanel = (category) => {
  const source = category?.querySelector(".voucher-popover");

  if (!mobileVoucherPanel || !source) return;
  mobileVoucherPanel.innerHTML = source.innerHTML;
};

updateMobileVoucherPanel(document.querySelector(".reward-category.active") || rewardCategories[0]);

rewardCategories.forEach((category) => {
  category.addEventListener("click", () => {
    rewardCategories.forEach((item) => item.classList.remove("active"));
    category.classList.add("active");
    updateMobileVoucherPanel(category);
  });
});

const spinWheel = document.querySelector("#spinWheel");
const spinButton = document.querySelector("#spinButton");
const panacoinCode = document.querySelector("#panacoinCode");
const spinResultText = document.querySelector("#spinResultText");
const winnerList = document.querySelector("#winnerList");
const confettiLayer = document.querySelector("#confettiLayer");
const copyCode = document.querySelector("#copyCode");
const claimModal = document.querySelector("#claimModal");
const claimForm = document.querySelector("#claimForm");
const claimError = document.querySelector("#claimError");
const claimName = document.querySelector("#claimName");
const claimTitle = document.querySelector("#claimTitle");
const claimClose = document.querySelector("#claimClose");
const claimReopen = document.querySelector("#claimReopen");
const winnerMore = document.querySelector("#winnerMore");
const winnersModal = document.querySelector("#winnersModal");
const winnersClose = document.querySelector("#winnersClose");

const spinPrizes = [10, 1, 2, 2, 3, 3, 5, 1];
let currentSpinRotation = 0;
let isSpinning = false;
let pendingPanacoinCode = "";
let pendingCoins = 0;
let claimModalTimer = 0;

const createPanacoinCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PC";

  for (let index = 0; index < 6; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const formatSpinTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${date} - ${time}`;
};

const addWinnerRow = (coins) => {
  if (!winnerList) return;

  const row = document.createElement("div");
  row.className = "winner-row";
  row.innerHTML = `<span>*** Bạn</span><time>${formatSpinTime()}</time><b>+${coins} <i>P</i></b>`;
  winnerList.prepend(row);
  winnerList.scrollTop = 0;
};

const fireConfetti = () => {
  if (!confettiLayer) return;

  const colors = ["#0d55e8", "#2fa3ff", "#ffd166", "#ffffff", "#7b61ff"];
  const pieces = 24;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / pieces;
    const distance = 120 + Math.random() * 110;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance - 50;

    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);
    piece.style.setProperty("--r", `${Math.random() * 180}deg`);
    piece.style.setProperty("--c", colors[index % colors.length]);
    confettiLayer.append(piece);

    window.setTimeout(() => piece.remove(), 1400);
  }
};

const openClaimModal = () => {
  if (!claimModal) return;
  if (claimTitle && pendingCoins) {
    claimTitle.innerHTML = `Bạn thu thập được <span class="coin-highlight">${pendingCoins} coin</span>.<br />Hãy hoàn tất thông tin để nhận mã ngay nhé!`;
  }
  claimModal.classList.add("show");
  claimModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  window.setTimeout(() => claimName?.focus(), 80);
};

const closeClaimModal = () => {
  if (!claimModal) return;
  claimModal.classList.remove("show");
  claimModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

const updateClaimReopen = () => {
  if (!claimReopen) return;
  claimReopen.hidden = !(pendingPanacoinCode && pendingCoins);
};

const revealPanacoinCode = () => {
  if (!pendingPanacoinCode || !pendingCoins) return;

  if (panacoinCode) {
    panacoinCode.textContent = pendingPanacoinCode;
  }

  if (spinResultText) {
    spinResultText.textContent = `Bạn vừa nhận +${pendingCoins} Panasonic Coins. Mã có thể dùng theo chương trình áp dụng.`;
  }

  addWinnerRow(pendingCoins);
  pendingPanacoinCode = "";
  pendingCoins = 0;
  updateClaimReopen();
};

spinButton?.addEventListener("click", () => {
  if (!spinWheel || isSpinning) return;

  isSpinning = true;
  spinButton.disabled = true;
  spinButton.textContent = "ĐANG QUAY...";
  pendingPanacoinCode = "";
  pendingCoins = 0;
  window.clearTimeout(claimModalTimer);
  closeClaimModal();
  updateClaimReopen();
  if (panacoinCode) {
    panacoinCode.textContent = "XXXXXXX";
  }
  if (spinResultText) {
    spinResultText.textContent = "Vòng quay đang xác định Panasonic Coins của bạn...";
  }

  const prizeIndex = Math.floor(Math.random() * spinPrizes.length);
  const coins = spinPrizes[prizeIndex];
  const targetRotation = 360 - prizeIndex * 45;
  currentSpinRotation += 360 * 5 + targetRotation;
  spinWheel.style.transform = `rotate(${currentSpinRotation}deg)`;

  window.setTimeout(() => {
    pendingPanacoinCode = createPanacoinCode();
    pendingCoins = coins;
    updateClaimReopen();

    if (spinResultText) {
      spinResultText.textContent = `Chúc mừng! Bạn đã quay được +${coins} Panasonic Coins.`;
    }

    fireConfetti();
    spinButton.disabled = false;
    spinButton.textContent = "QUAY NGAY";
    isSpinning = false;
    claimModalTimer = window.setTimeout(() => {
      if (spinResultText && pendingCoins) {
        spinResultText.textContent = `Bạn đã quay được +${pendingCoins} Panasonic Coins. Vui lòng gửi thông tin để mở mã Panacoin.`;
      }
      openClaimModal();
    }, 2200);
  }, 3300);
});

claimClose?.addEventListener("click", () => {
  closeClaimModal();
  updateClaimReopen();
});

claimReopen?.addEventListener("click", () => {
  if (!pendingPanacoinCode || !pendingCoins) return;
  window.clearTimeout(claimModalTimer);
  openClaimModal();
});

winnerMore?.addEventListener("click", () => {
  if (!winnersModal) return;
  winnersModal.classList.add("show");
  winnersModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});

winnersClose?.addEventListener("click", () => {
  if (!winnersModal) return;
  winnersModal.classList.remove("show");
  winnersModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
});

claimForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(claimForm);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phoneValid = /^[0-9+ ]{9,14}$/.test(phone);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !phoneValid || !emailValid) {
    if (claimError) {
      claimError.textContent = "Vui lòng điền đầy đủ họ tên, số điện thoại và email hợp lệ.";
    }
    return;
  }

  if (claimError) {
    claimError.textContent = "";
  }

  revealPanacoinCode();
  closeClaimModal();
  claimForm.reset();
});

copyCode?.addEventListener("click", async () => {
  const code = panacoinCode?.textContent?.trim();

  if (!code || code === "XXXXXXX") return;

  try {
    await navigator.clipboard.writeText(code);
    copyCode.textContent = "✓";
    window.setTimeout(() => {
      copyCode.textContent = "⧉";
    }, 1100);
  } catch (error) {
    copyCode.textContent = "!";
    window.setTimeout(() => {
      copyCode.textContent = "⧉";
    }, 1100);
  }
});

// Reveal the introduction once as each part enters the viewport.
// Text stays visible when JavaScript or animation support is unavailable.
const introMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const introRevealElements = document.querySelectorAll(
  "#intro .intro-copy > h2, #intro .intro-copy > .lead, #intro .step-list article",
);

if (
  !introMotionPreference.matches &&
  "IntersectionObserver" in window &&
  typeof Element.prototype.animate === "function"
) {
  const introRevealAnimations = new Set();
  const introRevealDelays = new Map(
    [...introRevealElements].map((element, index) => [element, index * 70]),
  );
  const introRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        introRevealObserver.unobserve(entry.target);
        const animation = entry.target.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 500,
            delay: introRevealDelays.get(entry.target),
            easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
            fill: "backwards",
          },
        );
        introRevealAnimations.add(animation);
        animation.onfinish = () => introRevealAnimations.delete(animation);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
  );
  introRevealElements.forEach((element) => introRevealObserver.observe(element));
  introMotionPreference.addEventListener("change", (event) => {
    if (!event.matches) return;
    introRevealObserver.disconnect();
    introRevealAnimations.forEach((animation) => animation.cancel());
    introRevealAnimations.clear();
  });
}
