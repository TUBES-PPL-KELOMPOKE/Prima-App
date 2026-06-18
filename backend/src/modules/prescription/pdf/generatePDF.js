import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import puppeteer from "puppeteer";

export async function generatePrescriptionPdf(data) {
    const templatePath = path.join(
        process.cwd(),
        "src/modules/prescription/pdf/template.hbs"
    );

    const html = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(html);

    handlebars.registerHelper("inc", function (value) {
        return parseInt(value) + 1;
    });

    const finalHtml = template(data);

    return finalHtml;
}