---
title: "Qué hacer si recibís un correo sospechoso"
description: "Guía corta para reconocer un posible phishing, qué no tocar y a quién avisar. Pensada para personas y pymes."
pubDate: 2026-11-14
category: "que-hacer-si"
tags: ["phishing", "correo", "concientización"]
nivel: "basico"
publico: ["personas", "empresas", "tecnicos"]
draft: true
lang: "es"
---

## Resumen

- Un correo que te apura, te pide datos o te manda a un link inesperado puede ser phishing.
- No hagas clic ni respondas: verificá por otro canal.
- Reportalo y, si ya hiciste clic o diste datos, actuá rápido con los pasos de abajo.

## Para quién es

Para cualquier persona que use correo electrónico, y para pymes que quieran una guía simple para compartir con su equipo. Al final hay una sección opcional para quien administre el correo de una empresa.

## Contexto: qué es el phishing

El *phishing* es un engaño en el que alguien se hace pasar por una entidad de confianza (un banco, un proveedor, un compañero de trabajo) para que hagas algo que lo beneficie: entrar a una página falsa, descargar un archivo o pasar datos.

### Señales frecuentes

- **Urgencia o amenaza:** "tu cuenta se bloquea hoy", "último aviso".
- **Remitente raro:** el nombre parece correcto, pero la dirección no coincide con el dominio real.
- **Links que no van a donde dicen:** al pasar el mouse (o mantener apretado en el celular) la dirección real es otra.
- **Pedidos fuera de lo normal:** contraseñas, códigos, datos de tarjeta o transferencias.

:::important
Ningún banco ni servicio serio te va a pedir tu contraseña o un código de verificación por correo.
:::

## Qué hacer, paso a paso

1. **Frená.** No hagas clic, no descargues adjuntos y no respondas.
2. **Revisá el remitente** completo, no solo el nombre que se muestra.
3. **Verificá por otro canal:** entrá a la web oficial escribiendo la dirección vos, o llamá al número que ya conocés.
4. **Reportalo** con la opción "Denunciar phishing" de tu correo. En una empresa, avisá también a quien se ocupe de sistemas.
5. **Borralo** una vez reportado.

:::danger
No reenvíes el correo a tus contactos "para avisarles" ni uses los links o teléfonos que vienen en el mensaje para verificarlo.
:::

### Si ya hiciste clic o diste datos

1. Cambiá la contraseña de esa cuenta desde la web oficial (y de cualquier otra donde la repitas).
2. Activá la verificación en dos pasos.
3. Si diste datos bancarios, comunicate con tu banco por sus canales oficiales.
4. Guardá el correo como evidencia por si querés hacer una denuncia.

:::tip
Usar un gestor de contraseñas ayuda: no autocompleta tus datos en un sitio falso, porque la dirección no coincide con la real.
:::

### Para equipos técnicos: revisar SPF y DMARC

Los registros `SPF` y `DMARC` de un dominio indican qué servidores pueden enviar correo en su nombre y qué hacer con los mensajes que no pasan la verificación. Podés consultarlos desde PowerShell:

```powershell
# Registro SPF (TXT en la raíz del dominio)
Resolve-DnsName -Name ejemplo.com -Type TXT | Where-Object { $_.Strings -match 'v=spf1' }

# Política DMARC
Resolve-DnsName -Name _dmarc.ejemplo.com -Type TXT
```

:::warning
Que un correo pase SPF y DMARC no garantiza que sea legítimo: el atacante puede usar un dominio propio parecido al real.
:::

:::important[Artículo de ejemplo]
Este artículo sirve para probar el diseño del sitio. TODO: revisar el contenido y las fuentes antes de publicarlo.
:::

## Checklist final

- [ ] No hice clic ni descargué nada.
- [ ] Verifiqué el remitente y la dirección real de los links.
- [ ] Confirmé por otro canal.
- [ ] Reporté el correo.
- [ ] Si di datos: cambié contraseñas, activé la verificación en dos pasos y avisé al banco.

## Fuentes

- CISA (Agencia de Ciberseguridad de EE. UU.): [Recognize and Report Phishing](https://www.cisa.gov/secure-our-world/recognize-and-report-phishing).
- Ministerio Público Fiscal de la Nación (Argentina) — Unidad Fiscal Especializada en Ciberdelincuencia (UFECI): [mpf.gob.ar/ufeci](https://www.mpf.gob.ar/ufeci/).
- Microsoft Learn: [Resolve-DnsName](https://learn.microsoft.com/powershell/module/dnsclient/resolve-dnsname).
- TODO: verificar que los links sigan vigentes antes de publicar.
