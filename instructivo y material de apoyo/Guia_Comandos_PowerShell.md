# Guía de Comandos PowerShell para el Proyecto

Este documento contiene una lista de comandos comunes utilizados en el desarrollo de este proyecto NestJS con Prisma, explicando su función y el comando correspondiente para PowerShell.

## Comandos NestJS

### Iniciar el servidor de desarrollo
**Función:** Inicia la aplicación en modo desarrollo, reiniciando automáticamente el servidor cuando se detectan cambios en el código.
**Comando:**
```powershell
npm run start:dev
```

### Generar un nuevo Módulo
**Función:** Crea un nuevo módulo en la estructura del proyecto.
**Comando:**
```powershell
nest g module nombre_del_modulo
```

### Generar un nuevo Controlador
**Función:** Crea un nuevo controlador.
**Comando:**
```powershell
nest g controller nombre_del_controlador
```

### Generar un nuevo Servicio
**Función:** Crea un nuevo servicio.
**Comando:**
```powershell
nest g service nombre_del_servicio
```

### Generar un Recurso Completo (CRUD)
**Función:** Genera un conjunto completo de archivos (módulo, controlador, servicio, entidades, DTOs) para un recurso.
**Comando:**
```powershell
nest g resource nombre_del_recurso
```

---

## Comandos Prisma ORM

### Generar el Cliente de Prisma
**Función:** Genera/Actualiza el cliente de Prisma basado en el esquema `schema.prisma`. Se debe ejecutar después de cada cambio en el esquema.
**Comando:**
```powershell
npx prisma generate
```

### Crear una Migración de Base de Datos
**Función:** Crea una nueva migración SQL basada en los cambios del esquema y la aplica a la base de datos de desarrollo.
**Comando:**
```powershell
npx prisma migrate dev --name nombre_de_la_migracion
```

### Abrir Prisma Studio
**Función:** Abre una interfaz gráfica en el navegador para ver y editar los datos de la base de datos.
**Comando:**
```powershell
npx prisma studio
```

### Sincronizar la Base de Datos con el Esquema (Sin Migración)
**Función:** Sincroniza la base de datos con el esquema de Prisma (útil para prototipado rápido, precausión: puede borrar datos).
**Comando:**
```powershell
npx prisma db push
```

---

## Comandos Git

### Ver el estado de los archivos
**Función:** Muestra los archivos modificados, agregados o eliminados que aún no han sido confirmados.
**Comando:**
```powershell
git status
```

### Agregar cambios al área de preparación (Stage)
**Función:** Prepara todos los archivos modificados para ser confirmados en el siguiente commit.
**Comando:**
```powershell
git add .
```

### Confirmar cambios (Commit)
**Función:** Guarda los cambios preparados en el historial local con un mensaje descriptivo.
**Comando:**
```powershell
git commit -m "Descripción de los cambios realizados"
```

### Subir cambios al repositorio remoto (Push)
**Función:** Envía los commits locales a la rama actual en el repositorio remoto (GitHub/GitLab).
**Comando:**
```powershell
git push
```

---

## Comandos NPM (Gestión de Paquetes)

### Instalar dependencias del proyecto
**Función:** Instala todas las dependencias listadas en el archivo `package.json`.
**Comando:**
```powershell
npm install
```

### Instalar una nueva dependencia
**Función:** Instala una nueva librería y la agrega al `package.json`.
**Comando:**
```powershell
npm install nombre_del_paquete
```

### Instalar una dependencia de desarrollo
**Función:** Instala librería necesaria solo para el desarrollo (ej. herramientas de testing, linters).
**Comando:**
```powershell
npm install -D nombre_del_paquete
```
