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
  console.log(`Copiando datos de ${sourceFilePath}`);

  const workbook = XLSX.readFile(sourceFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Establecer el nombre de la columna como el código del idioma en la primera fila
  const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: nextCol }); // Primera fila
  mainSheet[headerCellRef] = { v: languageCode, t: "s" };

  console.log(`Leyendo datos desde la columna B de ${sourceFilePath}`);

  // Iniciar en la segunda fila, ya que la primera es el encabezado
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const sourceCellRef = XLSX.utils.encode_cell({ r: R, c: 1 }); // Columna B
    const targetCellRef = XLSX.utils.encode_cell({ r: R, c: nextCol });
    if (sheet[sourceCellRef]) {
      console.log(`Copiando ${sheet[sourceCellRef].v} a la columna ${nextCol}`);
      mainSheet[targetCellRef] = sheet[sourceCellRef];
    }
  }
}

// Ahora, cuando llamas a copyTranslationColumn, también pasas el código del idioma
languageFolders.forEach((languageCode, index) => {
  const filePath = path.join(baseDir, languageCode, mainFileName);
  copyTranslationColumn(filePath, 1 + index, languageCode); // Usar el código del idioma en mayúsculas
});

// Asegurarse de que el rango refleje las nuevas columnas añadidas
// maxCol + languageFolders.length podría sobrepasar el número real de columnas si empezamos desde la columna B
// Así que lo ajustamos a 1 (B) más la cantidad de carpetas de idiomas
ref.e.c = 1 + languageFolders.length - 1; // Restamos 1 porque empezamos desde la columna B (índice 1)
mainSheet["!ref"] = XLSX.utils.encode_range(ref);
console.log(`Nuevo rango de referencia de la hoja: ${mainSheet["!ref"]}`);

// Escribir el archivo Excel actualizado
XLSX.writeFile(mainWorkbook, mainFilePath);
