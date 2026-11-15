---
title: Cómo reconocer un correo de phishing
description: Las señales que delatan un mensaje falso, cómo revisar un enlace sin abrirlo y qué hacer si ya hiciste clic.
order: 1
minutes: 12
pubDate: 2026-11-14
lang: es
quiz:
  - question: Te llega un correo de "tu banco" que dice que tu cuenta se bloquea en 24 horas si no confirmás tus datos. ¿Qué hacés?
    options:
      - Hago clic en el enlace del correo y confirmo los datos rápido, por las dudas.
      - Respondo el correo preguntando si es real.
      - No uso el enlace; entro a la app o a la web del banco escribiendo la dirección yo, o llamo al número de la tarjeta.
      - Lo reenvío a mis contactos para avisarles.
    answer: 2
    explanation: La urgencia es la señal clásica. Verificá siempre por un canal que elegís vos (la app, la web escrita a mano o el teléfono oficial), nunca por el que te da el mensaje. Responder el correo te comunica con quien lo mandó.
  - question: ¿Cuál es el dominio real de este enlace? https://banco.example.acceso-seguro.test/login
    options:
      - banco.example
      - acceso-seguro.test
      - login
      - Es del banco, porque aparece su nombre al principio.
    answer: 1
    explanation: El dominio se lee de derecha a izquierda desde la primera barra "/". Lo que manda es lo que está justo antes del final (acceso-seguro.test). Todo lo de la izquierda lo elige quien registró ese dominio, y puede poner el nombre de cualquier marca.
  - question: Un correo no tiene ninguna falta de ortografía, usa el logo correcto y te saluda por tu nombre. ¿Eso alcanza para confiar?
    options:
      - Sí, los correos falsos siempre tienen errores.
      - No. Los logos se copian, tu nombre puede estar en una filtración y hoy los textos se escriben sin errores con herramientas automáticas.
      - Sí, si tiene mi nombre es porque me conocen.
    answer: 1
    explanation: Un buen diseño no prueba nada. Fijate en lo que te piden (datos, pagos, apurarte) y en el dominio real del remitente y de los enlaces.
  - question: ¿Cuál de estos pedidos es una señal de alerta fuerte en cualquier mensaje?
    options:
      - Que te recuerden una reunión que ya tenías agendada.
      - Que te pidan tu contraseña, un código que te llegó por SMS o los datos completos de la tarjeta.
      - Que te manden el resumen mensual que pediste.
    answer: 1
    explanation: Ningún banco ni servicio serio te pide la contraseña ni los códigos de verificación. Esos códigos son justamente la llave para entrar a tu cuenta.
  - question: Hiciste clic en un enlace y pusiste tu contraseña del correo en una página falsa. ¿Qué es lo primero que conviene hacer?
    options:
      - Nada, si no pasó nada raro todavía.
      - Borrar el correo para que no quede rastro.
      - Cambiar esa contraseña desde la web oficial (y en cualquier otro sitio donde la uses), activar la verificación en dos pasos y avisar a soporte o al área de seguridad.
    answer: 2
    explanation: Cuanto antes cambies la contraseña, menos tiempo tiene quien la robó. Avisar permite revisar si hubo accesos y proteger a otras personas que recibieron lo mismo.
  - question: Te llega un SMS de una "empresa de envíos" con un enlace para pagar un costo pendiente de tu paquete. ¿Qué es?
    options:
      - Probablemente smishing, phishing por SMS. Reviso el estado del envío desde la web oficial que escribo yo.
      - Seguro es real, porque los SMS no se pueden falsificar.
      - Es real si el monto es chico.
    answer: 0
    explanation: El phishing no es solo por correo. Por SMS, WhatsApp, llamadas o códigos QR se usan los mismos trucos. Un monto chico es justamente lo que hace que no lo pienses dos veces.
---

El **phishing** es un engaño para que hagas algo que beneficia a quien ataca: entrar a un enlace, escribir tu contraseña, descargar un archivo o hacer un pago. Casi siempre se hace pasar por alguien en quien ya confiás, como tu banco, una tienda online, un organismo público, una empresa de envíos o tu propio trabajo.

En este módulo vas a aprender a frenar a tiempo: qué señales mirar, cómo revisar un enlace sin abrirlo y qué hacer si ya caíste.

:::tip[La regla de oro]
Si un mensaje te pide **apurarte** y **hacer algo** (pagar, entrar, confirmar datos), pará. Verificá por un canal que elijas vos: la app oficial, la dirección escrita a mano o el teléfono que figura en tu tarjeta.
:::

## Las señales de alerta

Ninguna señal sola es una prueba, pero cuantas más aparezcan juntas, más probable es que sea un engaño.

### Urgencia, miedo o premio

"Tu cuenta se bloquea hoy", "último aviso", "ganaste un premio", "tu paquete se devuelve si no pagás". La idea es que actúes antes de pensar. Las empresas reales casi nunca te dan plazos de horas por correo.

