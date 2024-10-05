<p align="center">
  <img width="230" src="https://cdn.yafacture.com/media/yafacture.png?1" alt="YaFacture" />
</p>

# [Yafacture - RPA](https://rpa.yafacture.com)

Esté proyecto sirve hacer RPA de para distintos sitios

## ⭐ Inicio rápido

[Descarga e instala](https://docker.com) **Docker**

👉🏻 Iniciar en modo **desarrollador**:

```bash
pnpm dev
```

## ⚡ Puerto

`8004`

Para iniciar la aplicación ve a
[http://localhost:8004](http://localhost:8004)

## ⚡ Endpoints

Opinión de cumplimiento
> Payload
```json
{
  "base64Cer": "",
  "base64Key": "",
  "password": ""
}
```
> Respuesta
 ```json
{
  "pdf": "",
  "status": false,
  "message": ""
}
```