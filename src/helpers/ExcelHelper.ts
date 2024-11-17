import ExcelJS, { Cell, Row, Worksheet } from 'exceljs';
import { DownloadBinaryData } from '../../packages';

export class ExcelHelper {
  readonly #workbook: ExcelJS.Workbook;
  #worksheet: Worksheet | undefined;

  constructor(sheetName: string) {
    this.#workbook = new ExcelJS.Workbook();
    this.#worksheet = this.#workbook.addWorksheet(sheetName);
  }

  /**
   * Sets the columns for the worksheet.
   * @param columns - An array of objects defining header, key, and width for columns.
   */
  setColumns(columns: { header: string; key: string; width?: number }[]): void {
    if (this.#worksheet) {
      this.#worksheet.columns = columns;
    }
  }

  /**
   * Adds a single row to the worksheet.
   * @param data - An object containing key-value pairs that match the worksheet columns.
   */
  addRow(data: Record<string, any>): void {
    if (this.#worksheet) {
      this.#worksheet.addRow(data);
    }
  }

  /**
   * Generates and returns a binary file as a download.
   * @returns {Promise<DownloadBinaryData>} The binary data.
   */
  async generated(): Promise<DownloadBinaryData> {
    const file = await this.#workbook.xlsx.writeBuffer();
    const bufferFile = Buffer.from(file);
    return new DownloadBinaryData(
      bufferFile,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'data.xlsx',
    );
  }

  /**
   * Reads data from an Excel file buffer and returns it as an array of JSON objects.
   * @param fileBuffer - The buffer of the Excel file to read.
   * @returns {Promise<T[]>} Parsed data from the buffer with key types specified by the generic type T.
   */
  async readFile<T extends Record<string, any>>(fileBuffer: Buffer): Promise<T[]> {
    await this.#workbook.xlsx.load(fileBuffer);
    this.#worksheet = this.#workbook.worksheets[0]; // Reads the first worksheet by default

    const data: T[] = [];

    if (this.#worksheet) {
      const headerRow: Row = this.#worksheet.getRow(1);
      const headers: string[] = [];

      // Collect headers
      headerRow.eachCell((cell: Cell, colNumber: number) => {
        headers[colNumber - 1] = cell.text as string;
      });

      // Collect data from subsequent rows
      this.#worksheet.eachRow((row: Row, rowNumber: number) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {} as T;
        row.eachCell((cell: Cell, colNumber: number) => {
          const key = headers[colNumber - 1];
          if (key) {
            // Cast the cell value to T[keyof T]
            rowData[key as keyof T] = cell.value as T[keyof T];
          }
        });
        data.push(rowData);
      });
    }

    return data;
  }
}
