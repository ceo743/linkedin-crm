"""Aggiorna jarvis/adv-campagne.json con la spesa Meta letta dall'attività mattutina (Claude, connettore Meta Ads).

Uso: python3 jarvis/aggiorna_adv.py letture.json
letture.json = {"oggi": "AAAA-MM-GG",
                "campagne": [{"id", "nome", "stato", "max_spesa", "max_risultati" (o null)}],
                "giorni": [{"id", "data": "AAAA-MM-GG", "spesa": numero, "risultati": numero o null}]}
"campagne" = campagne di Commercialista AI, Soldea e Antiriciclaggio, con la spesa «maximum»;
"giorni" = righe giornaliere degli ultimi 14 giorni (time_increment 1) di quelle campagne.
I giorni più vecchi restano quelli già nel file. Se per una campagna la somma dei giorni non torna con la spesa
«maximum» (oltre 5 centesimi) il file NON si scrive e lo script esce con errore.
"""
import json
import sys
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

FILE = "jarvis/adv-campagne.json"


def main(percorso):
    letture = json.load(open(percorso))
    oggi = date.fromisoformat(letture["oggi"])
    dal = min((r["data"] for r in letture["giorni"]), default=oggi.isoformat())
    attuale = json.load(open(FILE))
    vecchie = {c["id"]: c for c in attuale.get("campagne", [])}
    nuovi = {}
    for r in letture["giorni"]:
        if float(r["spesa"] or 0) > 0:
            g = {"spesa": round(float(r["spesa"]), 2)}
            if r.get("risultati") not in (None, "", 0):
                g["risultati"] = int(float(r["risultati"]))
            nuovi.setdefault(str(r["id"]), {})[r["data"]] = g
    uscita, errori = [], []
    sette = {(oggi - timedelta(days=i)).isoformat() for i in range(1, 8)}
    for c in letture["campagne"]:
        cid = str(c["id"])
        giorni = {k: v for k, v in (vecchie.get(cid, {}).get("giorni") or {}).items() if k < dal}
        giorni.update(nuovi.get(cid, {}))
        giorni = dict(sorted(giorni.items()))
        mx = round(float(c["max_spesa"] or 0), 2)
        somma = round(sum(v["spesa"] for v in giorni.values()), 2)
        if abs(somma - mx) > 0.05:
            errori.append(f"{c['nome']}: somma giorni {somma} diversa da Meta {mx}")
        s7 = round(sum(v["spesa"] for k, v in giorni.items() if k in sette), 2)
        r7 = sum(v.get("risultati", 0) for k, v in giorni.items() if k in sette)
        periodi = {}
        if mx:
            periodi = {"7g": {"spesa": s7, **({"risultati": r7} if r7 else {})},
                       "max": {"spesa": mx, **({"risultati": int(float(c["max_risultati"]))}
                                              if c.get("max_risultati") not in (None, "") else {})}}
        uscita.append({"id": cid, "nome": c["nome"], "stato": c["stato"], "periodi": periodi, "giorni": giorni})
    if errori:
        sys.exit("NON SCRITTO: " + "; ".join(errori))
    attuale["aggiornato"] = datetime.now(ZoneInfo("Europe/Rome")).isoformat(timespec="seconds")
    attuale["fino_al"] = oggi.isoformat()
    attuale["campagne"] = uscita
    with open(FILE, "w") as f:
        json.dump(attuale, f, ensure_ascii=False, indent=1)
    print(f"Scritto: {len(uscita)} campagne fino al {oggi}; " + ", ".join(
        f"{c['nome']} {c['periodi'].get('max', {}).get('spesa', 0)}" for c in uscita))


if __name__ == "__main__":
    main(sys.argv[1])
