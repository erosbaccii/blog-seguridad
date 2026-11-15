---
title: How to spot a phishing email
description: The signs that give away a fake message, how to check a link without opening it, and what to do if you already clicked.
order: 1
minutes: 12
pubDate: 2026-11-14
lang: en
translationOf: "reconocer-phishing"
quiz:
  - question: You get an email from "your bank" saying your account will be locked in 24 hours unless you confirm your details. What do you do?
    options:
      - Click the link in the email and confirm my details quickly, just in case.
      - Reply to the email asking whether it is real.
      - Skip the link; open the bank's app or type its website address myself, or call the number on my card.
      - Forward it to my contacts to warn them.
    answer: 2
    explanation: Urgency is the classic sign. Always verify through a channel you choose (the app, the address typed by hand or the official phone number), never the one the message gives you. Replying to the email puts you in touch with whoever sent it.
  - question: What is the real domain of this link? https://bank.example.secure-access.test/login
    options:
      - bank.example
      - secure-access.test
      - login
      - It belongs to the bank, because its name appears first.
    answer: 1
    explanation: Read the domain from right to left, starting at the first slash "/". What counts is the part right before the end (secure-access.test). Everything to the left is chosen by whoever registered that domain, and they can put any brand name there.
  - question: An email has no spelling mistakes, uses the right logo and greets you by name. Is that enough to trust it?
    options:
      - Yes, fake emails always have mistakes.
      - No. Logos are easy to copy, your name may be in a data breach, and automated tools now write texts without errors.
      - Yes, if it has my name they must know me.
    answer: 1
    explanation: A polished design proves nothing. Look at what they ask for (details, payments, hurrying up) and at the real domain of the sender and the links.
  - question: Which of these requests is a strong warning sign in any message?
    options:
      - A reminder about a meeting you already had scheduled.
      - A request for your password, a code you received by text message, or your full card details.
      - The monthly statement you asked for.
    answer: 1
    explanation: No bank or legitimate service asks for your password or verification codes. Those codes are exactly the key to get into your account.
  - question: You clicked a link and typed your email password into a fake page. What should you do first?
    options:
      - Nothing, as long as nothing strange has happened yet.
      - Delete the email so there is no trace.
      - Change that password on the official website (and on any other site where you use it), turn on two-step verification and tell support or the security team.
    answer: 2
    explanation: The sooner you change the password, the less time the attacker has. Reporting it lets someone check for logins and protect other people who got the same message.
  - question: You get a text message from a "delivery company" with a link to pay a pending fee for your package. What is it?
    options:
      - Probably smishing, phishing by text message. I check the delivery status on the official website, typing the address myself.
      - It must be real, because text messages cannot be faked.
      - It is real if the amount is small.
    answer: 0
    explanation: Phishing is not only email. Text messages, WhatsApp, phone calls and QR codes use the same tricks. A small amount is exactly what keeps you from thinking twice.
---

**Phishing** is a trick to get you to do something that benefits the attacker: open a link, type your password, download a file or make a payment. It almost always pretends to come from someone you already trust, such as your bank, an online store, a government agency, a delivery company or your own workplace.

In this module you will learn to stop in time: which signs to look for, how to check a link without opening it, and what to do if you already fell for it.

:::tip[The golden rule]
If a message asks you to **hurry** and **do something** (pay, log in, confirm details), stop. Verify through a channel you choose: the official app, the address typed by hand or the phone number on your card.
:::

## Warning signs

No single sign is proof, but the more of them show up together, the more likely it is a scam.

### Urgency, fear or a prize

"Your account will be locked today", "final notice", "you won a prize", "your package will be returned unless you pay". The goal is to make you act before you think. Real companies almost never give you a deadline of hours by email.

### The sender does not add up

Anyone can set the **name** you see ("Example Bank"). What matters is the full **address**, especially what comes after the @. Be wary of domains with swapped letters, extra words ("-security", "-support") or free email accounts claiming to be a company.

### They ask for details, codes or a payment

Passwords, verification codes you receive by text message, full card details, photos of your ID. A legitimate service **does not ask for your password or codes**: those codes are the key to your account.

### Links and attachments you did not expect

An "invoice" you never asked for, a compressed file, a document asking you to "enable content" or "enable macros". If you were not expecting it, confirm with the supposed sender through another channel.

### Generic greeting or something that does not fit

"Dear customer", a company you have no account with, an odd request from your boss outside working hours. Careful: **the lack of mistakes proves nothing**. A fake message today can be perfectly written and carry the right logo.

:::warning
A message that includes your name, your ID number or the last digits of your card is not necessarily real. That data may come from earlier breaches.
:::

## How to check a link without opening it

On a computer, hover your mouse over the link (without clicking) and look at the address shown at the bottom. On a phone, press and hold the link to see the address without opening it.

Then read the **domain**: the part between `https://` and the first slash `/`. Read it **from right to left**; what counts is what comes at the end.

| Address | Real domain | Is it the bank? |
| --- | --- | --- |
| `https://bank.example/login` | `bank.example` | Yes |
| `https://www.bank.example/help` | `bank.example` | Yes |
| `https://bank.example.secure-access.test/login` | `secure-access.test` | No |
| `https://bank-example-security.test` | `bank-example-security.test` | No |
| `https://access.test/bank.example` | `access.test` | No |

:::important
The padlock and `https://` only mean the connection is encrypted, **not that the site belongs to who it claims to be**. A fake page can have a padlock too.
:::

If the link text says one thing and the real address says another, that is already a reason not to open it.

## It is not only email

The same tricks arrive through other channels:

- **Text messages** (smishing): "Your package is on hold, pay the shipping fee here".
- **WhatsApp and social media**: a contact "with a new number" asking for money, or fake technical support.
- **Phone calls** (vishing): someone claiming to be from the bank asking for the code "you just received".
- **QR codes** (quishing): a QR code stuck on the street or sent by email that leads to a fake page.

In every case the defense is the same: do not use the contact details they give you; look up the official channel yourself.

## What to do if you get one

1. **Do not click or reply.** Do not download attachments either.
2. **Verify through another channel** if in doubt: the official app, the address typed by hand or the official phone number.
3. **Report it.** At work, tell the IT or security team, using the report button if there is one. In your personal email, mark it as phishing or spam.
4. **Delete it** once you have reported it.

## What to do if you already clicked

It happens to anyone. What matters is acting fast:

1. **If you typed a password**, change it right away on the official website or app, and on any other site where you use the same one.
2. **Turn on two-step verification** for that account if you did not have it yet.
3. **If you gave card or bank details**, call your bank at its official number to block the card and check your transactions.
4. **If you downloaded or opened a file**, disconnect the device from the network and tell the IT team (at work) or run an up-to-date antivirus scan (at home).
5. **Speak up.** At work, reporting quickly helps protect everyone else: the same message probably reached other people.

:::danger
Never give anyone a verification code you received by text message, email or app, even if they say they are from the bank or support. With that code they can get into your account.
:::

## Summary

- Urgency + a request for details or payments = stop and verify.
- Check the **real domain** of the sender and the links, reading it from right to left.
- A padlock does not guarantee the site is legitimate.
- Always verify through a channel you choose.
- If you fell for it: change the password, turn on two-step verification and speak up.
