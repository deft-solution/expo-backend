import fs from 'fs/promises';
import handlebars from 'handlebars';
import puppeteer, { PDFOptions } from 'puppeteer';

export class PdfHelper {
  readonly #templatePath: string;

  constructor(templatePath: string) {
    this.#templatePath = templatePath;
  }

  private async loadTemplate(): Promise<HandlebarsTemplateDelegate> {
    try {
      const templateContent = await fs.readFile(this.#templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      throw new Error(`Failed to load or compile the template: ${(error as Error).message}`);
    }
  }

  public async generatePDF(
    data: Record<string, any>,
    options: PDFOptions = { format: 'A4', printBackground: true },
  ): Promise<Buffer> {
    try {
      const template = await this.loadTemplate();
      const htmlContent = template(data);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate the PDF and ensure it's cast to Buffer
      const pdfBuffer = Buffer.from(await page.pdf(options));

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      throw new Error(`Error generating PDF: ${(error as Error).message}`);
    }
  }
}
