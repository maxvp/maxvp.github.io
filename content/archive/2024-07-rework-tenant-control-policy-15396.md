---
title: "Rework tenant control policy"
date: 2024-07
client: "Cloudflare"
clientUrl: "https://cloudflare.com"
clientClass: ""
url: ""
image: ""
imageAlt: ""
---

Customer reported that the example in the public docs was not working:

https://developers.cloudflare.com/cloudflare-one/policies/gateway/http-policies/tenant-control/#add-custom-headers-for-a-saas-application

We found an internal document that explained how this should work, and the customer confirmed it worked after implementing it:

https://wiki.cfdata.org/pages/viewpage.action?pageId=730367397

Updated the public documentation to show the additional rule needed to make this work.
