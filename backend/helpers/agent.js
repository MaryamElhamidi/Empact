const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

require("chromedriver");

const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || "http://localhost:3001";

/** Fetch user by email from the backend API (no direct DB access). */
async function getUserByEmailFromApi(email) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/users/${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

/** Map API user (snake_case) to shape expected by fillUserFields (camelCase) */
function mapDbUserToFormUser(dbUser) {
  return {
    firstName: dbUser.first_name ?? "",
    lastName: dbUser.last_name ?? "",
    email: dbUser.email ?? "",
    address: dbUser.address ?? "",
    city: dbUser.city ?? "",
    postalCode: dbUser.postal_code ?? "",
    country: dbUser.country ?? "",
    phone: dbUser.phone ?? "",
    province: dbUser.province ?? ""
  };
}

async function openDriver() {
  const options = new chrome.Options();
  options.addArguments("--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}

async function scanPage(driver) {

  return await driver.executeScript(() => {

    const els = Array.from(document.querySelectorAll(
      "button,input,select,a,label"
    ));

    return els.map(el => {
      const inner = (el.innerText || "").toLowerCase();
      const full = (el.textContent || "").toLowerCase();
      return {
        el,
        text: (inner || full).trim(),
        textWithChildren: (inner + " " + full).trim(),
        aria: (el.getAttribute("aria-label") || "").toLowerCase(),
        name: (el.name || "").toLowerCase(),
        id: (el.id || "").toLowerCase(),
        cls: (el.className || "").toLowerCase(),
        placeholder: (el.getAttribute("placeholder") || "").toLowerCase()
      };
    });

  });

}

function detectAmountButton(elements, amount) {
  const amountNum = Number(amount);
  if (Number.isNaN(amountNum)) return null;
  for (const e of elements) {
    const searchText = (e.textWithChildren != null ? e.textWithChildren : e.text) || "";
    const match = searchText.match(/[\$£€]?\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const value = parseFloat(match[1]);
      if (value === amountNum) return e.el;
    }
  }
  return null;
}

function detectAmountInput(elements) {
  let matched = null;

  for (let e of elements) {
    const name = e.name || "";
    const id = e.id || "";
    const cls = e.cls || "";
    const placeholder = e.placeholder || "";

    // Strongly prefer explicit "other amount" style inputs:
    // <input name="amount_other" type="number" class="input-element" placeholder="Other" ...>
    const phLower = placeholder.toLowerCase();
    if (
      name === "amount_other" ||
      (name.includes("amount") && name.includes("other")) ||
      (cls.includes("input-element") && (phLower === "other" || phLower === "other amount"))
    ) {
      matched = e.el;
      break;
    }

    // Existing heuristics: generic "amount" fields
    if (
      name.includes("amount") ||
      id.includes("amount") ||
      cls.includes("amount")
    ) {
      matched = e.el;
      break;
    }

    // Explicit support for inputs like:
    // <input class="n3o-input-amount" ... placeholder="Enter an amount">
    if (
      cls.includes("n3o-input-amount") ||
      placeholder.includes("enter an amount")
    ) {
      matched = e.el;
      break;
    }
  }

  return matched;
}

function detectNextButton(elements) {

  const keywords = ["next", "continue", "proceed"];

  for (let e of elements) {

    const combined = e.text + e.aria + e.cls;

    for (let k of keywords) {
      if (combined.includes(k)) {
        return e.el;
      }
    }
  }

  return null;
}

function detectPaymentButton(elements) {

  const keywords = [
    "donate",
    "pay",
    "submit",
    "complete",
    "give",
    "confirm",
    "review donation",
    "make a donation"
  ];

  for (let e of elements) {

    const combined = e.text + e.aria + e.cls;

    for (let k of keywords) {
      if (combined.includes(k)) {
        return e.el;
      }
    }
  }

  return null;
}
async function fillUserFields(driver, user) {

  const fieldMap = {
    firstName: ["first", "fname", "given", "firstname"],
    lastName: ["last", "lname", "surname", "lastname", "family"],
    email: ["email", "e-mail"],
    address: ["address", "street", "addr", "line1"],
    city: ["city", "town", "locality"],
    postalCode: ["postal", "zip", "postcode", "zip_code", "zip-code"],
    country: ["country", "nation"],
    province: ["province", "state"],
    phone: ["phone", "tel", "telephone", "number"]
  };

  const values = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    address: user.address,
    city: user.city,
    postalCode: user.postalCode,
    country: user.country,
    phone: user.phone,
    province: user.province
  };

  // NEVER fill these fields
  const forbidden = [
    "amount",
    "donation",
    "transaction",
    "price",
    "total",
    "payment",
    "other"
  ];

  const elements = await driver.findElements(By.css("input, textarea, select"));
  const used = new Set();

  for (let el of elements) {

    try {

      const tag = await el.getTagName();

      const name = ((await el.getAttribute("name")) || "").toLowerCase();
      const id = ((await el.getAttribute("id")) || "").toLowerCase();
      const placeholder = ((await el.getAttribute("placeholder")) || "").toLowerCase();
      const aria = ((await el.getAttribute("aria-label")) || "").toLowerCase();

      let labelText = "";

      try {
        const label = await driver.executeScript(`
          const el = arguments[0];
          let label = document.querySelector("label[for='" + el.id + "']");
          if(label) return label.innerText;
          if(el.closest("label")) return el.closest("label").innerText;
          return "";
        `, el);

        labelText = (label || "").toLowerCase();

      } catch {}

      const combined = `${name} ${id} ${placeholder} ${aria} ${labelText}`;

      // 🔒 Skip donation/payment fields
      if (forbidden.some(k => combined.includes(k))) {
        continue;
      }

      for (let field in fieldMap) {

        if (used.has(field)) continue;

        const keywords = fieldMap[field];

        const matched = keywords.some(k => combined.includes(k));

        if (!matched) continue;

        const value = values[field];
        if (!value) continue;

        if (tag === "select") {

          const options = await el.findElements(By.css("option"));

          for (let option of options) {

            const text = (await option.getText()).toLowerCase();

            if (text.includes(value.toLowerCase())) {

              await option.click();
              used.add(field);
              break;

            }

          }

        } else {

          await el.clear();
          await el.sendKeys(value);
          used.add(field);

        }

        break;

      }

    } catch {}

  }

}

async function agent_fill_multistep(email, url, donation_amount) {

  const driver = await openDriver();
  const dbUser = await getUserByEmailFromApi(email);
  if (!dbUser) {
    await driver.quit();
    throw new Error("User not found: " + email);
  }
  const user = mapDbUserToFormUser(dbUser);

  let amountSelected = false;

  try {

    console.log("Navigating to:", url);

    await driver.get(url);
    await driver.wait(until.elementLocated(By.css("body")), 10000);

    for (let step = 0; step < 12; step++) {

      console.log("Agent step", step);

      await driver.wait(async () => {
        const ready = await driver.executeScript(
          "return document.readyState === 'complete'"
        );
        return ready;
      }, 500).catch(()=>{});

      const elements = await scanPage(driver);

      // --------- Amount selection (only once) ---------
      if (!amountSelected) {

        const amountBtn = detectAmountButton(elements, donation_amount);

        if (amountBtn) {
          try {
            await amountBtn.click();
            amountSelected = true;
            console.log("Amount button selected");
          } catch {}
        }

        if (!amountSelected) {

                  let amountInput = detectAmountInput(elements);

                  // Fallback: explicitly target inputs like
                  // <input class="n3o-input-amount" type="number" ... placeholder="Enter an amount">
                  if (!amountInput) {
                    try {
                      const specialInputs = await driver.findElements(By.css("input.n3o-input-amount"));
                      if (specialInputs && specialInputs.length > 0) {
                        amountInput = specialInputs[0];
                      }
                    } catch {}
                  }

          if (amountInput) {
            try {
              await amountInput.clear();
              await amountInput.sendKeys(donation_amount.toString());
              amountSelected = true;
              console.log("Typed donation amount");
            } catch {}
          }

        }

      }
      // -----------------------------------------------

      await fillUserFields(driver, user);

      const nextBtn = detectNextButton(elements);

      if (nextBtn) {

        try {

          console.log("Clicking next");

          const prev = await driver.findElement(By.css("body"));

          await nextBtn.click();

          await driver.wait(until.stalenessOf(prev), 5000).catch(()=>{});

          continue;

        } catch {}

      }

      const payBtn = detectPaymentButton(elements);

      if (payBtn) {

        console.log("Reached payment page");

        try {
          await driver.executeScript(
            "arguments[0].scrollIntoView({behavior:'smooth'})",
            payBtn
          );
        } catch (e) {
          // If the element went stale between detection and scroll, just continue
          console.warn("scrollIntoView payBtn failed (stale?), continuing");
        }

        break;
      }

    }

    console.log("Automation finished. Ready for payment.");

    return driver;

  } catch (err) {

    console.error("agent_fill_multistep failed:", err);
    await driver.quit();
    return null;

  }

}


/**
 * agent_donate() - Find the actual donation URL on GoFundMe / similar pages
 * @param {Object} donationInfo
 * @returns {string|null} - Absolute donation checkout URL
 */
async function agent_donate(donationInfo) {
  const { charity } = donationInfo;

  const options = new chrome.Options();
  options.addArguments("--no-sandbox", "--headless=new", "--disable-gpu", "--disable-dev-shm-usage");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    console.log("Opening donation page:", charity.donation_url);
    await driver.get(charity.donation_url);
    await driver.wait(until.elementLocated(By.css("body")), 10000);
    await driver.sleep(500); // wait for dynamic JS content

    // Find all <a> elements
    const links = await driver.findElements(By.css("a"));

    for (let link of links) {
      try {
        const href = await link.getAttribute("href");
        const text = (await link.getText()).toLowerCase() || "";
        const cls = (await link.getAttribute("class")) || "";

        // Heuristic: href contains /donate OR text/class contains "donate"
        if (
          (href && href.includes("/donate")) ||
          text.includes("donate") ||
          cls.toLowerCase().includes("donate")
        ) {
          // Make absolute URL
          const donationUrl = new URL(href, charity.donation_url).href;
          console.log("Found donation URL:", donationUrl);
          return donationUrl;
        }
      } catch {}
    }

    console.log("No donation link detected.");
    return null;

  } catch (err) {
    console.error("Agent donation failed:", err);
    return null;
  } finally {
    await driver.quit();
  }
}

// ---------- Agentic helpers for donation flow ----------

function scoreDonationLinkCandidate(baseUrl, href, text, cls, aria, role) {
  if (!href) return 0;
  // Ignore javascript: and mailto: etc.
  if (/^(javascript:|mailto:|tel:)/i.test(href)) return 0;

  const lowerText = (text || "").toLowerCase();
  const lowerCls = (cls || "").toLowerCase();
  const lowerAria = (aria || "").toLowerCase();
  const lowerRole = (role || "").toLowerCase();

  let score = 0;

  // Strong donation intent words
  const strongWords = ["donate now", "give now", "donate today", "complete donation"];
  const mediumWords = ["donate", "donation", "give", "contribute", "support"];

  for (const w of strongWords) {
    if (lowerText.includes(w) || lowerAria.includes(w) || lowerCls.includes(w)) {
      score += 10;
    }
  }
  for (const w of mediumWords) {
    if (lowerText.includes(w) || lowerAria.includes(w) || lowerCls.includes(w)) {
      score += 4;
    }
  }

  if (lowerRole === "button") score += 2;

  try {
    const resolved = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    if (resolved.origin === base.origin) {
      score += 1; // prefer same-domain flows
    }
    if (resolved.pathname.includes("/donate")) score += 5;
  } catch {
    // ignore URL parse errors
  }

  return score;
}

async function findBestDonationLink(driver, baseUrl) {
  const candidates = [];
  const anchorsAndButtons = await driver.findElements(By.css("a, button"));

  for (const el of anchorsAndButtons) {
    try {
      const href = await el.getAttribute("href");
      const text = (await el.getText()) || "";
      const cls = (await el.getAttribute("class")) || "";
      const aria = (await el.getAttribute("aria-label")) || "";
      const role = (await el.getAttribute("role")) || "";

      const score = scoreDonationLinkCandidate(baseUrl, href, text, cls, aria, role);
      if (score > 0) {
        candidates.push({ el, href, score });
      }
    } catch {
      // ignore individual element failures
    }
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 5) return null; // require reasonable confidence

  try {
    return new URL(best.href, baseUrl).href;
  } catch {
    return null;
  }
}

async function performMultiStepDonation(driver, donationUrl, user, donation_amount, progress) {
  let amountSelected = false;

  progress("Entering donation amount $" + donation_amount + "…");
  console.log("Navigating to:", donationUrl);

  await driver.get(donationUrl);
  await driver.wait(until.elementLocated(By.css("body")), 10000);

  for (let step = 0; step < 12; step++) {

    console.log("Agent step", step);

    await driver.wait(async () => {
      const ready = await driver.executeScript(
        "return document.readyState === 'complete'"
      );
      return ready;
    }, 500).catch(() => { });

    const elements = await scanPage(driver);

    // --------- Amount selection (only once) ---------
    if (!amountSelected) {

      const amountBtn = detectAmountButton(elements, donation_amount);

      if (amountBtn) {
        try {
          await amountBtn.click();
          amountSelected = true;
          progress("Donation amount $" + donation_amount + " selected.");
          console.log("Amount button selected");
        } catch (err) { }
      }

      if (!amountSelected) {

        let amountInput = detectAmountInput(elements);
        // Dynamically detect any input related to donation amount
        if (!amountInput) {
          try {
            const inputs = await driver.findElements(By.css("input, textarea"));
            let bestCandidate = null;
            let bestScore = 0;

            for (const input of inputs) {
              const name = ((await input.getAttribute("name")) || "").toLowerCase();
              const id = ((await input.getAttribute("id")) || "").toLowerCase();
              const cls = ((await input.getAttribute("class")) || "").toLowerCase();
              const placeholder = ((await input.getAttribute("placeholder")) || "").toLowerCase();
              const aria = ((await input.getAttribute("aria-label")) || "").toLowerCase();
              const style = ((await input.getAttribute("style")) || "").toLowerCase();
              const type = ((await input.getAttribute("type")) || "").toLowerCase();

              let score = 0;

              const hasAmount = name.includes("amount") || id.includes("amount") || placeholder.includes("amount");
              const hasOther = name.includes("other") || id.includes("other") || placeholder.includes("other");
              const hasDonation = name.includes("donation") || id.includes("donation") || cls.includes("donation");

              if (hasAmount) score += 3;
              if (hasOther) score += 4; // strongly favor "other" amount-style fields
              if (hasDonation) score += 3;

              if (placeholder.includes("$")) score += 2;
              if (type === "number") score += 2;

              if (aria.includes("other") && aria.includes("amount")) score += 3;

              // Slight preference for visibly styled inputs
              if (style && !style.includes("display:none") && !style.includes("visibility:hidden")) {
                score += 1;
              }

              if (score > bestScore) {
                bestScore = score;
                bestCandidate = input;
              }
            }

            if (bestCandidate && bestScore >= 5) {
              amountInput = bestCandidate;
            }
          } catch { }
        }
        if (!amountInput) {
          try {
            const iframes = await driver.findElements(By.css("iframe"));
            for (const frame of iframes) {
              await driver.switchTo().frame(frame);
              for (const sel of ["input[name='amount_other']", "input.input-element[type='number']", "input.n3o-input-amount", "input[placeholder*='amount']"]) {
                const inFrame = await driver.findElements(By.css(sel));
                if (inFrame && inFrame.length > 0) { amountInput = inFrame[0]; break; }
              }
              if (amountInput) break;
              await driver.switchTo().defaultContent();
            }
          } catch (e) { try { await driver.switchTo().defaultContent(); } catch { } }
        }

        if (amountInput) {
          try {
            await amountInput.clear();
            await amountInput.sendKeys(donation_amount.toString());
            amountSelected = true;
            progress("Entered donation amount $" + donation_amount + ".");
            console.log("Typed donation amount");
          } catch { }
        }
        try { await driver.switchTo().defaultContent(); } catch { }

      }

    }
    // -----------------------------------------------

    progress("Entering your information…");
    await fillUserFields(driver, user);

    const nextBtn = detectNextButton(elements);

    if (nextBtn) {

      try {

        progress("Moving to next step…");
        console.log("Clicking next");

        const prev = await driver.findElement(By.css("body"));

        await nextBtn.click();

        await driver.wait(until.stalenessOf(prev), 5000).catch(() => { });

        continue;

      } catch { }

    }

    const payBtn = detectPaymentButton(elements);

    if (payBtn) {

      progress("Ready for payment. Complete payment in the browser window.");
      console.log("Reached payment page");

      try {
        await driver.executeScript(
          "arguments[0].scrollIntoView({behavior:'smooth'})",
          payBtn
        );
      } catch (e) {
        console.warn("scrollIntoView payBtn failed (stale?), continuing");
      }

      break;
    }

  }

  console.log("Automation finished. Ready for payment.");
  progress("Close the browser window when you are done with payment.");

  while (true) {
    try {
      await driver.getWindowHandle();
      await driver.sleep(1000);
    } catch (err) {
      console.log("Browser window closed.");
      break;
    }
  }
}

async function openVisibleCheckout(url) {

  const driver = await new Builder()
    .forBrowser("chrome")
    .build();

  await driver.get(url);

  return driver;
}

// /**
//  * agent_fill_multistep()
//  * Automates donation workflow: select amount, fill personal info, leave page ready for payment
//  * @param {string} url - donation checkout URL
//  * @param {number} donation_amount - desired donation amount
//  * @param {WebDriver} Driver - optional existing Selenium driver
//  */
// async function agent_fill_multistep(url, donation_amount, Driver = null) {
//   let driver = Driver;
//   let createdDriver = false;

//   if (!driver) {
//     const options = new chrome.Options();
//     options.addArguments("--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage");
//     driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
//     createdDriver = true;
//   }

//   try {
//     console.log("Navigating to donation page:", url);
//     await driver.get(url);
//     await driver.wait(until.elementLocated(By.css("body")), 10000);
//     await driver.sleep(2000); // wait for dynamic JS

//     const user = retrieve_user_info();

//     // ========================
//     // Step 1: Select donation amount
//     // ========================
//     let amountFilled = false;

//     // 1a: Try suggested buttons first
//     const suggestedButtons = await driver.findElements(By.css("button, input[type='radio']"));
//     for (let btn of suggestedButtons) {
//       try {
//         const btnValue = await btn.getAttribute("value");
//         if (btnValue && Number(btnValue) === donation_amount) {
//           await btn.click();
//           amountFilled = true;
//           console.log(`Donation amount selected via button: $${donation_amount}`);
//           break;
//         }
//       } catch {}
//     }

//     // 1b: If no button clicked, try numeric input fields
//     if (!amountFilled) {
//       const numericInputs = await driver.findElements(By.css("input[type='number'], input[type='text']"));
//       for (let input of numericInputs) {
//         try {
//           const name = (await input.getAttribute("name") || "").toLowerCase();
//           const id = (await input.getAttribute("id") || "").toLowerCase();
//           if (name.includes("donation") || id.includes("donation") || name.includes("amount") || id.includes("amount")) {
//             await input.clear();
//             await input.sendKeys(donation_amount.toString());
//             amountFilled = true;
//             console.log(`Donation amount entered in input field: $${donation_amount}`);
//             break;
//           }
//         } catch {}
//       }
//     }

//     if (!amountFilled) console.warn("Could not detect donation amount field or button!");

//     await driver.sleep(1000); // wait for dynamic step to load personal info

//     // ========================
//     // Step 2: Fill personal info
//     // ========================
//     const fields = [
//       { keys: ["first", "fname"], value: user.firstName },
//       { keys: ["last", "lname"], value: user.lastName },
//       { keys: ["email"], value: user.email },
//       { keys: ["address", "street"], value: user.address },
//       { keys: ["city", "town"], value: user.city },
//       { keys: ["postal", "zip"], value: user.postalCode },
//       { keys: ["country"], value: user.country },
//     ];

//     for (let field of fields) {
//       for (let key of field.keys) {
//         try {
//           const input = await driver.findElement(By.css(`input[id*='${key}'], input[name*='${key}']`));

//           // SAFEGUARD: skip filling user.address if field id/name has BOTH 'email' AND 'address'
//           if (field.value === user.address) {
//             const id = (await input.getAttribute("id")) || "";
//             const name = (await input.getAttribute("name")) || "";
//             if (id.toLowerCase().includes("email") && id.toLowerCase().includes("address")) continue;
//             if (name.toLowerCase().includes("email") && name.toLowerCase().includes("address")) continue;
//           }

//           await input.clear();
//           await input.sendKeys(field.value.toString());
//           break;
//         } catch {}
//       }
//     }

//     // ========================
//     // Step 3: Scroll to Donate / Review button (optional)
//     // ========================
//     try {
//       const donateBtn = await driver.findElement(By.css("button[type='submit'], button[data-testid*='donate'], button:contains('Donate')"));
//       await driver.executeScript("arguments[0].scrollIntoView(true);", donateBtn);
//     } catch {}

//     console.log("Donation form autofilled across all steps. Ready for submission.");
//     return driver;

//   } catch (err) {
//     console.error("agent_fill_multistep failed:", err);
//     if (createdDriver && driver) await driver.quit();
//     return null;
//   }
// }

//module.exports = agent_donate;
// async function test() {
//   console.log("Starting test...")
//   // const donationInfo = {
//   //   charity: {
//   //     name: "Global Relief Network",
//   //     donation_url: "https://chuffed.org/project/ice-out-of-our-schools"
//   //   }
//   // };

//   const checkoutUrl = await agent_donate(donationInfo);
//   await agent_fill_multistep("https://www.gofundme.com/f/help-cancer-warrior-ka-wai-fight-for-team-canada/donate?source=btn_donate", 200);
//   //console.log("Checkout URL:", checkoutUrl);
//   console.log("Done")
// }

async function donate(email, url, donation_amount, onProgress) {
  const progress = typeof onProgress === "function" ? onProgress : () => { };

  const options = new chrome.Options();
  options.addArguments(
    "--disable-gpu",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-notifications"
  );
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    progress("Opening donation page…");
    console.log("Opening donation page:", url);
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css("body")), 10000);
    await driver.sleep(500); // brief wait for dynamic JS content

    const dbUser = await getUserByEmailFromApi(email);
    if (!dbUser) {
      throw new Error("User not found: " + email);
    }
    const user = mapDbUserToFormUser(dbUser);

    // Agentic link selection: prefer explicit donate links/buttons if present
    //const bestDonationUrl = await findBestDonationLink(driver, url);
    const bestDonationUrl = null;
    const donationUrl = bestDonationUrl || url;

    if (bestDonationUrl) {
      progress("Found donation form, loading…");
      console.log("Resolved donation URL via agentic heuristics:", donationUrl);
    } else {
      progress("Using this page directly as the donation form…");
      console.log("No dedicated donation link detected, staying on:", donationUrl);
    }

    await performMultiStepDonation(driver, donationUrl, user, donation_amount, progress);
    return null;

  } catch (err) {
    progress("Error: " + (err && err.message));
    console.error("Agent donation failed:", err);
    return null;
  } finally {
    try {
      await driver.quit();
    } catch (e) {
      // ignore if window was already closed by user
    }
  }

}

module.exports = {
  agent_fill_multistep,
  agent_donate,
  donate
};