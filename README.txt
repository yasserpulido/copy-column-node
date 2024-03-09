1.Copiar el archivo .zip que contiene las carpetas de lenguajes como por ejemplo: "en-US", "es-ES"; dentro de la carpeta translations.
2.Dentro de la carpeta translations, descomprimimos el archivo .zip, quedando solo el nombre de los lenguajes.
	/translations/en-US
	/translations/es-ES
3.DEBE quedar dentro de la carpeta translation las carpetas "es-EN", etc.
4.Dependiendo del model de excel que queramos aplicar el script, abrimos el archivo script-basic.js o script-complex.js.
5.En la siguiente linea de codigo, reemplazamos [NOMBRE_DEL_ARCHIVO] por el nombre del excel a procesar:
	const mainFileName = "[NOMBRE_DEL_ARCHIVO].xlsx";
	const mainFileName = "translation for windows.xlsx"; (por ejemplo)
6.Copiamos la ruta donde estan los archivos de scripts a utilizar.
7.Abrimos el CMD de windows.
8.Escribimos "cd [RUTA_QUE_COPIAMOS]" sin comillas y apretamos enter.
9.Si tenemos dentro de la carpeta translations los excel del modelo basico, ejecutamos en el CMD, el siguiente comando:
	node script-basic.js
  Si tenemos el modelo complejo:
	node script-complex.js
10.Apretamos enter y dejamos que corra el script.
11.Verificamos dentro de la carpeta en-US que se hayan afectado los cambios.

NOTAS:

- Repetir el mismo proceso para archivos con nombre diferente.
- Una vez que este todo listo mover las carpetas de los lenguajes a otra ubicacion y dejar la carpeta translations vacia, para cada modelo.