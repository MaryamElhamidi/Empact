const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const users = require("./db/users");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

require("chromedriver");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


/* =========================
   USER MAPPING
========================= */

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


/* =========================
   DRIVER
========================= */

async function openDriver() {

  const options = new chrome.Options();

  options.addArguments(
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer"
  );

  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}


/* =========================
   CLEAN GEMINI JSON
========================= */

function cleanJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}


/* =========================
   ENSURE ELEMENT IDS
========================= */

async function ensureElementIds(driver) {

  await driver.executeScript(() => {

    let counter = 0;

    const elements = document.querySelectorAll(
      "button,a,input,textarea,select"
    );

    elements.forEach(el => {

      if (!el.id) {
        el.id = "agent_id_" + counter++;
      }

    });

  });

}


/* =========================
   PAGE SUMMARY
========================= */

async function summarizePage(driver) {

  await ensureElementIds(driver);

  return driver.executeScript(() => {

    function clean(t){
      return (t || "").toLowerCase().replace(/\s+/g," ").slice(0,80);
    }

    const buttons = [...document.querySelectorAll("button,a,input[type=submit]")]
      .map(el => ({
        id: el.id,
        text: clean(el.innerText || el.value),
        tag: el.tagName
      }))
      .slice(0,40);

    const inputs = [...document.querySelectorAll("input,textarea")]
      .map(el => ({
        id: el.id,
        name: el.name || "",
        placeholder: clean(el.placeholder),
        type: el.type
      }))
      .slice(0,40);

    const radios = [...document.querySelectorAll("input[type=radio]")]
      .map(el => ({
        id: el.id,
        name: el.name,
        value: el.value
      }))
      .slice(0,20);

    return { buttons, inputs, radios };

  });

}


/* =========================
   GEMINI DECISION
========================= */

async function askGemini(pageSummary, donationAmount, user, step) {

  const prompt = `
You are a browser automation agent helping donate to a charity.

Goal:
Complete the donation form.

You MUST return ONLY valid JSON.

Allowed actions:
click
type
done

Formats:

Click a button:
{"action":"click","id":"element_id"}

Type into an input:
{"action":"type","id":"input_id","text":"value"}

Finish:
{"action":"done"}

Rules:
- The id MUST match an element id listed below
- Never invent ids
- Prefer clicking donation amount buttons first
- Then fill the form
- Then click continue or donate

Donation amount:
${donationAmount}

User data:
${JSON.stringify(user)}

Step:
${step}

Buttons:
${JSON.stringify(pageSummary.buttons)}

Inputs:
${JSON.stringify(pageSummary.inputs)}

Radios:
${JSON.stringify(pageSummary.radios)}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const raw = res.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("Gemini raw:", raw);

  const cleaned = cleanJSON(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    return { action: "none" };
  }

}


/* =========================
   EXECUTE ACTION
========================= */

async function executeAction(driver, action) {

  if (!action || !action.id) return;

  if (action.action === "click") {

    try {

      const el = await driver.findElement(By.id(action.id));

      console.log("Clicking:", action.id);

      await el.click();

    } catch(e){
      console.log("Click failed:", e.message);
    }

  }

  if (action.action === "type") {

    try {

      const el = await driver.findElement(By.id(action.id));

      console.log("Typing:", action.text);

      await el.clear();

      await el.sendKeys(action.text);

    } catch(e){
      console.log("Typing failed:", e.message);
    }

  }

}


/* =========================
   FIND DONATION LINK
========================= */

async function findDonationLink(driver, url) {

  await driver.get(url);

  await driver.wait(until.elementLocated(By.css("body")), 10000);

  const link = await driver.executeScript(() => {

    const anchors = [...document.querySelectorAll("a")];

    for (let a of anchors){

      const href = a.href || "";
      const text = (a.innerText || "").toLowerCase();

      if(
        href.includes("donate") ||
        text.includes("donate")
      ){
        return href;
      }

    }

    return null;

  });

  return link || url;

}


/* =========================
   SWITCH TO IFRAME
========================= */

async function switchToDonationFrame(driver){

  const frames = await driver.findElements(By.css("iframe"));

  if(frames.length > 0){

    console.log("Switching to iframe");

    await driver.switchTo().frame(frames[0]);

  }

}


/* =========================
   FALLBACK CLICK
========================= */

async function fallbackClick(driver){

  console.log("Fallback click");

  const btn = await driver.findElement(
    By.xpath("//button|//a")
  ).catch(()=>null);

  if(btn){
    await btn.click();
  }

}


/* =========================
   MAIN AGENT
========================= */

async function donate(email, url, donationAmount) {

  const driver = await openDriver();

  try {

    const dbUser = await users.getUserByEmail(email);

    if(!dbUser)
      throw new Error("User not found");

    const user = mapDbUserToFormUser(dbUser);

    console.log("Opening charity page:", url);

    const donationUrl = await findDonationLink(driver, url);

    console.log("Donation page:", donationUrl);

    await driver.get(donationUrl);

    await driver.wait(until.elementLocated(By.css("body")), 10000);

    await switchToDonationFrame(driver);

    for (let step = 0; step < 10; step++) {

      console.log("Agent step:", step);

      const pageSummary = await summarizePage(driver);

      const decision = await askGemini(
        pageSummary,
        donationAmount,
        user,
        step
      );

      console.log("Gemini decision:", decision);

      if(decision.action === "done"){
        break;
      }

      if(decision.action === "none"){
        await fallbackClick(driver);
      } else {
        await executeAction(driver, decision);
      }

      await driver.sleep(1200);

      const screenshot = await driver.takeScreenshot();

      fs.writeFileSync(`step-${step}.png`, screenshot, "base64");

    }

    console.log("Automation finished — ready for payment.");

    return driver;

  } catch (err) {

    console.error("Agent failed:", err);

    await driver.quit();

    return null;

  }

}


/* =========================
   TEST
========================= */

async function test(){

  await donate(
    "carolzjwang@gmail.com",
    "https://www.unicef.ca/en",
    15
  );

}

test();