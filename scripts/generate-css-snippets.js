const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');
const doctrine = require("doctrine");
const parser = require('@babel/parser');

const searchPath = `**/microsoft-graph-toolkit/packages/mgt-components/**/mgt-*.ts`;
const readmeTmplPath = '../README_TMPL.md';
const readmePath = '../README.md';

(async () => {
  const entries = await fg([searchPath]);

  let cssVariables = [];
  let components = [];

  for (const file of entries) {
    const filePath = path.join(__dirname, '../', file);

    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath, { encoding: 'utf-8' });

      const parsedData = parser.parse(contents, { sourceType: "module", plugins: [
        "typescript",
        "decorators-legacy",
        "classProperties",
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ]});
      
      if (parsedData && parsedData.comments && parsedData.comments.length > 0) {
        for (const comment of parsedData.comments) {
          if (comment && comment.value.includes("@cssprop")) {
            const parsedDocs = doctrine.parse(`/${comment.value}/`, { unwrap: true });
            if (parsedDocs && parsedDocs.tags && parsedDocs.tags.length > 0) {
              const tags = parsedDocs.tags.filter(t => t.title === "cssprop");
              if (tags && tags.length > 0) {
                for (const tag of tags) {
                  const values = tag.description.split(' - ');
                  if (values.length === 2) {
                    if (!cssVariables.find(c => c.key === values[0])) {
                      const component = path.parse(filePath).name;

                      cssVariables.push({
                        key: values[0],
                        description: values[1].split("} ").pop().replace(/\n/g, "").replace(/\//g, ""),
                        type: values[1].split("} ")[0].substring(1).toLowerCase(),
                        component
                      });

                      components.push(component)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Create the variables file for autocomplete
  fs.writeFileSync(path.join(__dirname, '../src/css.variables.json'), JSON.stringify(cssVariables), { encoding: "utf-8" });

  // Create the snippet files
  const uniqComponents = [...new Set(components)];

  const cssSnippets = {};
  for (const component of uniqComponents) {
    cssSnippets[component] = {
      "prefix": component,
      "body": [
        `${component}\${1:.custom-class} {`,
        `  \${2:}`,
        `}`
      ],
      "description": `Create custom styles for the "${component}" component.`
    }
  }
  fs.writeFileSync(path.join(__dirname, '../snippets/css.components.json'), JSON.stringify(cssSnippets), { encoding: "utf-8" });

  const htmlSnippets = {};
  for (const component of uniqComponents) {
    htmlSnippets[component] = {
      "prefix": component,
      "body": [`<${component} \${1:}></${component}>`],
      "description": `Adds the "${component}" component.`
    }
  }
  fs.writeFileSync(path.join(__dirname, '../snippets/html.components.json'), JSON.stringify(htmlSnippets), { encoding: "utf-8" });


  const tmplPath = path.join(__dirname, readmeTmplPath);
  const mdPath = path.join(__dirname, readmePath);

  if (fs.existsSync(tmplPath) && fs.existsSync(mdPath)) {
    let mdContent = fs.readFileSync(tmplPath, { encoding: "utf-8" });
    
    if (mdContent) {
      mdContent = mdContent.replace(`{HTML_SNIPPETS}`, uniqComponents.map(c => `| \`${c}\` |`).join(`\n`));
      mdContent = mdContent.replace(`{CSS_SNIPPETS}`, uniqComponents.map(c => `| \`${c}\` |`).join(`\n`));
      fs.writeFileSync(mdPath, mdContent, { encoding: "utf-8"})
    }
  }
})();