### El remitente no cierra

El **nombre** que ves ("Banco Ejemplo") lo puede poner cualquiera. Lo que importa es la **dirección** completa, y sobre todo lo que viene después de la arroba. Desconfiá de dominios con letras cambiadas, palabras agregadas ("-seguridad", "-soporte") o de cuentas gratuitas que dicen ser de una empresa.

### Te piden datos, códigos o un pago

Contraseñas, códigos de verificación que te llegan por SMS, datos completos de la tarjeta, fotos de tu documento. Un servicio legítimo **no te pide la contraseña ni los códigos**: esos códigos son la llave de tu cuenta.

### Enlaces y adjuntos que no esperabas

Una "factura" que no pediste, un archivo comprimido, un documento que te pide "habilitar contenido" o "habilitar macros". Si no lo esperabas, confirmalo con quien supuestamente lo mandó por otro medio.

### Saludo genérico o algo que no encaja

"Estimado cliente", una empresa con la que no tenés cuenta, un pedido raro de tu jefe fuera de horario. Ojo: **la falta de errores no prueba nada**. Hoy un mensaje falso puede estar perfectamente escrito y tener el logo correcto.

:::warning
Que un mensaje tenga tu nombre, tu DNI o los últimos números de tu tarjeta no significa que sea real. Esos datos pueden venir de filtraciones anteriores.
:::

## Cómo revisar un enlace sin abrirlo

En la computadora, pasá el mouse por encima del enlace (sin hacer clic) y mirá la dirección que aparece abajo. En el celular, mantené apretado el enlace para ver la dirección sin abrirla.

Después, leé el **dominio**: la parte entre `https://` y la primera barra `/`. Se lee **de derecha a izquierda**, y lo que manda es lo que está al final.

| Dirección | Dominio real | ¿Es del banco? |
| --- | --- | --- |
| `https://banco.example/ingresar` | `banco.example` | Sí |
| `https://www.banco.example/ayuda` | `banco.example` | Sí |
| `https://banco.example.acceso-seguro.test/login` | `acceso-seguro.test` | No |
| `https://banco-example-seguridad.test` | `banco-example-seguridad.test` | No |
| `https://acceso.test/banco.example` | `acceso.test` | No |

:::important
El candado y el `https://` solo dicen que la conexión está cifrada, **no que el sitio sea de quien dice ser**. Una página falsa también puede tener candado.
:::

Si el texto del enlace dice una cosa y la dirección real otra, ya es motivo para no entrar.

## No es solo el correo

Los mismos trucos llegan por otros caminos:

- **SMS** (smishing): "Tu paquete está retenido, pagá el envío acá".
- **WhatsApp y redes**: un contacto "con número nuevo" que te pide plata, o un supuesto soporte técnico.
- **Llamadas** (vishing): alguien que dice ser del banco y te pide el código que "te acaba de llegar".
- **Códigos QR** (quishing): un QR pegado en la calle o mandado por correo que lleva a una página falsa.

En todos los casos la defensa es la misma: no uses el contacto que te dan; buscá vos el canal oficial.

## Qué hacer si te llega uno

1. **No hagas clic ni respondas.** Tampoco descargues los adjuntos.
2. **Verificá por otro canal** si tenés dudas: la app oficial, la web escrita a mano o el teléfono oficial.
3. **Reportalo.** En el trabajo, avisá al área de sistemas o seguridad con el botón de reporte si lo tienen. En tu correo personal, marcalo como phishing o spam.
4. **Borralo** una vez que lo reportaste.

## Qué hacer si ya hiciste clic

Le pasa a cualquiera. Lo importante es actuar rápido:

1. **Si escribiste una contraseña**, cambiala ya desde la web o la app oficial, y también en cualquier otro sitio donde uses la misma.
2. **Activá la verificación en dos pasos** en esa cuenta si todavía no la tenías.
3. **Si diste datos de la tarjeta o de tu banco**, llamá al banco al número oficial para bloquearla y revisar movimientos.
4. **Si descargaste o abriste un archivo**, desconectá el equipo de la red y avisá al área de sistemas (en el trabajo) o pasá un antivirus actualizado (en tu casa).
5. **Avisá.** En el trabajo, contarlo rápido ayuda a proteger al resto: seguramente el mismo mensaje les llegó a otras personas.

:::danger
Nunca le pases a nadie un código de verificación que te llegó por SMS, correo o la app, aunque diga ser del banco o de soporte. Con ese código pueden entrar a tu cuenta.
:::

## Resumen

- Urgencia + pedido de datos o pagos = frená y verificá.
- Mirá el **dominio real** del remitente y de los enlaces, leyéndolo de derecha a izquierda.
- El candado no garantiza que el sitio sea legítimo.
- Verificá siempre por un canal que elijas vos.
- Si caíste: cambiá la contraseña, activá la verificación en dos pasos y avisá.
