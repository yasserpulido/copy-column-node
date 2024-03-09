const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Directorio donde está ubicado el script.js
const baseDir = path.resolve(`${__dirname}/translations`); // path.resolve() convierte una ruta relativa en absoluta

console.log(`El directorio base es: ${baseDir}`);

// Obtener una lista de todas las carpetas de idiomas, excluyendo 'EN' y 'node_modules'
const languageFolders = fs.readdirSync(baseDir).filter((file) => {
  const fullPath = path.join(baseDir, file);
  return (
    fs.statSync(fullPath).isDirectory() &&
    file !== "en-US" &&
    file !== "node_modules"
  );
});

console.log(`Carpetas de idiomas encontradas: ${languageFolders}`);

const mainFolder = "en-US";
const mainFileName = "[NOMBRE_DEL_ARCHIVO].xlsx";
const mainFilePath = path.join(baseDir, mainFolder, mainFileName);

console.log(`Ruta al archivo principal: ${mainFilePath}`);

// Leer el archivo principal
let mainWorkbook = XLSX.readFile(mainFilePath);
let mainSheetName = mainWorkbook.SheetNames[0];
let mainSheet = mainWorkbook.Sheets[mainSheetName];

// Determinar la última columna utilizada en el archivo principal antes de llamar a copyTranslationColumn
let ref = XLSX.utils.decode_range(mainSheet["!ref"]);
let maxCol = ref.e.c; // maxCol se define en este ámbito

// Función para copiar la columna TRANSLATION al archivo principal
function copyTranslationColumn(sourceFilePath, nextCol, languageCode) {
  // Asegúrate de que el archivo existe antes de intentar copiar desde él
  if (!fs.existsSync(sourceFilePath)) {
    console.error(`El archivo no existe: ${sourceFilePath}`);
    return;
  }

  console.log(`Copiando desde: ${sourceFilePath}`);

  const workbook = XLSX.readFile(sourceFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const range = XLSX.utils.decode_range(sheet["!ref"]);
  // Copiar desde la columna C (índice 2)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const sourceCellRef = XLSX.utils.encode_cell({ r: R, c: 2 });
    const targetCellRef = XLSX.utils.encode_cell({ r: R, c: nextCol });
    if (sheet[sourceCellRef]) {
      mainSheet[targetCellRef] = sheet[sourceCellRef];
    }
  }

  // Actualiza el nombre de la columna con el código del idioma
  mainSheet[XLSX.utils.encode_cell({ r: 0, c: nextCol })] = {
    v: languageCode,
    t: "s",
  };
}

// Obtén la referencia de la última columna con datos del archivo principal
let lastColRef = XLSX.utils.decode_range(mainSheet["!ref"]).e.c;

// Copia las columnas de cada idioma al archivo principal
languageFolders.forEach((languageCode, index) => {
  const filePath = path.join(baseDir, languageCode, mainFileName);
  if (fs.existsSync(filePath)) {
    // El índice de la siguiente columna es la última columna con datos más uno por cada idioma
    const nextColIndex = lastColRef + 1 + index;
    copyTranslationColumn(filePath, nextColIndex, languageCode);
  } else {
    console.error(
      `No se pudo encontrar el archivo para el idioma ${languageCode}: ${filePath}`
    );
  }
});

// Actualiza el rango de referencia de la hoja principal para incluir todas las nuevas columnas
mainSheet["!ref"] = XLSX.utils.encode_range({
  s: { r: 0, c: 0 },
  e: {
    r: XLSX.utils.decode_range(mainSheet["!ref"]).e.r,
    c: lastColRef + languageFolders.length,
  },
});

// Guarda el archivo principal
XLSX.writeFile(mainWorkbook, mainFilePath);
console.log(`Archivo guardado: ${mainFilePath}`);
