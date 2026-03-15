const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");
const USER_INFO = {
  firstName: "Carol",
  lastName: "Wang",
  email: "carol@example.com",
  address: "123 Main St",
  city: "Toronto",
  postalCode: "M4B1B3",
  country: "Canada"
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

function retrieve_user_info() {
  // In a real implementation, this would securely fetch user info from a database or secure vault
  return USER_INFO;
}

/**
 * agent_fill_multistep()
 * Automates donation workflow: select amount, fill personal info, leave page ready for payment
 * @param {string} url - donation checkout URL
 * @param {number} donation_amount - desired donation amount
 * @param {WebDriver} Driver - optional existing Selenium driver
 */
async function agent_fill_multistep(url, donation_amount, Driver = null) {
  let driver = Driver;
  let createdDriver = false;

  if (!driver) {
    const options = new chrome.Options();
    options.addArguments("--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    createdDriver = true;
  }

  try {
    console.log("Navigating to donation page:", url);
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css("body")), 10000);
    await driver.sleep(2000); // wait for dynamic JS

    const user = retrieve_user_info();

    // ========================
    // Step 1: Select donation amount
    // ========================
    let amountFilled = false;

    // 1a: Try suggested buttons first
    const suggestedButtons = await driver.findElements(By.css("button, input[type='radio']"));
    for (let btn of suggestedButtons) {
      try {
        const btnValue = await btn.getAttribute("value");
        if (btnValue && Number(btnValue) === donation_amount) {
          await btn.click();
          amountFilled = true;
          console.log(`Donation amount selected via button: $${donation_amount}`);
          break;
        }
      } catch {}
    }

    // 1b: If no button clicked, try numeric input fields
    if (!amountFilled) {
      const numericInputs = await driver.findElements(By.css("input[type='number'], input[type='text']"));
      for (let input of numericInputs) {
        try {
          const name = (await input.getAttribute("name") || "").toLowerCase();
          const id = (await input.getAttribute("id") || "").toLowerCase();
          if (name.includes("donation") || id.includes("donation") || name.includes("amount") || id.includes("amount")) {
            await input.clear();
            await input.sendKeys(donation_amount.toString());
            amountFilled = true;
            console.log(`Donation amount entered in input field: $${donation_amount}`);
            break;
          }
        } catch {}
      }
    }

    if (!amountFilled) console.warn("Could not detect donation amount field or button!");

    await driver.sleep(1000); // wait for dynamic step to load personal info

    // ========================
    // Step 2: Fill personal info
    // ========================
    const fields = [
      { keys: ["first", "fname"], value: user.firstName },
      { keys: ["last", "lname"], value: user.lastName },
      { keys: ["email"], value: user.email },
      { keys: ["address", "street"], value: user.address },
      { keys: ["city", "town"], value: user.city },
      { keys: ["postal", "zip"], value: user.postalCode },
      { keys: ["country"], value: user.country },
    ];

    for (let field of fields) {
      for (let key of field.keys) {
        try {
          const input = await driver.findElement(By.css(`input[id*='${key}'], input[name*='${key}']`));

          // SAFEGUARD: skip filling user.address if field id/name has BOTH 'email' AND 'address'
          if (field.value === user.address) {
            const id = (await input.getAttribute("id")) || "";
            const name = (await input.getAttribute("name")) || "";
            if (id.toLowerCase().includes("email") && id.toLowerCase().includes("address")) continue;
            if (name.toLowerCase().includes("email") && name.toLowerCase().includes("address")) continue;
          }

          await input.clear();
          await input.sendKeys(field.value.toString());
          break;
        } catch {}
      }
    }

    // ========================
    // Step 3: Scroll to Donate / Review button (optional)
    // ========================
    try {
      const donateBtn = await driver.findElement(By.css("button[type='submit'], button[data-testid*='donate'], button:contains('Donate')"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", donateBtn);
    } catch {}

    console.log("Donation form autofilled across all steps. Ready for submission.");
    return driver;

  } catch (err) {
    console.error("agent_fill_multistep failed:", err);
    if (createdDriver && driver) await driver.quit();
    return null;
  }
}

//module.exports = agent_donate;
async function test() {
  console.log("Starting test...")
  // const donationInfo = {
  //   charity: {
  //     name: "Global Relief Network",
  //     donation_url: "https://chuffed.org/project/ice-out-of-our-schools"
  //   }
  // };

  // const checkoutUrl = await agent_donate(donationInfo);
  await agent_fill_multistep("https://www.gofundme.com/f/help-cancer-warrior-ka-wai-fight-for-team-canada/donate?source=btn_donate", 200);
  //console.log("Checkout URL:", checkoutUrl);
  console.log("Done")
}