// const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio')
const express = require("express");
const puppeteer = require('puppeteer')
const app = express();
const talent = require('@google-cloud/talent').v4;
const projectId = 'demografia-388321';
let checkExec = false
app.use(cors());
app.use(express.json());

app.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.post("/message", async (req, res) => {
    try {
    console.log(req.body)
    let url;
    if (req.body.dashedState == null) {
      let reformedDashedCountry = req.body.dashedCountry
      if (reformedDashedCountry == 'Russia') { reformedDashedCountry = 'Russian-Federation' }
      url = 'https://www.erieri.com/salary/job/' + req.body.dashedProfession +'/' + reformedDashedCountry + '/' + req.body.dashedCity
    } else {
      url = 'https://www.erieri.com/salary/job/' + req.body.dashedProfession +'/' + req.body.dashedCountry + '/' + req.body.dashedState + '/' + req.body.dashedCity
    }
    console.log(url)
    let salary = await getSalary(url)
    salary = salary.toString().replace(/\D/g,'');
    res.json(salary)
    } catch(error) {
      console.error(error)
    }
});

app.post("/costOfLiving", async (req, res) => {
  try {
  console.log(req.body)
  let cityVal = req.body.city.replace(/ /g, '-')
  let carUsage = req.body.transportation == "car" ?  60: 0
  let busUsageTaxi = req.body.transportation == "bus" ?  8.4: 0
  let busUsagePublic = req.body.transportation == "bus" ?  'Monthly': 'None'
  let rentVal = ''
  if (req.body.rentLoc != "none") {
    if(req.body.rentLoc == "city") {
      req.body.roommates ? rentVal = '28': rentVal = '26'
    } else {
      req.body.roommates ? rentVal = '29': rentVal = '27'
    }
  }
  if(cityVal == "Rio-de-Janeiro") cityVal = "Rio-De-Janeiro"
  let url = 'https://www.numbeo.com/cost-of-living/city-estimator/in/' 
     + cityVal + '?Recalculated=Submit+to+Recalculate&displayCurrency=' 
     + req.body.calculatedCurrency +'&members=1&restaurants_percentage=' 
     + (req.body.percentRestaurant) + '&inexpensive_restaurants_percentage=80.0&drinking_coffee_outside=0.0&going_out_monthly=4.2&smoking_packs_per_day=0.0&alcoholic_drinks=25.0&type_of_food=0&driving_car='
     + (carUsage) + '&taxi_consumption=' + busUsageTaxi + '&paying_for_public_transport='
     + busUsagePublic + '&sport_memberships=0.0&vacation=49.0&clothing_and_shoes=50.0&rent=' 
     + rentVal + "&kindergarten_count=0&private_schools_count=0"
  console.log(url)
  let finances = await getLivingCost(url)
  res.json(finances)
  } catch(error) {
    console.error(error)
  }
});

app.post("/taxcalc", async (req, res) => {
  try {
  console.log(req.body)
  let plusState = ""
  if (req.body.state != "null") { plusState = req.body.state.replace(/ /g, '+') }
  let url = 'https://app.oysterhr.com/cost-calculator?countryCode=' + req.body.countryCode +'&annualGrossSalary=' + req.body.income + '&currencyCode=' + req.body.selectedCurrency + '&stateOrProvince=' + plusState
  console.log("Oyster URL: " + url)
  let taxData = await getTaxData(url, req.body.state)
  // salary = salary.toString().replace(/\D/g,'');
  console.log("Tax Data: " + taxData)
  res.json(taxData)
  } catch(error) {
    console.error(error)
    res.json("error")
  }
});

app.post("/profauto", async (req, res) => {
    let profauto = await sampleCompleteQuery(req.body.profession)
    res.json(profauto)
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
  });
async function getSalary(url) {
    try {
        const response = await axios.get(url)
        const $= cheerio.load(response.data)
        const salary = $(".annual-salary-label h2").text()
        // console.log(salary)
        return salary
    } catch (error) {
        // console.error(error)
    }
}

async function getLivingCost(url) {
  try {
      const response = await axios.get(url)
      const $= cheerio.load(response.data)
      let itemizedFinancesName = []
      let itemizedFinancesValue = []
      const itemName = $(".tr_highlighted_menu").each( function(i, elm) {
        let modifiedValue = $(this).text().replace('\n', '')
        itemizedFinancesName.push(modifiedValue)
      })
      const itemAmt = $(".th_no_highlight_a_right").each( function(i, elm) {
        let modifiedValue = $(this).toString().replace(/[^\d.-]/g,'');
        itemizedFinancesValue.push(modifiedValue)
      })
      const merged = itemizedFinancesName.reduce((obj, key, index) => ({ ...obj, [key]: itemizedFinancesValue[index] }), {});
      console.log(merged)
      return merged
  } catch (error) {
      console.error(error)
  }
}

