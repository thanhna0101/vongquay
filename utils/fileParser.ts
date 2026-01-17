import * as XLSX from 'xlsx';

export const parseExcelFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve([]);
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON array (assuming simple list or single column)
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const items: string[] = [];
        jsonData.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach((cell: any) => {
              if (cell && typeof cell === 'string' && cell.trim() !== '') {
                items.push(cell.trim());
              } else if (cell && typeof cell === 'number') {
                items.push(cell.toString());
              }
            });
          }
        });

        resolve(items);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const parseCSVFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }
      // Simple split by newline
      const items = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      resolve(items);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};