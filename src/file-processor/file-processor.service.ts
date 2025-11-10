import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  async processFile(file: MulterFile): Promise<string[]> {
    const fileName = file.originalname.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.processExcel(file.buffer);
    } else if (fileExtension === 'csv') {
      return this.processCSV(file.buffer);
    } else {
      throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
    }
  }

  private async processExcel(buffer: Buffer): Promise<string[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!data || data.length === 0) {
        throw new Error('Arquivo Excel está vazio');
      }

      const headerRow = data[0] as string[];
      const nomeUserIndex = headerRow.findIndex(
        (cell) => cell?.toString().toLowerCase().trim() === 'nomeuser'
      );

      if (nomeUserIndex === -1) {
        throw new Error('Coluna "nomeUser" não encontrada na primeira linha (A1)');
      }

      const users: string[] = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as string[];
        const userValue = row[nomeUserIndex]?.toString().trim();
        if (userValue && userValue.length > 0) {
          users.push(userValue);
        }
      }

      if (users.length === 0) {
        throw new Error('Nenhum usuário encontrado no arquivo');
      }

      this.logger.log(`Processados ${users.length} usuários do arquivo Excel`);
      return users;
    } catch (error) {
      this.logger.error('Erro ao processar arquivo Excel', error);
      throw new Error(`Erro ao processar Excel: ${error.message}`);
    }
  }

  private async processCSV(buffer: Buffer): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const users: string[] = [];
      let headerFound = false;
      const headerKey = 'nomeUser';

      const stream = Readable.from(buffer.toString('utf-8'));

      stream
        .pipe(csv())
        .on('data', (row: any) => {
          if (!headerFound) {
            const hasNomeUser = Object.keys(row).some(
              (key) => key.toLowerCase().trim() === 'nomeuser'
            );
            if (!hasNomeUser) {
              reject(new Error('Coluna "nomeUser" não encontrada no cabeçalho (primeira linha)'));
              return;
            }
            headerFound = true;
          }

          const userValue =
            row[headerKey] ||
            row['nomeUser'] ||
            row['nomeuser'] ||
            row['NOMEUSER'] ||
            row['NomeUser'];

          if (userValue && userValue.toString().trim().length > 0) {
            users.push(userValue.toString().trim());
          }
        })
        .on('end', () => {
          if (!headerFound) {
            reject(new Error('Cabeçalho "nomeUser" não encontrado no arquivo CSV'));
            return;
          }

          if (users.length === 0) {
            reject(new Error('Nenhum usuário encontrado no arquivo'));
            return;
          }

          this.logger.log(`Processados ${users.length} usuários do arquivo CSV`);
          resolve(users);
        })
        .on('error', (error) => {
          this.logger.error('Erro ao processar arquivo CSV', error);
          reject(new Error(`Erro ao processar CSV: ${error.message}`));
        });
    });
  }
}