async function getTaxData(url, state) {
  try {

      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      // const salary = $(".ml-1").text()
      await page.goto(url)
      // const chain = response.request().redirectChain();
      console.log(page.url())
      if (page.url() == url) {await page.waitForNavigation()}
      if (page.url() == "https://app.oysterhr.com/cost-calculator") { return }
      // await page.waitForSelector('div.ml-4.flex-initial > span', {timeout: 3000})
      let data
        try {
          await page.waitForSelector("#onetrust-close-btn-container > button")
          await page.click("#onetrust-close-btn-container > button")
          await page.waitForTimeout(500)
          console.log("closed out of cookies")
        } catch(error) {
          console.log(error)
        }
        await page.click(" section > ul > li:nth-child(2) > div.w-full.flex-1 > div > button")
        await page.click("div:nth-child(2) > section > ul > li:nth-child(2) > div.w-full.flex-1 > div > button")
        // await page.screenshot({path: 'amazing.png', fullPage: true})
        if (state == "null") {
          data = await page.evaluate(() => {
            let taxName = []
            let taxValue = []
            taxName.push("Total")
            taxValue.push(document.querySelector("div:nth-child(2) > section > ul > li.flex.justify-between.rounded-md.items-center.text-sm.font-semibold.py-1.mb-0 > div.ml-4.flex-initial > span").innerHTML)
            const itemName = document.querySelectorAll("div:nth-child(2) > section > ul > div > li > div.w-full.flex-1").forEach((name) => {
              taxName.push(name.innerHTML)
            })
            const itemAmt = document.querySelectorAll("div:nth-child(2) > section > ul > div > li > div.ml-4.flex-initial > span").forEach((amount) => {
              taxValue.push(amount.innerHTML.replace(/[^\d.-]/g,''))
            })
            const merged = taxName.reduce((obj, key, index) => ({ ...obj, [key]: taxValue[index] }), {});
            return merged
          })
        } else {
          data = await page.evaluate((state) => {
            let base =  document.querySelector(" div.col-span-1 > div.w-full.rounded-md.border-2.border-gray-200 > div.grid.grid-cols-1.gap-2 > div:nth-child(2) > section > ul > div")
            let forEach =  base.querySelectorAll("li > div")
            let USSearchQuery = "Personal Income Tax - "
            let USSearchQueryNull = "Personal Income Tax - Federal"
            let CanadaSearchQuery = "Provincial income tax"
            for(let i = 0; i < forEach.length; i++) {
              if(forEach[i].innerHTML.includes(USSearchQueryNull)) {
                return
              }
              if(forEach[i].innerHTML.includes(USSearchQuery) || forEach[i].innerHTML.includes(CanadaSearchQuery)) {
                return forEach[i + 1].innerHTML
              }
            }
        })
        }
        console.log("on the other side")
        console.log(data)
      await browser.close()
      // console.log(data)
      return data
  } catch (error) {
      // console.error(error)
  }
}
// getTaxData("https://app.oysterhr.com/cost-calculator?countryCode=US&annualGrossSalary=35296&currencyCode=USD&stateOrProvince=", "null")

async function sampleCompleteQuery(
    query
  ) {
    const client = new talent.CompletionClient();
    const tenantId = 'tenant2';
    // const query = '[partially typed job title]';
    const numResults = 5;
    const languageCode = 'en-US';
    const formattedParent = client.tenantPath(projectId, tenantId)
    const languageCodes = [languageCode];
    const request = {
      tenant: formattedParent,
      query: query,
      pageSize: numResults,
       languageCodes: languageCodes,
    };
    let auto = null;
    await client
      .completeQuery(request)
      .then(responses => {
        const response = responses[0];
        auto = response.completionResults
        for (const result of response.completionResults) {
          // console.log(`Suggested title: ${result.suggestion}`);
          // Suggestion type is JOB_TITLE or COMPANY_TITLE
          // console.log(`Suggestion type: ${result.type}`);
        }
      })
      .catch(err => {
        console.error(err);
        console.log("Query Error")
      });
      return auto
  }

  // async function debugTaxData() {
  //   try {
  //       const url = "https://app.oysterhr.com/cost-calculator?countryCode=US&annualGrossSalary=100000&currencyCode=USD&stateOrProvince=New+York"
  //       const state = "New York"
  //       const browser = await puppeteer.launch({ headless: true})
  //       const page = await browser.newPage()
  //       // const salary = $(".ml-1").text()
  //       await page.goto(url)
  //       await page.waitForSelector('div.ml-4.flex-initial > span')
  //       let data
  //       if (state == "null") {
  //         data = await page.evaluate(() => {
  //           return document.querySelector('div:nth-child(2) > section > ul > li.flex.justify-between.rounded-md.items-center.text-sm.font-semibold.py-1.mb-0 > div.ml-4.flex-initial > span').outerHTML
  //         })
  //       } else {
  //         await page.click("#onetrust-close-btn-container > button")
  //         await page.waitForTimeout(500)
  //         await page.click(" section > ul > li:nth-child(2) > div.w-full.flex-1 > div > button")
  //         await page.click("div:nth-child(2) > section > ul > li:nth-child(2) > div.w-full.flex-1 > div > button")
  //         // await page.screenshot({path: 'amazing.png', fullPage: true})
  //         // await page.waitForSelector("section > ul > div")
  //         data = await page.evaluate((state) => {
  //             let base =  document.querySelector(" div.col-span-1 > div.w-full.rounded-md.border-2.border-gray-200 > div.grid.grid-cols-1.gap-2 > div:nth-child(2) > section > ul > div")
  //             let forEach =  base.querySelectorAll("li > div")
  //             let searchQuery = "Personal Income Tax - "
  //             for(let i = 0; i < forEach.length; i++) {
  //               if(forEach[i].innerHTML.includes(searchQuery)) {
  //                 return forEach[i + 1].innerHTML
  //               }
  //             }
  //         })
  //       }
  //       await browser.close()
  //       console.log(data)
  //       return data
  //   } catch (error) {
  //       console.error(error)
  //   }
  // }
  // debugTaxData()