const express = require('express');
const dotenv = require('dotenv');
const fs = require("fs");
var stringify = require("csv-stringify");
const puppeteer = require("puppeteer");

dotenv.config({path:'./config/config.env'})

const PORT = process.env.PORT;
const app = express();

uri =
  "https://www.arcgis.com/home/item.html?id=38d6e70833984ab882ef04deb96c36f0&sublayer=0#data";
fetchData = async () => {
  //using puppteer

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    // product:'firefox',
    //executablePath: path.resolve(
    // __dirname,
    // "../node_modules/puppeteer/.local-firefox/linux-79.0a1/firefox/firefox"
    // ),
    headless: true,
  });

  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  await page.goto(uri);
  //await scrollToBottom(page);

  await page.setViewport({
    width: 800,
    height: 600,
  });
 // await autoScroll(page);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await sleep(10000);

  const dataHeader = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("table tr th"));
    return tds.map((td) => td.innerText);
  });
  const data = await page.evaluate(() => {
    //const headers = Array.from( document.querySelectorAll("table th "));

    const rows = document.querySelectorAll("table tr ");
    return Array.from(rows, (row) => {
      const columns = row.querySelectorAll("td");
      return Array.from(columns, (column) => column.innerText);
    });
    //const tds = Array.from(document.querySelectorAll("table tr td"));
    //return tds.map((td) => td.innerText);
  });

  console.log("cases: ", data);
  console.log("cases header: ", dataHeader);

  stringify(
    { header: true, columns: dataHeader },
    data,
    (err, output) => {
      fs.writeFile("input.csv", output, "utf8", function (err) {
        if (err) {
          console.log(
            "Some error occured - file either not saved or corrupted file saved."
          );
        } else {
          console.log("It's saved!");
        }
      });
    }
  );

  await navigationPromise
  await page.close();
  await browser.close();
};
fetchData();


app.listen(PORT, console.log(`Server listening on port ${PORT}`));
