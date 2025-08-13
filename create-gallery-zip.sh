#!/bin/bash

# Script para crear un ZIP con todas las imágenes de las galerías
# Ejecuta este script desde la raíz del proyecto

echo "Creando ZIP con todas las imágenes de las galerías..."

# Crear directorio temporal
mkdir -p gallery_images_export

# Copiar imágenes de SESIONES
echo "Copiando imágenes de Sesiones..."
cp "attached_assets/1_1752354232707.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 1_1752354232707.jpg"
cp "attached_assets/2_1752354232708.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 2_1752354232708.jpg"
cp "attached_assets/4_1752354232710.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 4_1752354232710.jpg"
cp "attached_assets/6_1752354232710.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 6_1752354232710.jpg"
cp "attached_assets/7_1752354240688.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 7_1752354240688.jpg"
cp "attached_assets/8_1752354240688.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 8_1752354240688.jpg"
cp "attached_assets/10_1752354252787.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 10_1752354252787.jpg"
cp "attached_assets/11 2_1752354252788.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 11 2_1752354252788.jpg"
cp "attached_assets/16x20_1749966448545.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 16x20_1749966448545.jpg"
cp "attached_assets/17_1749966713506.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 17_1749966713506.jpg"
cp "attached_assets/21_1749966994957.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 21_1749966994957.jpg"
cp "attached_assets/27_1749966044501.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 27_1749966044501.jpg"
cp "attached_assets/28_1749966163179.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 28_1749966163179.jpg"
cp "attached_assets/3_1749966340027.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 3_1749966340027.jpg"
cp "attached_assets/2_1749967322187.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 2_1749967322187.jpg"

# Copiar imágenes de BODAS
echo "Copiando imágenes de Bodas..."
cp "attached_assets/IMG_0415_1749964899395.JPG" gallery_images_export/ 2>/dev/null || echo "No encontrada: IMG_0415_1749964899395.JPG"
cp "attached_assets/31_1749968657397.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 31_1749968657397.jpg"
cp "attached_assets/39_1749968671265.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 39_1749968671265.jpg"
cp "attached_assets/48_1749968683511.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 48_1749968683511.jpg"
cp "attached_assets/49_1749968689509.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 49_1749968689509.jpg"
cp "attached_assets/0153_1749968831633.JPG" gallery_images_export/ 2>/dev/null || echo "No encontrada: 0153_1749968831633.JPG"
cp "attached_assets/0299_1749968860418.JPG" gallery_images_export/ 2>/dev/null || echo "No encontrada: 0299_1749968860418.JPG"
cp "attached_assets/72_1749968935429.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 72_1749968935429.jpg"
cp "attached_assets/74_1749968942020.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 74_1749968942020.jpg"
cp "attached_assets/79_1749968952606.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 79_1749968952606.jpg"
cp "attached_assets/145_1749968986304.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 145_1749968986304.jpg"

# Copiar imágenes de BAUTIZOS
echo "Copiando imágenes de Bautizos..."
cp "attached_assets/0100_1749965177206.JPG" gallery_images_export/ 2>/dev/null || echo "No encontrada: 0100_1749965177206.JPG"
cp "attached_assets/3_1749965551926.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 3_1749965551926.jpg"
cp "attached_assets/27_1749965590912.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 27_1749965590912.jpg"
cp "attached_assets/5_1749965881317.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 5_1749965881317.jpg"

# Copiar imágenes de COMUNIONES
echo "Copiando imágenes de Comuniones..."
cp "attached_assets/11x14_1749964801946.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 11x14_1749964801946.jpg"
cp "attached_assets/129_1749967808354.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 129_1749967808354.jpg"
cp "attached_assets/6x8_1749968512184.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 6x8_1749968512184.jpg"
cp "attached_assets/11x14C_1749968111869.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 11x14C_1749968111869.jpg"
cp "attached_assets/3_1749968534675.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 3_1749968534675.jpg"
cp "attached_assets/17_1749968552420.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 17_1749968552420.jpg"

# Copiar imágenes de FOTOGRAFÍA ESCOLAR
echo "Copiando imágenes de Fotografía Escolar..."
cp "attached_assets/6º A_1752356557517.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 6º A_1752356557517.jpg"
cp "attached_assets/6º Bel_1752356557518.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 6º Bel_1752356557518.jpg"
cp "attached_assets/8X 6T Aarón_1752356557518.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 8X 6T Aarón_1752356557518.jpg"
cp "attached_assets/8X 6TKarlita_1752356557518.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 8X 6TKarlita_1752356557518.jpg"
cp "attached_assets/8x BSalomon_1752356557519.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: 8x BSalomon_1752356557519.jpg"
cp "attached_assets/Preesco Bel_1752356557519.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: Preesco Bel_1752356557519.jpg"
cp "attached_assets/TSCamila 2_1752356557520.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: TSCamila 2_1752356557520.jpg"
cp "attached_assets/TSMarco 3_1752356557520.jpg" gallery_images_export/ 2>/dev/null || echo "No encontrada: TSMarco 3_1752356557520.jpg"

# Crear el ZIP
echo "Creando archivo ZIP..."
cd gallery_images_export
zip -r ../gallery_images.zip . -x "*.DS_Store"
cd ..

# Limpiar directorio temporal
rm -rf gallery_images_export

echo "¡Listo! Se ha creado el archivo 'gallery_images.zip' con todas las imágenes de las galerías."
echo "Total de imágenes incluidas: $(unzip -l gallery_images.zip | wc -l | awk '{print $1-3}')"