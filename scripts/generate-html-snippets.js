const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const docPath = `https://github.com/microsoftgraph/microsoft-graph-docs/tree/main/concepts/toolkit/components`;

const fetchProps = async (url) => {
  const component = `mgt-${path.parse(url).name}`;
  console.log(`Fetching "${component}" docs`);

  const autocomplete = [];

  const response = await fetch(`https://github.com${url}`, {
    headers: {
      "accept": "text/html"
    }
  });

  if (!response || !response.ok) {
    console.log(`Failed to retrieve the component docs.`);
    console.log(response.statusText);
    return;
  }

  const docs = await response.text();
  const $ = cheerio.load(docs);

  const $propsHeading = $(`h2:contains(Properties)`);
  if ($propsHeading) {
    const $table = $propsHeading.nextAll("table").first().find("tbody tr");

    for (const $row of $table) {
      const $elm = $($row);
      const $cols = $elm.find(`td`);

      const attribute = $($cols[0]).text();
      if (attribute.toLowerCase() !== "n/a") {
        autocomplete.push({
          attribute,
          property: $($cols[1]).text(),
          description: $($cols[2]).text(),
        })
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, `../autocomplete/html/${component}.json`), JSON.stringify(autocomplete, null, 2), { encoding: "utf-8" });
}

(async () => {

  const response = await fetch(docPath, {
    headers: {
      "accept": "text/html"
    }
  });

  if (!response || !response.ok) {
    console.log(`Failed to retrieve the README.md file contents.`);
    console.log(response.statusText);
    return;
  }

  const readmeTxt = await response.text();
  const $ = cheerio.load(readmeTxt);

  const $components = $(`a[href*="/microsoftgraph/microsoft-graph-docs/blob/main/concepts/toolkit/components/"]`);
  for (const $component of $components) {
    await fetchProps($($component).attr("href"));
  }
})();