---
title: "What to do if you get a suspicious email"
description: "A short guide to spotting possible phishing, what not to touch and who to tell. Written for individuals and small businesses."
pubDate: 2026-11-14
category: "que-hacer-si"
tags: ["phishing", "email", "awareness"]
nivel: "basico"
publico: ["personas", "empresas", "tecnicos"]
draft: true
lang: "en"
translationOf: "correo-sospechoso"
---

## Summary

- An email that rushes you, asks for data or sends you to an unexpected link may be phishing.
- Don't click or reply: verify through another channel.
- Report it and, if you already clicked or shared data, act fast with the steps below.

## Who this is for

For anyone who uses email, and for small businesses that want a simple guide to share with their team. At the end there's an optional section for whoever manages a company's email.

## Context: what phishing is

*Phishing* is a scam in which someone impersonates a trusted party (a bank, a supplier, a coworker) to get you to do something that benefits them: visit a fake page, download a file or hand over data.

### Common signs

- **Urgency or threats:** "your account will be locked today", "final notice".
- **Odd sender:** the display name looks right, but the address doesn't match the real domain.
- **Links that don't go where they say:** hover with the mouse (or long-press on your phone) and the real address is different.
- **Unusual requests:** passwords, codes, card details or transfers.

:::important
No legitimate bank or service will ask for your password or a verification code by email.
:::

## What to do, step by step

1. **Stop.** Don't click, don't download attachments and don't reply.
2. **Check the full sender address**, not just the display name.
3. **Verify through another channel:** go to the official website by typing the address yourself, or call the number you already know.
4. **Report it** using your email's "Report phishing" option. At a company, also tell whoever handles IT.
5. **Delete it** once reported.

:::danger
Don't forward the email to your contacts "to warn them", and don't use the links or phone numbers in the message to verify it.
:::

### If you already clicked or shared data

1. Change that account's password from the official website (and on any other site where you reuse it).
2. Turn on two-step verification.
3. If you shared bank details, contact your bank through its official channels.
4. Keep the email as evidence in case you want to file a report.

:::tip
A password manager helps: it won't autofill your credentials on a fake site, because the address doesn't match the real one.
:::

### For technical teams: checking SPF and DMARC

A domain's `SPF` and `DMARC` records state which servers may send email on its behalf and what to do with messages that fail verification. You can look them up from PowerShell:

```powershell
# SPF record (TXT at the domain root)
Resolve-DnsName -Name example.com -Type TXT | Where-Object { $_.Strings -match 'v=spf1' }

# DMARC policy
Resolve-DnsName -Name _dmarc.example.com -Type TXT
```

:::warning
An email passing SPF and DMARC doesn't guarantee it's legitimate: the attacker may use their own look-alike domain.
:::

:::important[Sample article]
This article is a sample to test the site design. TODO: review the content and sources before publishing.
:::

## Final checklist

- [ ] I didn't click or download anything.
- [ ] I checked the sender and the real link addresses.
- [ ] I confirmed through another channel.
- [ ] I reported the email.
- [ ] If I shared data: I changed passwords, turned on two-step verification and told my bank.

## Sources

- CISA (U.S. Cybersecurity and Infrastructure Security Agency): [Recognize and Report Phishing](https://www.cisa.gov/secure-our-world/recognize-and-report-phishing).
- Ministerio Público Fiscal de la Nación (Argentina) — Unidad Fiscal Especializada en Ciberdelincuencia (UFECI): [mpf.gob.ar/ufeci](https://www.mpf.gob.ar/ufeci/) *(applies to Argentina)*.
- Microsoft Learn: [Resolve-DnsName](https://learn.microsoft.com/powershell/module/dnsclient/resolve-dnsname).
- TODO: verify the links are still valid before publishing.
