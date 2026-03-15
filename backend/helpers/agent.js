const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const users = require("./db/users");

require("chromedriver");

/** Map DB user (snake_case) to shape expected by fillUserFields (camelCase) */
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

    return els.map(el => ({
      el,
      text: (el.innerText || "").toLowerCase(),
      aria: (el.getAttribute("aria-label") || "").toLowerCase(),
      name: (el.name || "").toLowerCase(),
      id: (el.id || "").toLowerCase(),
      cls: (el.className || "").toLowerCase()
    }));

  });

}

function detectAmountButton(elements, amount) {

  for (let e of elements) {

    const match = e.text.match(/[\$£€]?\s?(\d+(\.\d+)?)/);

    if (match) {

      const value = parseFloat(match[1]);

      if (value === amount) {
        return e.el;
      }

    }
  }

  return null;
}

function detectAmountInput(elements) {

  for (let e of elements) {

    if (
      e.name.includes("amount") ||
      e.id.includes("amount") ||
      e.cls.includes("amount")
    ) {
      return e.el;
    }
  }

  return null;
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

  const keywords = ["donate", "pay", "submit", "complete"];

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
  const dbUser = await users.getUserByEmail(email);
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

          const amountInput = detectAmountInput(elements);

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

        await driver.executeScript(
          "arguments[0].scrollIntoView({behavior:'smooth'})",
          payBtn
        );

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
    await driver.sleep(2000); // wait for dynamic JS content

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

async function donate(email, url, amount) {
  const donate_url = await agent_donate(url);
  await agent_fill_multistep(
    email, 
    donate_url,
    amount
  );

}

async function test() {

  await agent_fill_multistep(
    "carolzjwang@gmail.com",
    "https://secure.unicef.ca/page/31858/donate/1",
    15
  );

}

//test();