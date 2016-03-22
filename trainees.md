---
layout: page
title: For Trainees
permalink: /trainees/
highlight: true
tags:
- trainee
- instructions
---

{% for post in site.tags['trainee'] %}
  * {{ post.date | date_to_string }} &raquo; [ {{ post.title }} ]({{ post.url }})
{% endfor %}