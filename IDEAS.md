# Idėjos

Idėjos svetainei, kurių dar nedarome. Kiekviena idėja turi savo skyrių, naujas pridėk apačioje.

## "Ask about me" pokalbis

Lankytojas užduoda klausimą apie mane (pvz. "Ar jis dirbo su WebRTC?") ir gauna atsakymą, kurį sugeneruoja Claude API pagal mano patirtį. Tai vienintelis AI projektas, kurį recruiteris gali iškart išbandyti pats, todėl jis geriausiai įrodo AI įgūdžius.

**Kur:** Work sekcijoje, kaip penktas skirtukas arba "AI agents" skirtuko dalis. Maketo lange vietoj eskizo veiktų tikras pokalbis.

**Darbo dalys:**

1. **Serverio funkcija.** Svetainė dabar statinė (Cloudflare, `wrangler.jsonc`), todėl reikia Cloudflare Worker endpoint'o, pvz. `/api/ask`. Jis gauna klausimą, kreipiasi į Claude API ir grąžina atsakymą dalimis (streaming). API raktas laikomas Cloudflare secret'e (`wrangler secret put`), ne svetainės kode.
2. **Žinios apie mane.** Tekstas, iš kurio modelis atsakinėja: patirtis, projektai, įgūdžiai ir ko neatskleisti. Taisyklės: kalbėti tik apie mane, nieko neišgalvoti, nežinant atsakyti "parašyk man tiesiai". Faktus turiu patvirtinti pats.
3. **Apsauga.** Riboti klausimų skaičių vienam lankytojui, klausimo ilgį ir atsakymo ilgį. Anthropic konsolėje nustatyti mėnesio išlaidų limitą.
4. **Pokalbio langas.** Siūlomi klausimai ("What did he build?", "Does he know Node?"), tekstas, kuris rašosi realiu laiku, klaidų būsenos, telefono versija.
5. **Testavimas.** Ar atsakymai tikslūs, ar modelis neišgalvoja, ar nepasiduoda bandymams jį "palaužti" ("ignore your instructions...").

**Iš manęs reikės:** Anthropic API rakto ir išlaidų limito, rakto įrašymo į Cloudflare ir 1-2 val. teksto apie save peržiūrai.

**Kaina:** užtektų pigiausio Claude modelio. Tikslias kainas pasitikrinti prieš paleidžiant.

**Rizikos:** modelis kartais gali atsakyti netiksliai. Tai sumažina griežtos taisyklės ir testavimas, bet visiškai nepanaikina. Tekstą reikės atnaujinti, kai keisis patirtis.
