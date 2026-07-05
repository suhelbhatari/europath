#!/usr/bin/env python3
"""
gen_kotlin_data.py
Regenerates CountryData.kt for the Android app from excel/countries.json.
Run: python3 scripts/gen_kotlin_data.py
"""
import json, os, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src  = os.path.join(root, "excel", "countries.json")
dst  = os.path.join(root, "android", "app", "src", "main",
                    "java", "com", "europath", "app", "data", "CountryData.kt")

if not os.path.exists(src):
    sys.exit(f"Missing {src}\nRun: node scripts/export-countries.js")

with open(src) as f:
    countries = json.load(f)

def ks(s):
    if s is None: return '""'
    return '"' + s.replace("\\","\\\\").replace('"','\\"').replace("\n","\\n").replace("$","\\$") + '"'

def kb(b): return "true" if b else "false"

def kd(n):
    f = float(n)
    return f"{int(f)}.0" if f == int(f) else str(f)

def kl(lst): return "listOf(" + ", ".join(ks(x) for x in lst) + ")"

def pw(p):
    return (f'Pathway(name={ks(p["name"])}, years={kd(p["years"])}, '
            f'type={ks(p["type"])}, requirements={ks(p["requirements"])}, '
            f'notes={ks(p.get("notes",""))})')

def pwlist(lst, ind="        "):
    if not lst: return "emptyList()"
    sep = ",\n" + ind + "    "
    return f"listOf(\n{ind}    {sep.join(pw(p) for p in lst)}\n{ind})"

blocks = []
for c in countries:
    blocks.append("""        Country(
            id = {id},
            name = {name},
            flag = {flag},
            capital = {capital},
            population = {population},
            gdp = {gdp},
            currency = {currency},
            languages = {languages},
            eu = {eu},
            schengen = {schengen},
            passportRank = {passportRank},
            avgSalary = {avgSalary},
            costOfLiving = {costOfLiving},
            climate = {climate},
            prYears = {prYears},
            citizenshipYears = {citizenshipYears},
            dualCitizenship = {dualCitizenship},
            taxRate = {taxRate},
            healthcare = {healthcare},
            safety = {safety},
            education = {education},
            digitalNomad = {digitalNomad},
            startupScore = {startupScore},
            familyFriendly = {familyFriendly},
            retirementFriendly = {retirementFriendly},
            visas = {visas},
            pros = {pros},
            cons = {cons},
            prPathways = {prPathways},
            citizenshipPathways = {citizenshipPathways}
        )""".format(
        id=ks(c["id"]), name=ks(c["name"]), flag=ks(c["flag"]),
        capital=ks(c["capital"]), population=ks(c["population"]),
        gdp=ks(c["gdp"]), currency=ks(c["currency"]),
        languages=kl(c["languages"]),
        eu=kb(c["eu"]), schengen=kb(c["schengen"]),
        passportRank=c["passportRank"], avgSalary=ks(c["avgSalary"]),
        costOfLiving=ks(c["costOfLiving"]), climate=ks(c["climate"]),
        prYears=c["prYears"], citizenshipYears=c["citizenshipYears"],
        dualCitizenship=kb(c["dualCitizenship"]), taxRate=ks(c["taxRate"]),
        healthcare=kd(c["healthcare"]), safety=kd(c["safety"]),
        education=kd(c["education"]), digitalNomad=kb(c["digitalNomad"]),
        startupScore=kd(c["startupScore"]), familyFriendly=kd(c["familyFriendly"]),
        retirementFriendly=kd(c["retirementFriendly"]),
        visas=kl(c["visas"]), pros=kl(c["pros"]), cons=kl(c["cons"]),
        prPathways=pwlist(c.get("prPathways",[])),
        citizenshipPathways=pwlist(c.get("citizenshipPathways",[]))
    ))

output = (
    "// AUTO-GENERATED - do not edit by hand.\n"
    "// Run: python3 scripts/gen_kotlin_data.py\n"
    "package com.europath.app.data\n\n"
    "object CountryRepository {\n"
    "    val countries: List<Country> = listOf(\n"
    + ",\n".join(blocks) +
    "\n    )\n}\n"
)

os.makedirs(os.path.dirname(dst), exist_ok=True)
with open(dst, "w") as f:
    f.write(output)

pr_total  = sum(len(c.get("prPathways",[])) for c in countries)
cit_total = sum(len(c.get("citizenshipPathways",[])) for c in countries)
print(f"Generated CountryData.kt")
print(f"  {len(countries)} countries, {pr_total} PR pathways, {cit_total} citizenship pathways")
print(f"  -> {dst}")
