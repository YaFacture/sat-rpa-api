<p align="center">
  <img width="230" src="https://cdn.yafacture.com/media/yafacture.png" alt="YaFacture" style="border-radius: 8px"/>
</p>

# 📱 SAT RPA - Yafacture

`sat-rpa` es una proyecto REST API de RPA para obtener diversos documentos PDF del SAT en México, muy fácil de utilizar con Docker.

## ✨ Características

- 1️⃣ Constancia de situación fiscal (PDF)
- 2️⃣ Opinión de cumplimiento (PDF + información extraída del documento)

<br/>

## 🐳 Docker

> https://hub.docker.com/r/blakegt/yafacture-sat-rpa

```bash
docker run --restart unless-stopped -dp 8004:8004 --name yafacture-sat-rpa yafacture-sat-rpa:latest
```

<br/>

## 👨🏻‍💻 Modo desarrollador

Clonar el repositorio

```bash
git clone https://github.com/Yafacture/sat-rpa.git
```

Instala las dependencias:

```bash
cd sat-rpa
npm install or pnpm i
```

Inicia el servidor (nodemon):

```bash
npm run dev or pnpm dev
```

<br/>

## 🛠️ API Endpoints

- `POST` /constancia-situacion-fiscal
 
    **Obten la constancia de situación fiscal de un emisor**

    <br/>

    Request Body: `application/json`

    `curl -X POST http://localhost:8004/constancia-situacion-fiscal \
    -H "Content-Type: application/json" -d {...body}`

    <br/>
    
    **Ejemplo de payload**:

    - Mediante contraseña:
    
    ```json
    {
        "rfc": "XAXX010101000",
        "password": "yafacture",
    }
    ```
    
    - Mediante e.firma (FIEL):
    
    ```json
    {
        "password": "yafacture",
        "base64Cer": "data:application/x-x509-ca-cert;base64,MIIGRjCCB...",
        "base64Key": "data:application/x-iwork-keynote-sffkey;base64,MIIGRjCCB..."
    }
    ```
    
    **Ejemplo de respuesta**:

    ```json
    {
        "status": true,
        "message": "PDF de opinión de cumplimiento generado",
        "pdf": "data:application/pdf;base64,JVBERi0xLj..."
    }
    ```
    <br/>

- `POST` /opinion-cumplimiento
 
    **Obten la opinión de cumplimiento y la información contenida**

    <br/>

    Request Body: `application/json`

    `curl -X POST http://localhost:8004/opinion-cumplimiento \
    -H "Content-Type: application/json" -d {...body}`

    <br/>
    
    **Ejemplo de payload**:

    - Mediante contraseña:
    
      ```json
      {
        "rfc": "XAXX010101000",
        "password": "yafacture",
      }
      ```
    
    - Mediante e.firma (FIEL):
    
      ```json
      {
        "password": "yafacture",
        "base64Cer": "data:application/x-x509-ca-cert;base64,MIIGRjCCB...",
        "base64Key": "data:application/x-iwork-keynote-sffkey;base64,MIIGRjCCB..."
      }
      ```
    
    **Ejemplo de respuesta**:

    ```json
    {
        "status": true,
        "message": "PDF de opinión de cumplimiento generado",
        "info": {
            "rfc": "XAXX010101000",
            "nombreFiscal": "PUBLICO EN GENERAL",
            "estado": "NEGATIVO",
            "pendientes": [
                {
                    "obligacion": "Declaración anual de ISR. Personas Físicas.",
                    "periodos": [
                        {
                            "mes": "anual",
                            "anio": "2021"
                        }
                    ]
                },
                {
                    "obligacion": "Pago provisional mensual de ISR por servicios profesionales. Régimen de Actividades Empresariales y Profesionales",
                    "periodos": [
                        {
                            "mes": "enero",
                            "anio": "2020"
                        },
                        {
                            "mes": "febrero",
                            "anio": "2020"
                        }
                    ]
                }
            ],
            "totalPendientes": 1
        },
        "pdf": "data:application/pdf;base64,JVBERi0xLj..."
    }
    ```
<br/>

## 🤝 Contribuciones

¡Siéntete libre de contribuir creando problemas o enviando solicitudes de extracción! ¡Todas las contribuciones son bienvenidas!

## 🤝 Descargo de responsabilidad

Nunca guardamos información sensible en el proyecto y no está afiliado, asociado, autorizado, respaldado ni de ninguna manera conectado oficialmente con el SAT o cualquiera de sus subsidiarias o afiliados. El sitio web oficial del SAT se puede encontrar en sat.gob.mx. "SAT", así como los nombres, marcas, emblemas e imágenes relacionados, son marcas registradas de sus respectivos propietarios. Además, no se garantiza que no seas bloqueado al utilizar este método. SAT no permite bots ni clientes no oficiales en su plataforma, por lo que esto no debe considerarse totalmente seguro.


## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 🧑🏻‍🤝‍🧑🏻 Créditos

- **[Rafael Soto](https://github.com/BoxFactura/sat-captcha-ai-model)** • Por la creación de un modelo de reconocimiento de captcha
- **[@eclipxe13](https://github.com/eclipxe13/)** • Por inspirar a compartir y su gran proyecto phpcfdi.

## 👨🏻‍💻 Autor

[Cristian Yosafat Hernández Ruiz - Yafacture](https://github.com/blakepro)