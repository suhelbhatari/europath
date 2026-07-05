import { useState, useMemo, useEffect, useCallback } from "react";
import * as d3 from "d3";

/* ============================================================
   EUROPATH v2 — Multi-page Europe PR & Citizenship Explorer
   Hash routing: #/ | #/country/DE | #/compare | #/pathways/DE
   ============================================================ */

const T = {
  bg: "#080e1a", surface: "#0f1a2e", card: "#131f35",
  border: "#1e3050", borderHover: "#6366f1",
  text: "#e2e8f0", muted: "#64748b", subtle: "#94a3b8",
  primary: "#6366f1", primaryGlow: "#6366f130",
  green: "#22c55e", greenGlow: "#22c55e20",
  blue: "#0ea5e9", blueGlow: "#0ea5e920",
  amber: "#f59e0b", amberGlow: "#f59e0b20",
  red: "#ef4444", redGlow: "#ef444420",
  purple: "#a855f7", purpleGlow: "#a855f720",
  cyan: "#06b6d4",
};

const PATHWAY_TYPE_META = {
  residence:{label:"Residence",icon:"🏠",color:"#6366f1"},
  skilled:{label:"Skilled Worker",icon:"💼",color:"#0ea5e9"},
  business:{label:"Business/Entrepreneur",icon:"🏢",color:"#f59e0b"},
  investment:{label:"Investment",icon:"💰",color:"#22c55e"},
  family:{label:"Family",icon:"👨‍👩‍👧",color:"#a855f7"},
  heritage:{label:"Descent/Heritage",icon:"🌳",color:"#ef4444"},
  eu:{label:"EU/EEA Rights",icon:"🇪🇺",color:"#0ea5e9"},
  humanitarian:{label:"Humanitarian",icon:"🕊️",color:"#06b6d4"},
  birthright:{label:"Birthright",icon:"👶",color:"#22c55e"},
  special:{label:"Special/Discretionary",icon:"⭐",color:"#f59e0b"},
  adoption:{label:"Adoption",icon:"❤️",color:"#a855f7"},
  treaty:{label:"Treaty/Agreement",icon:"🤝",color:"#06b6d4"},
  integration:{label:"Exceptional Integration",icon:"🏆",color:"#f59e0b"},
  passive:{label:"Passive Income",icon:"💵",color:"#22c55e"},
  digital:{label:"Digital Nomad",icon:"💻",color:"#6366f1"},
  wealth:{label:"Wealth-Based",icon:"💎",color:"#f59e0b"},
  regularization:{label:"Regularization",icon:"📋",color:"#94a3b8"},
  research:{label:"Research/Academic",icon:"🔬",color:"#0ea5e9"},
};

const MAP_POS = {
  DE:[485,235],FR:[380,280],PT:[290,340],ES:[320,330],IT:[480,320],
  NL:[440,205],CH:[455,270],SE:[510,130],NO:[470,115],DK:[470,180],
  FI:[555,100],IE:[320,215],GB:[365,200],AT:[500,265],BE:[430,225],
  LU:[445,242],GR:[545,380],PL:[540,220],CZ:[510,240],MT:[490,410],
  CY:[620,400],HR:[510,305],EE:[560,165],LV:[555,185],LT:[550,200],
  SI:[500,285],SK:[530,250],HU:[535,265],RO:[575,275],BG:[575,305],
  RS:[540,295],ME:[520,320],AL:[525,345],MK:[545,330],IS:[285,70],
  LI:[460,265],MC:[420,305],AD:[355,315],SM:[490,310],VA:[480,330],
  UA:[620,240],BY:[600,205],MD:[610,270],BA:[510,310],XK:[535,320]
};

const COUNTRIES = [
  {
    id:"DE",name:"Germany",flag:"🇩🇪",capital:"Berlin",population:"84.4M",gdp:"$4.5T",
    currency:"Euro (€)",languages:["German"],eu:true,schengen:true,passportRank:3,
    avgSalary:"€45,000",costOfLiving:"High",climate:"Temperate",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"14–45%",healthcare:9.2,safety:8.8,education:9.0,
    digitalNomad:false,startupScore:8.5,familyFriendly:9.0,retirementFriendly:7.5,
    visas:["Skilled Worker","Job Seeker","EU Blue Card","Student","Family Reunification","Business","Entrepreneur","Investor","Freelance","Research","Seasonal"],
    pros:["Strong economy","Excellent healthcare","Free university education","High salaries","Strong labor protections","2024 dual citizenship reform","World-class public transport"],
    cons:["High bureaucracy","German language barrier","High cost in major cities","Complex immigration system","Cold winters in the north"],
    prPathways:[
      {name:"Standard Settlement Permit",years:5,type:"residence",requirements:"5 years legal residence, B1 German, pension contributions, adequate housing",notes:"Main route for most work visa holders"},
      {name:"EU Blue Card Fast Track",years:2.5,type:"skilled",requirements:"33 months + B1 German (or 21 months with B1 German) with pension contributions",notes:"Fastest route for highly qualified non-EU professionals"},
      {name:"Highly Skilled Specialist",years:2,type:"skilled",requirements:"Job offer matching qualifications, can qualify almost immediately in some cases",notes:"Exceptional integration cases"},
      {name:"Self-Employed / Freelancer",years:3,type:"business",requirements:"Successful business operation, pension provision proof, B1 German",notes:"Reduced from 5 to 3 years if business thrives"},
      {name:"Spouse of German Citizen",years:3,type:"family",requirements:"3 years marriage + residence in Germany, B1 German",notes:"Family reunification track"},
      {name:"Researcher / Scientist",years:5,type:"research",requirements:"Hosting agreement with recognised research institution",notes:"Time counts fully toward settlement"},
      {name:"EU Long-Term Resident",years:5,type:"eu",requirements:"5 years legal EU residence including Germany, stable income, health insurance",notes:"Portable across EU member states"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years legal residence (2024 reform from 8→5), B1 German, naturalization test, financial self-sufficiency",notes:"Major 2024 reform — dual citizenship now permitted"},
      {name:"Accelerated Integration",years:3,type:"integration",requirements:"3 years residence + C1 German + exceptional integration (volunteering, civic achievements)",notes:"Fastest standard route — reserved for outstanding integration cases"},
      {name:"Spouse of German Citizen",years:3,type:"family",requirements:"3 years marriage + residence, B1 German, integration test",notes:"Reduced residency for partners of German nationals"},
      {name:"Children Born in Germany",years:0,type:"birthright",requirements:"Born after 2000 to parents with 5+ years residence and settlement permit",notes:"Birthright citizenship — automatic at birth"},
      {name:"Nazi Persecution Descendants (Art. 116)",years:0,type:"heritage",requirements:"Proof of ancestor stripped of citizenship 1933–1945 due to persecution",notes:"Restitution — no residency, no language test, dual nationality allowed"},
      {name:"Former Citizens Reacquisition",years:0,type:"heritage",requirements:"Former Germans who lost citizenship by acquiring foreign nationality before 2000",notes:"Streamlined reacquisition process"},
      {name:"Special Public Interest",years:0,type:"special",requirements:"Exceptional contribution to Germany in science, culture, sport, economics — at government discretion",notes:"Rare discretionary route"},
    ]
  },
  {
    id:"FR",name:"France",flag:"🇫🇷",capital:"Paris",population:"68.3M",gdp:"$3.1T",
    currency:"Euro (€)",languages:["French"],eu:true,schengen:true,passportRank:5,
    avgSalary:"€40,000",costOfLiving:"High",climate:"Varied",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"11–45%",healthcare:9.5,safety:8.2,education:8.8,
    digitalNomad:false,startupScore:8.0,familyFriendly:9.2,retirementFriendly:8.5,
    visas:["Skilled Worker","Talent Passport","Student","Family Reunification","Business","Investor","Entrepreneur","Research","Seasonal","Working Holiday"],
    pros:["World-class healthcare","Rich culture & cuisine","Strong social safety net","Excellent public transport","Great quality of life","Strong worker protections"],
    cons:["High taxes","French language barrier","Strict bureaucracy","Very high cost in Paris","Complex visa and tax systems"],
    prPathways:[
      {name:"Carte de Résident (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, French B1, integration republican values contract (CIR)",notes:"Standard 10-year renewable card — the goal for most migrants"},
      {name:"Talent Passport Holders",years:4,type:"skilled",requirements:"4 years on Talent Passport with continuous professional or artistic activity",notes:"Faster route for researchers, entrepreneurs, artists, athletes"},
      {name:"Spouse of French Citizen",years:3,type:"family",requirements:"3 years of marriage and residence, French language proficiency",notes:"Reduced timeline for spouses of French nationals"},
      {name:"Parent of French Child",years:5,type:"family",requirements:"Contributing to upbringing of a French national child for 5 years",notes:"Specific family-based category"},
      {name:"Refugee Status",years:0,type:"humanitarian",requirements:"Immediate 10-year resident card upon refugee recognition by OFPRA",notes:"Humanitarian fast-track — granted immediately upon recognition"},
      {name:"EU Long-Term Resident",years:5,type:"eu",requirements:"5 years cumulative legal EU residence, can combine time across member states",notes:"Portable EU-wide status"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization (Décret)",years:5,type:"residence",requirements:"5 years habitual legal residence, French B1, civic knowledge, financial stability",notes:"Application via prefecture — most common route"},
      {name:"Exceptional Cases (Reduced to 2 yrs)",years:2,type:"integration",requirements:"2–3 years higher education in France OR exceptional services to France",notes:"University graduates and exceptional contributors"},
      {name:"Marriage to French Citizen (Déclaration)",years:4,type:"family",requirements:"4 years marriage (5 if not residing continuously in France), community of life, French language",notes:"Declaration-based — simpler than decree process"},
      {name:"Birth in France + Residence (Jus Soli)",years:0,type:"birthright",requirements:"Born in France; automatic at 18 if resident for 5 years since age 11",notes:"Double jus soli also applies if a parent was also born in France"},
      {name:"French Parent Descent (Jus Sanguinis)",years:0,type:"heritage",requirements:"At least one parent is French at birth — automatic citizenship regardless of birthplace",notes:"No residency requirement whatsoever"},
      {name:"Former Colony Historical Provisions",years:0,type:"special",requirements:"Specific provisions for individuals from former French territories under pre-independence agreements",notes:"Case-by-case — requires specialist legal advice"},
    ]
  },
  {
    id:"PT",name:"Portugal",flag:"🇵🇹",capital:"Lisbon",population:"10.3M",gdp:"$267B",
    currency:"Euro (€)",languages:["Portuguese"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€22,000",costOfLiving:"Medium",climate:"Mediterranean",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"14.5–48%",healthcare:8.2,safety:9.2,education:8.0,
    digitalNomad:true,startupScore:7.5,familyFriendly:8.8,retirementFriendly:9.5,
    visas:["D7 Passive Income","Golden Visa","Digital Nomad (D8)","Student","Family Reunification","Job Seeker","Entrepreneur","Investor","Seasonal"],
    pros:["EU's fastest standard citizenship path (5 yrs)","Excellent warm climate","NHR tax regime","Digital nomad visa","Very safe","English widely spoken","Affordable outside Lisbon"],
    cons:["Lower salaries than W Europe","Slow bureaucracy","Lisbon housing prices rising fast","A2 Portuguese required","Limited job market in English"],
    prPathways:[
      {name:"Standard Residence Route",years:5,type:"residence",requirements:"5 years legal residence on any qualifying visa (D7, D8, work permit), A2 Portuguese, clean record, accommodation proof",notes:"Most common path — any legal visa type upgrades to permanent after 5 years"},
      {name:"Golden Visa Holders",years:5,type:"investment",requirements:"5 years from Golden Visa issuance, minimal physical presence (7 days/year avg), A2 Portuguese",notes:"One of the lowest physical presence requirements in Europe"},
      {name:"D7 Passive Income Route",years:5,type:"passive",requirements:"5 years on D7 with proof of recurring passive income (pensions, rentals, dividends, remote work)",notes:"Very popular with retirees and early retirees"},
      {name:"D8 Digital Nomad Route",years:5,type:"digital",requirements:"5 years on D8 visa, proof of remote employment earning above ~4× minimum wage",notes:"Introduced 2022; increasingly popular"},
      {name:"EU Long-Term Residence",years:5,type:"eu",requirements:"5 years cumulative EU legal residence",notes:"Portable EU-wide status"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years legal residence, A2 Portuguese, no serious criminal record, community ties",notes:"Among the fastest and most accessible standard routes in the EU"},
      {name:"Sephardic Jewish Ancestry",years:0,type:"heritage",requirements:"Proof of Sephardic Jewish descent from Jews expelled from Portugal in 1497, certificate from Portuguese Jewish community",notes:"Historic restitution — rules tightened in 2022 but still operational"},
      {name:"Marriage/Partnership to Portuguese",years:3,type:"family",requirements:"3 years marriage or de facto union with Portuguese citizen, A2 Portuguese, community ties",notes:"Reduced from 5 to 3 years for partners"},
      {name:"Jus Soli (Born in Portugal)",years:0,type:"birthright",requirements:"Born in Portugal to foreign parents who have resided 1+ year at time of birth",notes:"Modified jus soli provision"},
      {name:"Portuguese Descent (Jus Sanguinis)",years:0,type:"heritage",requirements:"At least one parent or grandparent is/was a Portuguese citizen who never formally renounced citizenship",notes:"Very popular for Brazilian, Goan, Cape Verdean and wider diaspora"},
      {name:"CPLP Nationals Fast Track",years:3,type:"treaty",requirements:"3 years residence for citizens of Portuguese-speaking countries (Brazil, Angola, Mozambique, etc.)",notes:"Community of Portuguese Language Countries — reduced timeline reflecting cultural ties"},
      {name:"Stateless / Exceptional Humanitarian",years:0,type:"humanitarian",requirements:"Born in Portugal and stateless, or special humanitarian cases",notes:"Humanitarian provision"},
    ]
  },
  {
    id:"ES",name:"Spain",flag:"🇪🇸",capital:"Madrid",population:"47.4M",gdp:"$1.6T",
    currency:"Euro (€)",languages:["Spanish"],eu:true,schengen:true,passportRank:4,
    avgSalary:"€30,000",costOfLiving:"Medium",climate:"Mediterranean",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"19–47%",healthcare:9.0,safety:8.8,education:8.5,
    digitalNomad:true,startupScore:7.8,familyFriendly:9.0,retirementFriendly:9.0,
    visas:["Skilled Worker","Digital Nomad","Golden Visa","Non-Lucrative Visa","Student","Family Reunification","Entrepreneur","Investor","Research","Seasonal"],
    pros:["Warm Mediterranean climate","Rich culture","Affordable outside Madrid/Barcelona","Great food scene","Strong expat communities","Digital nomad visa 2023"],
    cons:["High unemployment","Long 10-year citizenship for most","No dual citizenship (exceptions apply)","Regional language complexity","Slow administration"],
    prPathways:[
      {name:"Larga Duración (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence, no more than 10 months total absence, clean record, stable income",notes:"Standard EU-style permanent residence permit"},
      {name:"Golden Visa Holders",years:5,type:"investment",requirements:"5 years from investment-based residency; minimal stay requirements (visit once/year)",notes:"Golden Visa for new applicants ended 2024 but existing holders continue"},
      {name:"Non-Lucrative Visa Route",years:5,type:"passive",requirements:"5 years on renewable non-lucrative visa with proof of passive income (~€28,800+/year)",notes:"Popular with retirees and income investors"},
      {name:"Digital Nomad Visa Route",years:5,type:"digital",requirements:"5 years on digital nomad visa (Startup Law 2023) with remote work proof",notes:"Min income ~€2,646/month; leads to standard PR after 5 years"},
      {name:"Arraigo Social (Social Roots)",years:3,type:"regularization",requirements:"3 years continuous presence (including irregular status), job offer or family ties, municipal social integration report",notes:"Key regularization route for long-term undocumented residents"},
      {name:"Arraigo Familiar (Family Roots)",years:2,type:"family",requirements:"Spanish-born child or parent with Spanish citizenship — 2 years minimum in some cases",notes:"Reduced timeline for those with direct family ties to Spanish nationals"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years legal continuous residence, DELE A2 Spanish exam, CCSE culture/constitution test, good civic conduct",notes:"Longest standard timeline among major EU economies"},
      {name:"Iberoamerican & Select Nations (2 yrs)",years:2,type:"treaty",requirements:"2 years legal residence for nationals of: all Ibero-American countries, Andorra, Philippines, Equatorial Guinea, Portugal, Sephardic Jews",notes:"Major reduction reflecting historical and cultural ties — covers vast Latin American population"},
      {name:"Refugees",years:5,type:"humanitarian",requirements:"5 years continuous legal residence with recognised refugee status",notes:"Reduced from standard 10 years"},
      {name:"Marriage to Spanish Citizen",years:1,type:"family",requirements:"1 year of marriage and legal residence with a Spanish national",notes:"Fastest standard route in Spain — just 1 year"},
      {name:"Born in Spain to Foreign Parents",years:1,type:"birthright",requirements:"1 year legal residence after being born in Spanish territory",notes:"Modified jus soli provision"},
      {name:"Democratic Memory Law (Grandchildren of Exiles)",years:0,type:"heritage",requirements:"Grandchildren of Spaniards who lost nationality due to exile (Civil War / Franco dictatorship). Application windows have been opened — verify current status",notes:"Periodic application windows; check current opening with Spanish consulate"},
    ]
  },
  {
    id:"IT",name:"Italy",flag:"🇮🇹",capital:"Rome",population:"59.6M",gdp:"$2.3T",
    currency:"Euro (€)",languages:["Italian"],eu:true,schengen:true,passportRank:4,
    avgSalary:"€32,000",costOfLiving:"Medium-High",climate:"Mediterranean",prYears:5,citizenshipYears:10,
    dualCitizenship:true,taxRate:"23–43%",healthcare:9.0,safety:8.5,education:8.5,
    digitalNomad:true,startupScore:7.2,familyFriendly:8.8,retirementFriendly:8.8,
    visas:["Skilled Worker","EU Blue Card","Digital Nomad","Investor","Startup","Student","Family Reunification","Self-Employment","Elective Residency","Research"],
    pros:["World-class food & culture","Jure Sanguinis ancestry route (no generational limit)","Great climate","Strong healthcare","Flat tax €100k for HNWIs","Affordable south"],
    cons:["High bureaucracy","Slow processes","Italian language barrier","North-south economic divide","Complex tax system"],
    prPathways:[
      {name:"EC Long-Term Residence (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence, sufficient income, adequate housing, Italian A2 civic integration test",notes:"Standard EU-style permanent permit"},
      {name:"Elective Residency Route",years:5,type:"passive",requirements:"5 years on elective residency visa (passive income — no work permitted), proof of €31,000+/year income",notes:"Popular with wealthy retirees and remote-income individuals"},
      {name:"Investor Visa Route",years:5,type:"investment",requirements:"5 years from investor visa; investment tiers: €250k (innovative startup), €500k (Italian company), €1M (philanthropy), €2M (government bonds)",notes:"Investment-based entry but standard 5-year timeline to PR"},
      {name:"EU Blue Card Holders",years:5,type:"skilled",requirements:"5 years on EU Blue Card with stable highly-skilled employment",notes:"Standard timeline — Blue Card eases initial entry and salary thresholds"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years legal residence, Italian B1 exam, sufficient income, no criminal record",notes:"Standard route for non-EU nationals"},
      {name:"EU Citizens Reduced",years:4,type:"residence",requirements:"4 years legal residence for citizens of other EU member states",notes:"Significant reduction for EU nationals"},
      {name:"Jure Sanguinis (Descent — No Generational Limit)",years:0,type:"heritage",requirements:"Proof of unbroken lineage to an Italian citizen who never formally renounced citizenship; paternal line pre-1948 or maternal line after 1948",notes:"One of the most generous ancestry routes globally — millions of descendants eligible, especially Argentina, Brazil, USA, Australia"},
      {name:"Marriage to Italian Citizen",years:2,type:"family",requirements:"2 years residence in Italy after marriage (1 year if couple has children), Italian B1",notes:"Reduced from standard 10 years"},
      {name:"Born in Italy (Jus Soli)",years:0,type:"birthright",requirements:"Born in Italy to foreign parents; must apply between 18th and 19th birthday if continuously resident since birth",notes:"Narrow window provision — application must be filed promptly"},
      {name:"1948 Rule — Maternal Line Court Route",years:0,type:"heritage",requirements:"Descendants through maternal line where the woman was born before 1 Jan 1948 — requires court case in Italian civil court",notes:"Judicial proceeding route — opens maternal ancestral line before 1948"},
      {name:"Refugees / Stateless",years:5,type:"humanitarian",requirements:"5 years residence with recognised refugee or stateless status",notes:"Reduced from standard 10 years"},
    ]
  },
  {
    id:"NL",name:"Netherlands",flag:"🇳🇱",capital:"Amsterdam",population:"17.7M",gdp:"$1.1T",
    currency:"Euro (€)",languages:["Dutch"],eu:true,schengen:true,passportRank:3,
    avgSalary:"€52,000",costOfLiving:"Very High",climate:"Temperate",prYears:5,citizenshipYears:5,
    dualCitizenship:false,taxRate:"36.93–49.5%",healthcare:9.3,safety:9.0,education:9.2,
    digitalNomad:false,startupScore:9.0,familyFriendly:9.2,retirementFriendly:8.2,
    visas:["Highly Skilled Migrant","EU Blue Card","Startup","Student","Family Reunification","Investor","Working Holiday","Research","Self-Employed"],
    pros:["High salaries","English widely spoken","Excellent infrastructure","30% tax ruling for expats","Progressive society","Top startup ecosystem","Cycling culture"],
    cons:["Very high cost of living","Acute housing shortage","Dutch required for citizenship","High taxes","Cold and rainy weather","Strict dual citizenship rules"],
    prPathways:[
      {name:"Standard Permanent Residence (Type I)",years:5,type:"residence",requirements:"5 years continuous legal residence, civic integration exam (inburgering passed), sufficient income above threshold",notes:"Standard route for most work-based migrants"},
      {name:"EU Long-Term Resident (Type II)",years:5,type:"eu",requirements:"5 years legal and continuous residence, integration exam, gives EU-wide mobility rights",notes:"Slightly different from Type I — gives broader EU mobility"},
      {name:"Highly Skilled Migrant (5-yr track)",years:5,type:"skilled",requirements:"5 years on Highly Skilled Migrant permit with continuous qualifying employment",notes:"Standard timeline — 30% tax ruling may apply during this period"},
      {name:"Surinamese Nationals (Historical)",years:5,type:"treaty",requirements:"Standard 5-year route with historical ease of entry — legacy provisions for Suriname-origin applicants",notes:"Colonial legacy provisions"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous legal residence, civic integration diploma, Dutch B1 language, renounce prior nationality (with exceptions)",notes:"Strict renunciation policy — Netherlands generally requires giving up other nationalities"},
      {name:"Spouse/Partner of Dutch Citizen",years:3,type:"family",requirements:"3 years of marriage/registered partnership and cohabitation with Dutch national, civic integration",notes:"Reduced timeline for partners"},
      {name:"Option Procedure (Declaration Route)",years:0,type:"birthright",requirements:"Available for: born in NL with 5-year continuous residence, former Dutch nationals, stateless persons, those who lived in NL as minor for 3+ years before age 18 and are now 18–25",notes:"Faster and cheaper administrative declaration route vs full naturalization application"},
      {name:"Children of Dutch Parent",years:0,type:"heritage",requirements:"Automatic citizenship if one parent is Dutch at time of birth — jus sanguinis",notes:"No residency requirement"},
      {name:"EU/EEA/Swiss Dual Citizenship Exception",years:5,type:"eu",requirements:"5 years residence — EU/EEA/Swiss nationals may retain original nationality (exception to renunciation rule)",notes:"One of few groups exempt from renunciation requirement"},
      {name:"Refugees (No Renunciation Required)",years:5,type:"humanitarian",requirements:"5 years residence with recognised refugee status — exempt from renunciation if home country won't allow it",notes:"Special exception category for those who cannot safely renounce"},
    ]
  },
  {
    id:"CH",name:"Switzerland",flag:"🇨🇭",capital:"Bern",population:"8.8M",gdp:"$807B",
    currency:"CHF (₣)",languages:["German","French","Italian","Romansh"],eu:false,schengen:true,
    passportRank:1,avgSalary:"CHF 90,000",costOfLiving:"Very High",climate:"Alpine",prYears:10,citizenshipYears:12,
    dualCitizenship:true,taxRate:"0–40% (cantonal)",healthcare:9.5,safety:9.8,education:9.8,
    digitalNomad:false,startupScore:9.2,familyFriendly:9.5,retirementFriendly:9.0,
    visas:["Skilled Worker","Student","Family Reunification","Investor","Research","Working Holiday (limited)"],
    pros:["World's highest salaries","Safest country per capita","Best passport globally (#1)","Top-ranked education","Stunning alpine nature","Political stability","Tax-efficient cantonal system"],
    cons:["Extremely high cost of living","Longest citizenship path in W Europe (12 yrs)","Difficult immigration for non-EU","Multiple language regions","Socially conservative in rural areas"],
    prPathways:[
      {name:"C Permit — EU/EFTA Nationals",years:5,type:"eu",requirements:"5 years continuous B Permit residence for EU/EFTA citizens",notes:"Faster route under EU/EFTA free movement — no language test for permit itself"},
      {name:"C Permit — Non-EU/EFTA Nationals",years:10,type:"residence",requirements:"10 years continuous B Permit residence, national language A2 spoken/A1 written, integration criteria",notes:"Standard route for third-country nationals — demanding but leads to best passport in world"},
      {name:"C Permit — USA/Canada (5-yr bilateral)",years:5,type:"treaty",requirements:"Citizens of USA, Canada and certain other countries may qualify for C permit after 5 years under specific cantonal provisions",notes:"Varies by canton — confirm with local Migrationsbehörde"},
    ],
    citizenshipPathways:[
      {name:"Ordinary Naturalization",years:10,type:"residence",requirements:"10 years total Swiss residence (years 8–18 count double), cantonal/municipal residence (2–5 years), language proficiency, integration assessment, no welfare dependency — THREE-LEVEL approval: federal + cantonal + municipal",notes:"Among the most demanding processes in Europe — unique triple government approval requirement"},
      {name:"Facilitated — Spouse of Swiss Citizen",years:5,type:"family",requirements:"Married to Swiss citizen for 3 years + lived in Switzerland for 5 years total (or married 3 years living abroad with strong ties)",notes:"Federal-level process bypassing some cantonal complexity"},
      {name:"Third Generation (Jus Soli for Grandchildren)",years:0,type:"birthright",requirements:"Born in Switzerland, grandparent had residence rights, parent born or grew up in Switzerland — apply before age 25",notes:"Introduced by 2017 referendum for long-settled immigrant families"},
      {name:"Children of Swiss Parent",years:0,type:"heritage",requirements:"Automatic citizenship if either parent is Swiss at birth",notes:"No residency requirement — standard jus sanguinis"},
      {name:"Stateless Born in Switzerland",years:0,type:"humanitarian",requirements:"Born stateless in Switzerland — apply before age 22 with 5 years residence",notes:"Statelessness prevention provision"},
    ]
  },
  {
    id:"SE",name:"Sweden",flag:"🇸🇪",capital:"Stockholm",population:"10.5M",gdp:"$593B",
    currency:"SEK (kr)",languages:["Swedish"],eu:true,schengen:true,passportRank:4,
    avgSalary:"SEK 420,000",costOfLiving:"High",climate:"Subarctic/Temperate",prYears:4,citizenshipYears:5,
    dualCitizenship:true,taxRate:"32–57%",healthcare:9.4,safety:9.2,education:9.5,
    digitalNomad:false,startupScore:9.0,familyFriendly:9.8,retirementFriendly:8.5,
    visas:["Skilled Worker","Student","Family Reunification","Self-Employed","Research","Seasonal","Working Holiday"],
    pros:["Best work-life balance in world","Free healthcare","Free university education","18-month parental leave","No formal language test for citizenship","English widely spoken everywhere"],
    cons:["Very high taxes","Long dark winters","Social integration can be difficult","Swedish needed for most jobs","Very high cost of living","Housing queue systems in cities"],
    prPathways:[
      {name:"Permanent Residence Permit (Standard)",years:4,type:"residence",requirements:"4 years of work permits/residence with stable employment and income (as little as 2 years for some categories)",notes:"PUT — can be granted after 2–4 years depending on visa type"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous lawful residence exercising EU treaty rights",notes:"Automatic right under EU free movement"},
      {name:"Family Member of Resident",years:2,type:"family",requirements:"2–4 years depending on relationship and sponsor's permit type",notes:"Tied to sponsor's permit duration"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years habitual residence (4 for stateless/refugees, 2 for Nordic citizens), good conduct — NO formal language test currently",notes:"Among the most accessible in EU — no mandatory language requirement"},
      {name:"Nordic Citizens (Notification)",years:2,type:"treaty",requirements:"2 years residence for citizens of Denmark, Finland, Iceland, Norway via simplified notification rather than full application",notes:"Fastest route in the entire EU for any nationality group"},
      {name:"Stateless/Former Swedish Citizens",years:4,type:"humanitarian",requirements:"4 years residence for stateless individuals or those with prior Swedish connection",notes:"Reduced timeline"},
      {name:"Children Adopted by Swedish Citizens",years:0,type:"adoption",requirements:"Automatic citizenship for children under 12 adopted by a Swedish citizen",notes:"Immediate upon adoption"},
      {name:"Swedish Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if mother is Swedish at birth, or father is Swedish and married to mother",notes:"No residency requirement"},
    ]
  },
  {
    id:"NO",name:"Norway",flag:"🇳🇴",capital:"Oslo",population:"5.4M",gdp:"$482B",
    currency:"NOK (kr)",languages:["Norwegian"],eu:false,schengen:true,passportRank:6,
    avgSalary:"NOK 600,000",costOfLiving:"Very High",climate:"Subarctic",prYears:3,citizenshipYears:7,
    dualCitizenship:true,taxRate:"22–47.4%",healthcare:9.5,safety:9.5,education:9.3,
    digitalNomad:false,startupScore:8.0,familyFriendly:9.8,retirementFriendly:8.8,
    visas:["Skilled Worker","Student","Family Reunification","Self-Employed","Research","Seasonal","Au Pair"],
    pros:["Fastest PR in Europe (3 years)","Very high salaries","Exceptional safety","Oil fund sovereign wealth","Stunning fjord nature","Dual citizenship since 2020"],
    cons:["Extremely expensive (world's priciest country)","Long dark winters","Norwegian language required","Limited English job market outside tech","Social distance culture"],
    prPathways:[
      {name:"Permanent Residence (Standard)",years:3,type:"residence",requirements:"3 years continuous residence on qualifying permits (work, family), 300 hours Norwegian language training, sufficient income, no benefit dependency in past 12 months",notes:"One of the fastest PR timelines in Europe — major advantage over other Schengen countries"},
      {name:"EEA Citizens",years:5,type:"eu",requirements:"5 years continuous residence under EEA rules (national 3-year PR also accessible for EEA citizens)",notes:"EEA registration simplifies the initial process"},
      {name:"Refugees / Protection Status",years:3,type:"humanitarian",requirements:"3 years residence with completed introduction program and Norwegian language training",notes:"Same standard timeline applies"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:7,type:"residence",requirements:"7 out of last 10 years residence (8 years total in practice), Norwegian B1, citizenship test, financial self-sufficiency — dual citizenship allowed since 2020",notes:"2020 reform: Norway finally allows dual citizenship after decades of single-nationality requirement"},
      {name:"Nordic Citizens (Simplified)",years:2,type:"treaty",requirements:"2 years residence for citizens of Denmark, Finland, Iceland, Sweden via simplified declaration",notes:"Fastest naturalization route available in Norway"},
      {name:"Stateless / Former Norwegians",years:7,type:"humanitarian",requirements:"Standard 7-year timeline but flexible counting for stateless persons",notes:"No major reduction but flexible year counting"},
      {name:"Norwegian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if either parent is Norwegian at time of birth, regardless of birthplace",notes:"No residency requirement — standard jus sanguinis"},
      {name:"Former Citizens Reacquisition",years:0,type:"heritage",requirements:"Simplified reacquisition for those who lost Norwegian citizenship by acquiring another nationality before 2020 dual-citizenship reform",notes:"Streamlined process post-2020 reform"},
    ]
  },
  {
    id:"DK",name:"Denmark",flag:"🇩🇰",capital:"Copenhagen",population:"5.9M",gdp:"$398B",
    currency:"DKK (kr)",languages:["Danish"],eu:true,schengen:true,passportRank:4,
    avgSalary:"DKK 520,000",costOfLiving:"Very High",climate:"Temperate",prYears:4,citizenshipYears:9,
    dualCitizenship:true,taxRate:"37–55.9%",healthcare:9.4,safety:9.5,education:9.5,
    digitalNomad:false,startupScore:8.8,familyFriendly:9.5,retirementFriendly:8.5,
    visas:["Positive List","Pay Limit","Research","Student","Family Reunification","Working Holiday","Self-Employed"],
    pros:["Highest happiness index in the world","Excellent work-life balance","World-class social services","Very safe","Cycling city infrastructure","English widely spoken"],
    cons:["9-year citizenship path (very long for EU)","Very high taxes","Very high cost of living","Danish language barrier","Strict and complex immigration rules"],
    prPathways:[
      {name:"Permanent Residence (Standard — 4 Year Track)",years:4,type:"residence",requirements:"4 years legal residence + active employment for 3 years + Danish Module 3/4 + active citizenship (volunteering, voting) + no serious crimes",notes:"2019 points-based system created tiered timelines of 4, 6, or 8 years based on integration points"},
      {name:"Points-Based Fast Track",years:4,type:"integration",requirements:"Sufficient integration points: employment record, income level, Danish language skills, active citizenship activities",notes:"Higher integration scores unlock faster PR timeline"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous lawful residence exercising EU treaty rights for permanent residence document",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:9,type:"residence",requirements:"9 years continuous residence, Danish language test, Indfødsretsprøven citizenship test, self-sufficiency (no public benefits past 2 years), declaration of allegiance",notes:"One of the longest and strictest EU naturalization processes"},
      {name:"Nordic Citizens (Simplified)",years:2,type:"treaty",requirements:"2 years residence for Finland, Iceland, Norway, Sweden nationals via simplified declaration",notes:"Fastest route available"},
      {name:"Spouse of Danish Citizen",years:6,type:"family",requirements:"Reduced to 6 years if married to Danish citizen — still requires language and citizenship tests",notes:"Modest reduction from standard 9 years"},
      {name:"Danish Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if either parent is Danish at time of birth — dual citizenship allowed since 2015",notes:"No residency requirement"},
      {name:"Stateless Born in Denmark",years:0,type:"humanitarian",requirements:"Children born stateless in Denmark may acquire citizenship by declaration if continuously resident",notes:"Statelessness prevention provision"},
      {name:"Former Danish Citizens Reacquisition",years:0,type:"heritage",requirements:"Simplified reacquisition for those who previously held and lost Danish citizenship",notes:"Especially relevant post-2015 dual citizenship reform"},
    ]
  },
  {
    id:"FI",name:"Finland",flag:"🇫🇮",capital:"Helsinki",population:"5.5M",gdp:"$305B",
    currency:"Euro (€)",languages:["Finnish","Swedish"],eu:true,schengen:true,passportRank:3,
    avgSalary:"€45,000",costOfLiving:"High",climate:"Subarctic",prYears:4,citizenshipYears:5,
    dualCitizenship:true,taxRate:"12.64–31.25%",healthcare:9.2,safety:9.8,education:9.8,
    digitalNomad:true,startupScore:8.5,familyFriendly:9.5,retirementFriendly:8.8,
    visas:["Skilled Worker","Student","Family Reunification","Startup","Self-Employed","Research","Seasonal"],
    pros:["World's happiest country (10 consecutive years)","Free top-ranked education","Cleanest nature in Europe","5-year citizenship path","Dual citizenship allowed","Strong tech ecosystem"],
    cons:["Finnish is one of world's hardest languages","Very cold dark winters","High cost of living","Remote northern location","Limited English-only job market outside Helsinki"],
    prPathways:[
      {name:"P Permit (Permanent)",years:4,type:"residence",requirements:"4 years continuous residence on A permits, stable income, no significant absence",notes:"P permit removes need for periodic renewal — one of the key advantages"},
      {name:"EU Long-Term Residence Permit",years:5,type:"eu",requirements:"5 years legal residence, stable income, health insurance",notes:"EU-wide portable status — alternative to national P permit"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence under EU free movement provisions",notes:"Registration certificate route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous residence (7 years with interruptions within last 10), Finnish or Swedish B1, no significant criminal record",notes:"Among the more accessible Nordic timelines"},
      {name:"Nordic Citizens (Notification)",years:2,type:"treaty",requirements:"2 years residence for Denmark, Iceland, Norway, Sweden nationals via simplified notification",notes:"Fastest route"},
      {name:"Spouse of Finnish Citizen",years:4,type:"family",requirements:"4 years combined residence + relationship duration, language requirement applies",notes:"Modest reduction from standard 5 years"},
      {name:"Former Finnish Citizens",years:0,type:"heritage",requirements:"Simplified declaration-based reacquisition for those who lost Finnish citizenship before dual citizenship was permitted in 2003",notes:"Streamlined process post-2003 reform"},
      {name:"Finnish Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if mother is Finnish at birth, or father is Finnish and married to mother, or father is Finnish and child born in Finland",notes:"No residency requirement"},
    ]
  },
  {
    id:"IE",name:"Ireland",flag:"🇮🇪",capital:"Dublin",population:"5.1M",gdp:"$533B",
    currency:"Euro (€)",languages:["English","Irish"],eu:true,schengen:false,passportRank:6,
    avgSalary:"€50,000",costOfLiving:"Very High",climate:"Oceanic",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"20–40%",healthcare:8.5,safety:9.0,education:8.8,
    digitalNomad:false,startupScore:9.0,familyFriendly:8.8,retirementFriendly:8.0,
    visas:["Critical Skills","General Employment","Startup","Investor","Student","Family Reunification","Working Holiday","Research"],
    pros:["English-speaking EU country","Post-Brexit tech hub","No language test for citizenship","Grandparent descent citizenship","Friendly culture","Low corporate tax"],
    cons:["Very high housing costs (acute crisis)","Not in Schengen Area","High cost of living","Rainy weather","Limited affordable housing"],
    prPathways:[
      {name:"Stamp 4 (Long-Term Residency)",years:5,type:"residence",requirements:"5 years of reckonable residence on employment permits, then eligible for Stamp 4 long-term residency",notes:"Stamp 4 effectively functions as permanent residency"},
      {name:"Critical Skills Fast Track",years:2,type:"skilled",requirements:"2 years on Critical Skills Employment Permit qualifies for Stamp 4 immediately",notes:"Key advantage for skilled professionals — 2 years vs 5 years"},
      {name:"EU/EEA Citizens",years:0,type:"eu",requirements:"No PR needed — EU/EEA/Swiss citizens have free movement and residence rights without permit",notes:"Automatic right under EU law"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years reckonable residence (1 continuous year immediately before application + 4 of previous 8 years), good character — no language test",notes:"No formal language test — great advantage for English speakers"},
      {name:"Spouse/Civil Partner of Irish Citizen",years:3,type:"family",requirements:"3 years marriage/partnership + 3 years reckonable residence",notes:"Reduced timeline for partners of Irish nationals"},
      {name:"Born on Island of Ireland",years:0,type:"birthright",requirements:"Born in Ireland or Northern Ireland to at least one parent who is Irish, British, EEA/Swiss national, or legally resident for 3 of prior 4 years",notes:"Modified jus soli post-2004 referendum"},
      {name:"Foreign Births Register (Grandparent Route)",years:0,type:"heritage",requirements:"Born abroad to an Irish citizen parent OR grandparent — register on Foreign Births Register at Irish embassy/consulate",notes:"Extremely popular — covers millions of diaspora"},
      {name:"Great-Grandparent Chain Registration",years:0,type:"heritage",requirements:"If parent already registered via FBR before your birth, you may also be eligible — chain extends across generations",notes:"Generational chain registration possible — very powerful diaspora tool"},
      {name:"Stateless / Refugees",years:3,type:"humanitarian",requirements:"3 years reckonable residence for stateless persons or recognised refugees",notes:"Humanitarian reduction from standard 5 years"},
    ]
  },
  {
    id:"GB",name:"United Kingdom",flag:"🇬🇧",capital:"London",population:"67.6M",gdp:"$3.1T",
    currency:"GBP (£)",languages:["English"],eu:false,schengen:false,passportRank:4,
    avgSalary:"£35,000",costOfLiving:"High",climate:"Oceanic",prYears:5,citizenshipYears:6,
    dualCitizenship:true,taxRate:"20–45%",healthcare:8.8,safety:8.5,education:9.5,
    digitalNomad:false,startupScore:9.2,familyFriendly:8.5,retirementFriendly:8.0,
    visas:["Skilled Worker","Student","Family Visa","Investor","Global Talent","Graduate","Innovator Founder","Health & Care Worker","Seasonal","Youth Mobility"],
    pros:["English-speaking","World-class universities","Global financial hub London","Cultural diversity","Strong rule of law","Global Talent visa"],
    cons:["Post-Brexit tightened immigration + very high visa fees","London cost of living extreme","NHS waiting times","Not in EU/Schengen","High salary thresholds"],
    prPathways:[
      {name:"Indefinite Leave to Remain (ILR) — Standard",years:5,type:"residence",requirements:"5 years continuous residence on qualifying visa, Life in the UK test, English B1, salary threshold maintained",notes:"Standard route for most work visa holders — ILR is UK's PR equivalent"},
      {name:"Global Talent Visa Fast Track",years:3,type:"skilled",requirements:"3 years on Global Talent endorsed category (5 years for 'exceptional promise' tier)",notes:"Fastest standard ILR route — for world-leading talent in academia, arts, tech, research"},
      {name:"Innovator Founder Fast Track",years:3,type:"business",requirements:"3 years operating an endorsed innovative business with viability confirmed",notes:"Entrepreneur-focused fast track"},
      {name:"Ancestry Visa (Commonwealth)",years:5,type:"heritage",requirements:"5 years on UK Ancestry visa — available to Commonwealth citizens with a UK-born grandparent",notes:"Unique Commonwealth ancestry route"},
      {name:"EU Settlement Scheme (Pre-Brexit)",years:5,type:"eu",requirements:"5 years continuous residence in UK before specified date for EU/EEA/Swiss citizens — Settled Status grants ILR equivalent",notes:"Legacy scheme for those resident before Brexit transition ended"},
      {name:"Spouse/Partner Route",years:5,type:"family",requirements:"5 years on partner visa, English requirement, financial threshold met by sponsor",notes:"Standard timeline for family migrants"},
      {name:"Hong Kong BN(O) Route",years:5,type:"special",requirements:"5 years on BN(O) visa, then 1 year with ILR before citizenship",notes:"Dedicated route created in response to 2020 Hong Kong situation"},
    ],
    citizenshipPathways:[
      {name:"Naturalization After ILR (Standard)",years:6,type:"residence",requirements:"Hold ILR for 12 months minimum, total 5 years residence + 1 year ILR, Life in the UK test, English B1",notes:"Most common route — ILR then naturalization"},
      {name:"Spouse of British Citizen",years:5,type:"family",requirements:"5 years residence + ILR (no mandatory 12-month wait after ILR if married to British citizen)",notes:"Saves the 1-year ILR waiting period"},
      {name:"Born in UK to Settled Parent",years:0,type:"birthright",requirements:"Born in UK with at least one parent who is British or has settled status (ILR)",notes:"Modified jus soli post-1983"},
      {name:"Residence to Age 10",years:0,type:"birthright",requirements:"Born in UK and lived continuously for first 10 years — entitled to register regardless of parents' status",notes:"Important fallback for those born in UK to non-settled parents"},
      {name:"British Parent Descent",years:0,type:"heritage",requirements:"Born abroad to a British citizen parent (otherwise than by descent) — automatic British citizenship",notes:"Generally limited to one generation born abroad"},
      {name:"Windrush / Commonwealth Pre-1973",years:0,type:"special",requirements:"Commonwealth citizens settled before 1973 and their children have rights confirmed under Windrush Scheme",notes:"Historic settlement confirmation for Windrush generation"},
    ]
  },
  {
    id:"AT",name:"Austria",flag:"🇦🇹",capital:"Vienna",population:"9.1M",gdp:"$527B",
    currency:"Euro (€)",languages:["German"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€43,000",costOfLiving:"High",climate:"Alpine/Temperate",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"20–55%",healthcare:9.3,safety:9.5,education:9.0,
    digitalNomad:true,startupScore:7.8,familyFriendly:9.0,retirementFriendly:9.0,
    visas:["Red-White-Red Card","EU Blue Card","Student","Family Reunification","Startup","Research","Investor","Freelance"],
    pros:["Vienna ranked world's most livable city","Excellent healthcare","Beautiful alpine scenery","Strong social services","Very safe","Central European location"],
    cons:["German B2 required for citizenship","Long citizenship path (10 years)","No dual citizenship (rare exceptions)","Strict immigration","High bureaucracy"],
    prPathways:[
      {name:"Daueraufenthalt-EU (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence, German B1, income above threshold, health insurance, accommodation",notes:"Standard EU-style permanent residence permit"},
      {name:"Red-White-Red Card Plus",years:5,type:"skilled",requirements:"5 years on Red-White-Red Card (points-based scheme) leads to Card Plus with full labor market access",notes:"RWR Card Plus is the interim step toward Daueraufenthalt-EU"},
      {name:"EU Blue Card Holders",years:5,type:"eu",requirements:"5 years on EU Blue Card with highly skilled employment",notes:"Standard timeline — Blue Card eases salary-based initial entry"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years legal residence (reduced to 6 for exceptional integration), German B2 written + spoken, citizenship knowledge test, renounce prior nationality",notes:"No dual citizenship for naturalized citizens — one of EU's strictest policies"},
      {name:"Exceptional Integration (6 yrs)",years:6,type:"integration",requirements:"6 years with proven exceptional integration: German C1, significant volunteer/professional achievements",notes:"Discretionary fast-track for high achievers"},
      {name:"Spouse of Austrian Citizen",years:6,type:"family",requirements:"6 years residence + minimum 5 years marriage to Austrian citizen, German B1",notes:"Reduced from standard 10 years"},
      {name:"Nazi Persecution Descendants (2019 Law)",years:0,type:"heritage",requirements:"Descendants of Austrians who fled Nazi persecution 1933–1945 can apply without renouncing current nationality",notes:"Dual citizenship permitted specifically for this restitution category"},
      {name:"Austrian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if either parent is Austrian at time of birth",notes:"No residency requirement — standard jus sanguinis"},
    ]
  },
  {
    id:"BE",name:"Belgium",flag:"🇧🇪",capital:"Brussels",population:"11.6M",gdp:"$623B",
    currency:"Euro (€)",languages:["Dutch","French","German"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€46,000",costOfLiving:"High",climate:"Oceanic",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"25–50%",healthcare:9.2,safety:8.5,education:8.8,
    digitalNomad:false,startupScore:8.2,familyFriendly:9.0,retirementFriendly:8.5,
    visas:["Single Permit","EU Blue Card","Student","Family Reunification","Investor","Research","Startup","Professional Card"],
    pros:["EU capital (Brussels)","Multilingual environment","Dual citizenship allowed","Strong worker protections","Good salaries","Excellent beer & food culture"],
    cons:["Very high income taxes","Extremely complex regional 3-language governance","High bureaucracy","High cost of living"],
    prPathways:[
      {name:"Permanent Residence (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence with valid permit, stable income, integration course completion (varies by region)",notes:"Regional requirements differ significantly — Flanders has stricter integration requirements"},
      {name:"EU Long-Term Resident Status",years:5,type:"eu",requirements:"5 years legal and continuous residence, stable resources, health insurance",notes:"Portable EU-wide status"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Automatic registration-based right"},
    ],
    citizenshipPathways:[
      {name:"Naturalization by Declaration",years:5,type:"residence",requirements:"5 years legal residence, proof of social/economic/linguistic integration, knowledge of Dutch, French, or German",notes:"Most common route — declaration to civil registrar is simpler than parliamentary route"},
      {name:"Third Generation (Jus Soli)",years:0,type:"birthright",requirements:"Born in Belgium, with a parent also born in Belgium, and grandparent who resided in Belgium — automatic citizenship",notes:"Three-generation jus soli provision"},
      {name:"Second Generation Declaration",years:0,type:"birthright",requirements:"Born in Belgium to a foreign parent also born in Belgium — can acquire citizenship by declaration before age 18",notes:"Two-generation jus soli declaration"},
      {name:"Belgian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Belgian at time of birth",notes:"No residency requirement, dual citizenship allowed"},
      {name:"Stateless Persons",years:2,type:"humanitarian",requirements:"2 years residence for recognised stateless persons via declaration",notes:"Significantly reduced from standard 5 years"},
    ]
  },
  {
    id:"LU",name:"Luxembourg",flag:"🇱🇺",capital:"Luxembourg City",population:"672K",gdp:"$87B",
    currency:"Euro (€)",languages:["Luxembourgish","French","German"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€70,000",costOfLiving:"Very High",climate:"Oceanic",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"8–42%",healthcare:9.5,safety:9.5,education:9.2,
    digitalNomad:false,startupScore:8.5,familyFriendly:9.2,retirementFriendly:9.5,
    visas:["Skilled Worker","EU Blue Card","Investor","Student","Family Reunification","Research","Startup"],
    pros:["Highest salaries in EU","Very safe","5-year citizenship path","Dual citizenship allowed","Ancestry recovery law for diaspora","Central EU location"],
    cons:["Very high housing costs","Three languages required for full integration","Very small country","Expensive cost of living"],
    prPathways:[
      {name:"EU Long-Term Resident Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, health insurance, accommodation, basic Luxembourgish",notes:"Standard EU-style permit giving EU mobility rights"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Automatic under EU free movement"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years legal residence (last year continuous), Luxembourgish language test, 24-hour civic education course, no serious criminal record",notes:"One of the most accessible standard timelines in EU — 5 years with dual citizenship allowed"},
      {name:"Nationality Recovery Law",years:0,type:"heritage",requirements:"Proof of direct ancestor who held Luxembourg nationality on 1 Jan 1900 — special 'recovery' provision under 2009/2017 nationality laws",notes:"Popular ancestry route reflecting historic emigration to USA, South America"},
      {name:"Spouse of Luxembourg Citizen",years:3,type:"family",requirements:"3 years marriage/partnership plus residence, language requirements still apply",notes:"Reduced from standard 5 years"},
      {name:"Double Jus Soli",years:0,type:"birthright",requirements:"Born in Luxembourg with at least one parent also born in Luxembourg — automatic citizenship",notes:"Two-generation jus soli provision"},
      {name:"Luxembourg Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Luxembourgish at time of birth",notes:"No residency requirement, dual citizenship fully allowed"},
    ]
  },
  {
    id:"GR",name:"Greece",flag:"🇬🇷",capital:"Athens",population:"10.4M",gdp:"$239B",
    currency:"Euro (€)",languages:["Greek"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€20,000",costOfLiving:"Low-Medium",climate:"Mediterranean",prYears:5,citizenshipYears:7,
    dualCitizenship:true,taxRate:"22–44%",healthcare:7.8,safety:8.2,education:8.0,
    digitalNomad:true,startupScore:6.5,familyFriendly:8.5,retirementFriendly:9.0,
    visas:["Golden Visa","Digital Nomad","Student","Family Reunification","Self-Employed","Investor","Retirement Visa","Research"],
    pros:["Golden Visa program","Excellent Mediterranean climate","Affordable cost of living","Beautiful islands","Digital nomad visa","Great food culture"],
    cons:["Lower salaries","Greek language barrier","Bureaucracy and slow administration","Healthcare quality varies"],
    prPathways:[
      {name:"EU Long-Term Residence (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, health insurance, Greek language and culture PEGP certification",notes:"Standard EU-style permit"},
      {name:"Golden Visa Holders (Conversion)",years:5,type:"investment",requirements:"5 years from Golden Visa investment permit with actual residence in Greece",notes:"Golden Visa thresholds raised to €800k in prime areas (2023)"},
      {name:"Financially Independent Persons Visa",years:5,type:"passive",requirements:"5 years on FIP visa with proof of sufficient passive income/pension from abroad",notes:"Popular with non-EU retirees"},
      {name:"Digital Nomad Visa Route",years:5,type:"digital",requirements:"5 years on digital nomad visa with proof of remote employment income above threshold (€3,500/month)",notes:"Introduced 2021 — growing in popularity"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:7,type:"residence",requirements:"7 years legal continuous residence, Greek language B1, Greek history/culture/geography exam, integration interview",notes:"Standard route for most non-EU/non-descent applicants"},
      {name:"EU Citizens Reduced",years:3,type:"eu",requirements:"3 years residence for EU/EEA citizens and certain categories with strong integration",notes:"Significant reduction for EU nationals"},
      {name:"Marriage to Greek Citizen",years:3,type:"family",requirements:"3 years of marriage with residence in Greece, Greek language requirement",notes:"Reduced from standard 7 years"},
      {name:"Omogenis (Greek Co-ethnic) Route",years:1,type:"heritage",requirements:"Proof of Greek ethnic origin (documented ancestry, especially from Albania's Northern Epirus, former USSR/Pontic Greeks) — special 'homogeneis' status",notes:"Significant Pontic Greek and Epirus Albanian-Greek population have used this — very fast track"},
      {name:"Born in Greece + Greek Schooling (Jus Soli)",years:0,type:"birthright",requirements:"Born in Greece, completed 6 years of Greek school, one parent resided legally 5 years — eligible by declaration",notes:"Modified jus soli via school attendance — no citizenship test required"},
      {name:"Greek Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Greek at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"PL",name:"Poland",flag:"🇵🇱",capital:"Warsaw",population:"37.5M",gdp:"$748B",
    currency:"PLN (zł)",languages:["Polish"],eu:true,schengen:true,passportRank:6,
    avgSalary:"PLN 80,000",costOfLiving:"Low-Medium",climate:"Continental",prYears:5,citizenshipYears:5,
    dualCitizenship:false,taxRate:"12–32%",healthcare:8.0,safety:8.8,education:8.5,
    digitalNomad:false,startupScore:7.8,familyFriendly:8.8,retirementFriendly:7.5,
    visas:["Work Permit","Skilled Worker","Student","Family Reunification","Business","Research","Seasonal"],
    pros:["Low cost of living","Rapidly growing economy","Low taxes","Good universities","Central location","Growing tech sector"],
    cons:["Polish language required","Cold winters","No dual citizenship (generally)","Political polarization"],
    prPathways:[
      {name:"EU Long-Term Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, health insurance, Polish language helpful",notes:"Standard EU-style permit"},
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous temporary residence permits then eligible for Karta pobytu stałego",notes:"Alternative to EU long-term route with similar timeline"},
      {name:"Polish Card Holders Fast Track",years:1,type:"heritage",requirements:"Holders of the Karta Polaka (Polish descent in former USSR states) can obtain permanent residence after just 1 year",notes:"Major fast-track for Polish diaspora in Eastern Europe"},
      {name:"Spouse of Polish Citizen",years:3,type:"family",requirements:"3 years of marriage to Polish citizen plus residence in Poland",notes:"Reduced from standard 5 years"},
    ],
    citizenshipPathways:[
      {name:"Recognition as Polish Citizen",years:3,type:"residence",requirements:"3 years continuous legal residence with permanent residence or EU long-term permit, stable income, Polish B1",notes:"More predictable administrative route than presidential grant"},
      {name:"Presidential Grant",years:5,type:"special",requirements:"No fixed legal minimum — discretionary presidential decision; 3-5+ years residence typically expected",notes:"President of Poland can grant citizenship to anyone — highly discretionary"},
      {name:"Repatriation (Former USSR Poles)",years:0,type:"heritage",requirements:"Proof of Polish ancestry (grandparent/parent was Polish) for individuals from former Soviet republics — repatriation visa leads to immediate citizenship",notes:"Major historical route for ethnic Poles from Kazakhstan, Russia, Ukraine, Belarus"},
      {name:"Polish Card Fast Track (1 year)",years:1,type:"heritage",requirements:"Karta Polaka holders who relocate to Poland can apply for citizenship after as little as 1 year",notes:"Significant acceleration for Polish diaspora — combines with PR fast track"},
      {name:"Polish Descent — Jus Sanguinis (Unlimited Generations)",years:0,type:"heritage",requirements:"Poland recognizes citizenship by descent often without generational limit if chain never broken by formal renunciation",notes:"Popular route for descendants of pre-war Polish citizens — particularly US, Argentine, Brazilian Polish communities"},
    ]
  },
  {
    id:"CZ",name:"Czechia",flag:"🇨🇿",capital:"Prague",population:"10.9M",gdp:"$330B",
    currency:"CZK (Kč)",languages:["Czech"],eu:true,schengen:true,passportRank:6,
    avgSalary:"CZK 440,000",costOfLiving:"Low-Medium",climate:"Continental",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"15–23%",healthcare:8.5,safety:9.2,education:8.8,
    digitalNomad:false,startupScore:7.5,familyFriendly:8.5,retirementFriendly:8.5,
    visas:["Employee Card","Skilled Worker","Student","Family Reunification","Business","Research","Intra-Company Transfer"],
    pros:["Very affordable in Prague","Low flat taxes","Very safe","Beautiful architecture","Dual citizenship allowed since 2014","High quality of life per cost"],
    cons:["Czech language barrier","Cold winters","Limited English outside Prague","Bureaucratic immigration process"],
    prPathways:[
      {name:"Permanent Residence (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence on long-term visas/permits, Czech A1 language test, integration exam",notes:"Standard route for most categories"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision — simplified process"},
      {name:"Employee Card / Blue Card Holders",years:5,type:"skilled",requirements:"5 years on Employee Card or EU Blue Card with continuous qualifying employment",notes:"Standard timeline — Blue Card for highly qualified"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous permanent residence, Czech B1, knowledge of Czech constitution/history/culture, no state debts — dual citizenship allowed since 2014",notes:"2014 reform dramatically changed Czech citizenship law"},
      {name:"EU/EEA/Swiss Citizens Reduced",years:3,type:"eu",requirements:"3 years permanent residence for EU, EEA, or Swiss citizens",notes:"Significant reduction for EU nationals"},
      {name:"Spouse of Czech Citizen",years:3,type:"family",requirements:"3 years of marriage to Czech citizen with residence in Czech Republic",notes:"Reduced from standard 5 years"},
      {name:"Former Czechoslovak Citizens",years:0,type:"heritage",requirements:"Individuals who lost Czechoslovak/Czech citizenship under communist-era laws can often reacquire via simplified declaration",notes:"Historic restitution route for communist-era emigrants"},
      {name:"Czech Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Czech at time of birth, regardless of birthplace",notes:"No residency requirement, dual citizenship permitted"},
    ]
  },
  {
    id:"MT",name:"Malta",flag:"🇲🇹",capital:"Valletta",population:"535K",gdp:"$20B",
    currency:"Euro (€)",languages:["Maltese","English"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€28,000",costOfLiving:"Medium",climate:"Mediterranean",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"0–35%",healthcare:8.5,safety:9.2,education:8.5,
    digitalNomad:true,startupScore:7.5,familyFriendly:8.8,retirementFriendly:9.5,
    visas:["Skilled Worker","Digital Nomad","MRVP (Residency)","Student","Family Reunification","Retirement Programme","Malta Startup Residence"],
    pros:["English official language","Warm Mediterranean climate","Investment citizenship route (unique in EU)","Very safe","Tax advantages","Multi-generational descent citizenship"],
    cons:["Small country","Limited job market","Expensive relative to local income","Overtourism"],
    prPathways:[
      {name:"Malta Permanent Residence Programme (MPRP)",years:0,type:"investment",requirements:"Government contribution (~€28,000–€58,000), property purchase (~€300,000+) or rental, admin fee, NGO donation",notes:"Investment-based — grants permanent residence rights without any lengthy residency wait"},
      {name:"Standard Long-Term Residence",years:5,type:"residence",requirements:"5 years continuous legal residence on work/self-sufficiency permits, stable income, health insurance",notes:"Traditional route for employment-based residents"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization by Residence",years:5,type:"residence",requirements:"5 years aggregate residence (12 continuous months immediately before), good character, knowledge of Maltese or English",notes:"Eased by English being an official language"},
      {name:"Citizenship for Exceptional Services (Investment)",years:1,type:"investment",requirements:"1-3 years residence + financial contribution (~€600,000–€750,000) + real estate investment + due diligence",notes:"Malta's 'golden passport' — one of the very few EU countries offering citizenship by investment"},
      {name:"Malta Descent (Multi-Generational, Unlimited)",years:0,type:"heritage",requirements:"Malta allows citizenship by descent without generational limit for those descended from Maltese-born ancestor",notes:"Very popular with large Maltese diaspora in Australia, UK, Canada, USA"},
      {name:"Born in Malta",years:0,type:"birthright",requirements:"Born in Malta with at least one parent who is Maltese, or under certain residency conditions for parents",notes:"Modified jus soli"},
      {name:"Marriage to Maltese Citizen",years:5,type:"family",requirements:"5 years of marriage + residence (simplified documentation vs standard)",notes:"Standard timeline for spouses"},
      {name:"Former Citizens Resumption",years:0,type:"heritage",requirements:"Individuals who lost Maltese citizenship before dual citizenship was allowed in 2000 can resume citizenship",notes:"Streamlined resumption process"},
    ]
  },
  {
    id:"CY",name:"Cyprus",flag:"🇨🇾",capital:"Nicosia",population:"1.2M",gdp:"$28B",
    currency:"Euro (€)",languages:["Greek","Turkish"],eu:true,schengen:false,passportRank:6,
    avgSalary:"€28,000",costOfLiving:"Medium",climate:"Mediterranean",prYears:5,citizenshipYears:7,
    dualCitizenship:true,taxRate:"0–35%",healthcare:8.2,safety:9.0,education:8.2,
    digitalNomad:true,startupScore:7.5,familyFriendly:8.5,retirementFriendly:9.2,
    visas:["Category F (Retired)","Digital Nomad","Fast Track Business Visa","Student","Family Reunification","Investment Residence","Skilled Worker"],
    pros:["English widely spoken (British influence)","Very low corporate tax (12.5%)","Fast-track PR for investors","Excellent Mediterranean climate","Great for retirees"],
    cons:["Not in Schengen Area","Political division (North Cyprus)","Limited job market","Hot summers","Water shortages"],
    prPathways:[
      {name:"Category F — Financial Independence (Fast Track)",years:0,type:"investment",requirements:"Proof of stable annual income from abroad (~€50,000+ depending on dependents), property purchase/rental, clean criminal record — processed in months",notes:"Among the fastest PR routes in the EU — income-based not investment amount"},
      {name:"Fast-Track Investment PR",years:0,type:"investment",requirements:"Real estate investment of at least €300,000 plus proof of secured annual income — processed within 2 months",notes:"Fastest official route for wealthy individuals"},
      {name:"Standard Residence Permit Route",years:7,type:"residence",requirements:"7 years continuous legal residence on temporary permits",notes:"Slow traditional route — most use investment or income-based categories instead"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:7,type:"residence",requirements:"7 years legal residence (last year continuous), Greek language knowledge, good character",notes:"Standard route"},
      {name:"Spouse of Cypriot Citizen",years:4,type:"family",requirements:"4 years of marriage and residence (3 years if children born from the marriage)",notes:"Reduced timeline, further reduced with children"},
      {name:"Cypriot Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Cypriot at birth, including for those born abroad",notes:"No residency requirement — popular with large diaspora in UK, Australia"},
      {name:"Cyprus Investment Programme (Discontinued 2020)",years:0,type:"investment",requirements:"Former 'golden passport' program suspended November 2020 following EU Commission action",notes:"Historic route now closed — only legacy applications being processed"},
    ]
  },
  {
    id:"HR",name:"Croatia",flag:"🇭🇷",capital:"Zagreb",population:"4.0M",gdp:"$81B",
    currency:"Euro (€)",languages:["Croatian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€18,000",costOfLiving:"Low-Medium",climate:"Mediterranean/Continental",prYears:5,citizenshipYears:8,
    dualCitizenship:true,taxRate:"24–36%",healthcare:8.0,safety:9.0,education:8.0,
    digitalNomad:true,startupScore:6.5,familyFriendly:8.5,retirementFriendly:8.8,
    visas:["Work Permit","Digital Nomad","Student","Family Reunification","Self-Employed","Research"],
    pros:["Beautiful Adriatic coastline","EU/Schengen since 2023","Euro adopted 2023","Affordable cost of living","Growing digital nomad scene"],
    cons:["Lower salaries","Croatian language required","Limited job market","Brain drain of younger population"],
    prPathways:[
      {name:"Permanent Residence (Standard)",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, stable income, health insurance, basic Croatian",notes:"Standard EU-style route"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence, Croatian language and Latin script, knowledge of Croatian culture",notes:"Dual citizenship allowed for many nationalities via bilateral agreements"},
      {name:"Croatian Descent / Diaspora",years:0,type:"heritage",requirements:"Proof of Croatian ethnic origin (parent or grandparent Croatian) — no residency requirement for diaspora",notes:"Major route for Croatian diaspora in Argentina, Australia, Germany, USA, Bosnia"},
      {name:"Marriage to Croatian Citizen",years:5,type:"family",requirements:"5 years of marriage (with residence) — somewhat reduced compared to full 8-year general route",notes:"Marginal reduction; varies by case"},
      {name:"Croatian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Croatian at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"EE",name:"Estonia",flag:"🇪🇪",capital:"Tallinn",population:"1.4M",gdp:"$40B",
    currency:"Euro (€)",languages:["Estonian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€22,000",costOfLiving:"Low-Medium",climate:"Subarctic",prYears:5,citizenshipYears:8,
    dualCitizenship:false,taxRate:"22% flat",healthcare:8.5,safety:9.5,education:9.0,
    digitalNomad:true,startupScore:9.5,familyFriendly:8.5,retirementFriendly:7.5,
    visas:["Work Permit","Digital Nomad (E-Residency)","Startup Visa","Student","Family Reunification","Investor","Highly Qualified Professional"],
    pros:["Most digitally advanced country in world","E-Residency program","Startup visa ecosystem","Low flat 22% tax","Fast internet everywhere"],
    cons:["Estonian language extremely difficult","No dual citizenship (rare exceptions)","Long citizenship path (8 yrs)","Cold long winters"],
    prPathways:[
      {name:"Long-Term Resident Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, registered residence, legal income, health insurance, Estonian A2",notes:"Standard EU long-term resident route"},
      {name:"Startup Visa Route",years:5,type:"business",requirements:"5 years on startup visa with continuous qualifying business activity counts toward standard PR timeline",notes:"Same timeline — startup visa eases initial entry for founders"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years permanent residence (last 5 continuous), Estonian B1/B2 language exam, knowledge of Estonian constitution, loyalty oath — dual citizenship generally NOT permitted",notes:"Among the stricter EU citizenship regimes"},
      {name:"Stateless Persons / Grey Passport Holders",years:5,type:"humanitarian",requirements:"Reduced requirements for stateless residents (many Russian-speaking from Soviet era) — simplified naturalization for children born to stateless parents after 1992",notes:"Addresses Estonia's significant stateless population from the post-Soviet transition"},
      {name:"Pre-1940 Citizens & Descendants (Restoration)",years:0,type:"heritage",requirements:"Descendants of those who were Estonian citizens before Soviet annexation in 1940 can claim citizenship by descent without naturalization",notes:"Restitution-based route reflecting Estonia's Soviet occupation history"},
      {name:"Estonian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Estonian at time of birth, regardless of birthplace",notes:"No residency requirement"},
    ]
  },
  {
    id:"LV",name:"Latvia",flag:"🇱🇻",capital:"Riga",population:"1.8M",gdp:"$42B",
    currency:"Euro (€)",languages:["Latvian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€18,000",costOfLiving:"Low",climate:"Subarctic",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"20–31%",healthcare:7.8,safety:8.5,education:8.5,
    digitalNomad:true,startupScore:7.5,familyFriendly:8.0,retirementFriendly:7.0,
    visas:["Work Permit","Startup Visa","Student","Family Reunification","Investor","Research"],
    pros:["Low cost of living","Riga (beautiful Baltic capital)","Affordable housing","Growing startup ecosystem"],
    cons:["Very long citizenship path (10 yrs)","No dual citizenship (strict)","Latvian language very difficult","Cold winters"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, Latvian A2 language proficiency, health insurance",notes:"Standard route"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years permanent residence (5 years if born in Latvia), Latvian B2 exam, Latvian history/constitution test, renunciation of other citizenship (dual restricted — except for EU/NATO/EFTA countries)",notes:"Long timeline reflects post-Soviet citizenship policy"},
      {name:"Non-Citizens Simplified Route",years:0,type:"humanitarian",requirements:"Latvia's registered 'non-citizens' (mostly ethnic Russians from Soviet era) — simplified naturalization via language and history test without full 10-year requirement",notes:"Unique to Latvia — addresses large non-citizen population (~200,000+)"},
      {name:"Children of Non-Citizens Born Post-1991",years:0,type:"birthright",requirements:"Children born in Latvia after August 1991 to non-citizen parents can acquire citizenship via simplified registration",notes:"Statelessness reduction provision"},
      {name:"Pre-1940 Citizens & Descendants (Restoration)",years:0,type:"heritage",requirements:"Descendants of pre-Soviet-occupation Latvian citizens can register citizenship by descent without naturalization",notes:"Restitution provision reflecting Latvia's occupation history"},
      {name:"Latvian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Latvian at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"LT",name:"Lithuania",flag:"🇱🇹",capital:"Vilnius",population:"2.9M",gdp:"$74B",
    currency:"Euro (€)",languages:["Lithuanian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€20,000",costOfLiving:"Low",climate:"Subarctic",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"20–32%",healthcare:8.0,safety:8.8,education:8.8,
    digitalNomad:true,startupScore:7.8,familyFriendly:8.5,retirementFriendly:7.5,
    visas:["Work Permit","Student","Family Reunification","Investor","Self-Employed","Research","Startup"],
    pros:["Very affordable","Vilnius growing fintech hub","Low taxes","Fast internet","Beautiful old town"],
    cons:["Long citizenship path (10 yrs)","Lithuanian language extremely difficult","No dual citizenship (with diaspora exceptions)","Cold winters"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, Lithuanian A2/B1 language, stable income, integration test",notes:"Standard route"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years continuous legal residence, Lithuanian B1 language, knowledge of Constitution, renunciation of prior citizenship required for most",notes:"Constitutional restrictions on dual citizenship among strictest in EU — though diaspora exempted"},
      {name:"Lithuanian Descent / Restoration (Diaspora Exemption)",years:0,type:"heritage",requirements:"Persons who or whose ancestors held Lithuanian citizenship before 15 June 1940, or of Lithuanian ethnic origin — can restore citizenship without residency AND retain dual citizenship as exception",notes:"Major route for the very large Lithuanian diaspora in US, UK, Brazil, Argentina"},
      {name:"Marriage to Lithuanian Citizen",years:7,type:"family",requirements:"7 years of marriage with residence",notes:"Modest reduction from standard 10 years"},
      {name:"2024 Referendum Dual Citizenship Expansion",years:0,type:"special",requirements:"A 2024 referendum sought to expand dual citizenship for emigrants who left after 1990 — verify current implementation status",notes:"Ongoing constitutional reform — check current status"},
      {name:"Lithuanian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Lithuanian at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"SI",name:"Slovenia",flag:"🇸🇮",capital:"Ljubljana",population:"2.1M",gdp:"$68B",
    currency:"Euro (€)",languages:["Slovenian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€24,000",costOfLiving:"Medium",climate:"Alpine/Mediterranean",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"16–50%",healthcare:8.5,safety:9.5,education:8.8,
    digitalNomad:false,startupScore:7.2,familyFriendly:9.0,retirementFriendly:8.5,
    visas:["Work Permit","Student","Family Reunification","Self-Employed","Investor","Research"],
    pros:["Very safe","Beautiful alpine scenery + Adriatic coast","Good healthcare","Affordable vs W Europe"],
    cons:["Slovenian language barrier","Long citizenship path (10 yrs)","No dual citizenship for most","Small economy"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, Slovenian A2 language, stable income, integration program",notes:"Standard EU-style route"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years total residence (last 5 continuous), Slovenian B2 exam, regular income, renunciation generally required (EU nationals exception exists)",notes:"EU nationals can retain dual citizenship — others generally must renounce"},
      {name:"Marriage to Slovenian Citizen",years:5,type:"family",requirements:"5 years of marriage (or 2 years if the couple has a child together and resides in Slovenia)",notes:"Significant reduction with children — 2 years vs 10 years standard"},
      {name:"Emigrants & Descendants Diaspora",years:0,type:"heritage",requirements:"Emigrants and their descendants (up to 2nd generation born abroad) may acquire citizenship without standard residency, demonstrating ties to Slovenia",notes:"Diaspora-focused route — important for Slovenian communities in Argentina, USA, Australia, Germany"},
      {name:"Exceptional Naturalization (National Interest)",years:0,type:"special",requirements:"Granted at government discretion for individuals whose admission is in Slovenia's interest",notes:"Discretionary, no fixed residency requirement"},
      {name:"Slovenian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Slovenian at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"SK",name:"Slovakia",flag:"🇸🇰",capital:"Bratislava",population:"5.5M",gdp:"$128B",
    currency:"Euro (€)",languages:["Slovak"],eu:true,schengen:true,passportRank:6,
    avgSalary:"€22,000",costOfLiving:"Low-Medium",climate:"Continental",prYears:5,citizenshipYears:8,
    dualCitizenship:false,taxRate:"19–25%",healthcare:8.0,safety:9.0,education:8.5,
    digitalNomad:false,startupScore:6.8,familyFriendly:8.5,retirementFriendly:8.0,
    visas:["Work Permit","Student","Family Reunification","Business","Self-Employed","Investor"],
    pros:["Low cost of living","Low flat tax","Bratislava next to Vienna and Budapest","Safe","Beautiful countryside"],
    cons:["Slovak language required","No dual citizenship (restricted)","Limited job market","Conservative politics"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits (unlimited duration after first renewal), clean criminal record",notes:"Standard route"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous permanent residence (5 years if married to Slovak for 2+ years), Slovak B1/B2 exam, renunciation of prior citizenship generally required",notes:"No dual citizenship for naturalized citizens"},
      {name:"Spouse of Slovak Citizen",years:5,type:"family",requirements:"5 years permanent residence if married to Slovak citizen for at least 2 years, Slovak language proficiency",notes:"Reduced from standard 8 years"},
      {name:"Slovak Living Abroad (Compatriot Status)",years:0,type:"heritage",requirements:"Persons holding 'Slovak Living Abroad' certificate (ethnic Slovak ancestry) can apply with reduced/waived residency and may retain dual citizenship as exception",notes:"Major route for Slovak diaspora descendants in USA, Canada, Serbia (Vojvodina)"},
      {name:"Slovak Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Slovak at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"HU",name:"Hungary",flag:"🇭🇺",capital:"Budapest",population:"9.7M",gdp:"$193B",
    currency:"HUF (Ft)",languages:["Hungarian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"HUF 600,000",costOfLiving:"Low-Medium",climate:"Continental",prYears:3,citizenshipYears:8,
    dualCitizenship:true,taxRate:"15% flat",healthcare:7.8,safety:8.5,education:8.5,
    digitalNomad:true,startupScore:7.0,familyFriendly:8.0,retirementFriendly:8.0,
    visas:["Work Permit","Guest Worker","Digital Nomad","Student","Family Reunification","Investor (White Card)","Research","Guest Self-Employed"],
    pros:["Fastest PR in EU (3 years)","Low 15% flat income tax","Budapest highly affordable","Simplified citizenship for ethnic Hungarians (zero residency)"],
    cons:["Hungarian language very difficult","Political and rule-of-law concerns","Healthcare quality below EU average"],
    prPathways:[
      {name:"National Permanent Residence (Standard)",years:3,type:"residence",requirements:"3 years continuous legal residence, stable income, accommodation, health insurance",notes:"One of fastest PR timelines in the EU — major advantage"},
      {name:"EC Permanent Residence Permit",years:5,type:"eu",requirements:"5 years continuous legal residence — EU-wide portable status with broader mobility rights",notes:"Longer but EU-portable alternative to the 3-year national PR"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence, Hungarian language exam, constitutional/civic knowledge test, stable income",notes:"Standard route for those without Hungarian ancestry"},
      {name:"Simplified Naturalization (Hungarian Descent) — Zero Residency",years:0,type:"heritage",requirements:"Proof of Hungarian ancestry (parent or grandparent was Hungarian citizen, or demonstrates Hungarian cultural identity and basic language knowledge) — NO residency in Hungary required",notes:"Most popular route — used by hundreds of thousands of ethnic Hungarians in Romania, Slovakia, Serbia, Ukraine since 2011. Processed in months."},
      {name:"Marriage to Hungarian Citizen",years:3,type:"family",requirements:"3 years of marriage with residence, Hungarian language requirement still applies",notes:"Reduced timeline for spouses"},
      {name:"Hungarian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Hungarian at time of birth, regardless of birthplace",notes:"No residency requirement, dual citizenship allowed"},
      {name:"Stateless Born in Hungary",years:0,type:"humanitarian",requirements:"Children born to stateless parents in Hungary",notes:"Statelessness prevention"},
    ]
  },
  {
    id:"RO",name:"Romania",flag:"🇷🇴",capital:"Bucharest",population:"19.3M",gdp:"$350B",
    currency:"RON (lei)",languages:["Romanian"],eu:true,schengen:false,passportRank:6,
    avgSalary:"RON 60,000",costOfLiving:"Low",climate:"Continental",prYears:5,citizenshipYears:8,
    dualCitizenship:true,taxRate:"10% flat",healthcare:7.5,safety:8.0,education:8.0,
    digitalNomad:true,startupScore:7.0,familyFriendly:8.0,retirementFriendly:7.5,
    visas:["Work Permit","Digital Nomad","Student","Family Reunification","Business","Investor","Self-Employed","Long-stay D Visa"],
    pros:["Very low cost of living","10% flat income tax","Growing tech sector in Cluj/Bucharest","Ancestry citizenship route (very popular)"],
    cons:["Schengen land borders only (air Schengen since 2024)","Healthcare below EU average","Corruption perceptions"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, accommodation, basic Romanian language",notes:"Standard EU-style route"},
      {name:"EU Long-Term Resident Permit",years:5,type:"eu",requirements:"5 years continuous legal residence, stable income, health insurance",notes:"Portable EU-wide status"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence (5 years if married to Romanian for 5 years), Romanian B1 test, civic knowledge",notes:"Standard route for those without Romanian heritage"},
      {name:"Romanian Descent / Restitution (Most Used Route)",years:0,type:"heritage",requirements:"Proof that applicant or ancestors held Romanian citizenship before it was lost due to border changes after WWII (affecting Moldova, Bukovina, Bessarabia) — NO residency required",notes:"Most popular route — used by hundreds of thousands of Moldovan citizens; grants automatic EU citizenship"},
      {name:"Marriage to Romanian Citizen",years:5,type:"family",requirements:"5 years of marriage with residence in Romania",notes:"Reduced from standard 8 years"},
      {name:"Former Citizens Reacquisition",years:0,type:"heritage",requirements:"Individuals who lost Romanian citizenship involuntarily (communist era) can reacquire by declaration without residency",notes:"Restitution route for communist-era emigrants"},
      {name:"Stateless / Refugees",years:4,type:"humanitarian",requirements:"4 years residence for stateless persons or refugees",notes:"Humanitarian reduction from standard 8 years"},
      {name:"Romanian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Romanian at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"BG",name:"Bulgaria",flag:"🇧🇬",capital:"Sofia",population:"6.8M",gdp:"$100B",
    currency:"BGN (лв)",languages:["Bulgarian"],eu:true,schengen:true,passportRank:6,
    avgSalary:"BGN 20,000",costOfLiving:"Very Low",climate:"Continental/Mediterranean",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"10% flat",healthcare:7.2,safety:8.2,education:8.0,
    digitalNomad:true,startupScore:6.5,familyFriendly:7.8,retirementFriendly:8.0,
    visas:["Work Permit","Student","Family Reunification","Business","Investor","Long-stay D Visa"],
    pros:["Very low cost of living","10% flat tax","Black Sea coast","5-year standard citizenship path"],
    cons:["Bulgarian (Cyrillic script) language barrier","Corruption perceptions","Healthcare quality"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on extended residence permits, stable income, accommodation",notes:"Standard EU-style route"},
      {name:"EU Long-Term Resident Permit",years:5,type:"eu",requirements:"5 years continuous legal residence, stable income, health insurance",notes:"Portable EU-wide status"},
      {name:"EU/EEA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EU treaty rights",notes:"Standard EU provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous permanent residence, Bulgarian language proof, stable livelihood — dual citizenship broadly tolerated",notes:"One of the more accessible standard timelines in EU"},
      {name:"Bulgarian Ethnic Descent — Zero Residency",years:0,type:"heritage",requirements:"Proof of Bulgarian ethnic origin (at least one ancestor was Bulgarian) — NO residency required",notes:"Major route for ethnic Bulgarians from Moldova, Ukraine, North Macedonia, Serbia"},
      {name:"Marriage to Bulgarian Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Reduced from standard 5 years"},
      {name:"Investment Fast Track (Discontinued 2022)",years:1,type:"investment",requirements:"Previously offered expedited citizenship for large investment — abolished in 2022 following EU action",notes:"Historic route now closed"},
      {name:"Bulgarian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Bulgarian at time of birth, dual citizenship tolerated",notes:"No residency requirement"},
    ]
  },
  {
    id:"RS",name:"Serbia",flag:"🇷🇸",capital:"Belgrade",population:"6.9M",gdp:"$66B",
    currency:"RSD (din)",languages:["Serbian"],eu:false,schengen:false,passportRank:38,
    avgSalary:"€15,000",costOfLiving:"Very Low",climate:"Continental",prYears:3,citizenshipYears:3,
    dualCitizenship:true,taxRate:"10–15%",healthcare:7.5,safety:8.0,education:7.5,
    digitalNomad:true,startupScore:7.0,familyFriendly:7.8,retirementFriendly:7.5,
    visas:["Work Permit","Digital Nomad (emerging)","Student","Family Reunification","Business","Self-Employed","Investor"],
    pros:["Fastest citizenship in Europe (3 years)","Very low cost of living","Vibrant Belgrade","Dual citizenship allowed"],
    cons:["Not EU/Schengen","Weaker passport (38th)","Limited healthcare quality","EU accession uncertain timeline"],
    prPathways:[
      {name:"Permanent Residence Permit",years:3,type:"residence",requirements:"3 years continuous legal residence on temporary permits, stable income, accommodation proof",notes:"Among fastest PR timelines in Europe"},
      {name:"Marriage to Serbian Citizen",years:1,type:"family",requirements:"1 year of marriage with cohabitation can qualify for accelerated permanent residence",notes:"Significant acceleration via family ties"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:3,type:"residence",requirements:"3 years continuous legal residence with permanent residence status, basic Serbian language, source of income — dual citizenship broadly allowed",notes:"Among fastest standard naturalization timelines in Europe"},
      {name:"Marriage to Serbian Citizen",years:0,type:"family",requirements:"No fixed minimum residency for spouses of Serbian citizens — can apply after marriage registration",notes:"Very accessible spousal route"},
      {name:"Serbian Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Serbian origin can acquire citizenship without residency via declaration to diplomatic missions",notes:"Major route for Serbian diaspora in Western Europe, USA, Australia"},
      {name:"Serbian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Serbian at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"ME",name:"Montenegro",flag:"🇲🇪",capital:"Podgorica",population:"622K",gdp:"$6.8B",
    currency:"Euro (€)",languages:["Montenegrin"],eu:false,schengen:false,passportRank:44,
    avgSalary:"€13,000",costOfLiving:"Low",climate:"Mediterranean/Continental",prYears:5,citizenshipYears:10,
    dualCitizenship:true,taxRate:"9–15%",healthcare:7.0,safety:8.5,education:7.5,
    digitalNomad:false,startupScore:5.5,familyFriendly:7.5,retirementFriendly:8.0,
    visas:["Work Permit","Student","Family Reunification","Investment Residency","Business","Long-Stay Visa"],
    pros:["Beautiful Adriatic coastline","Low cost of living","Dual citizenship allowed","NATO member"],
    cons:["Not EU/Schengen","Weaker passport","Long citizenship path (10 yrs)","Tourism-dependent economy"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, stable income, accommodation proof",notes:"Standard route"},
      {name:"Real Estate Investment Residency",years:5,type:"investment",requirements:"Property ownership provides residency basis; 5-year continuous residence still required for permanent status",notes:"Property eases initial entry but doesn't shorten the PR timeline"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years continuous legal residence, Montenegrin language, renunciation of prior citizenship generally required",notes:"Long standard timeline"},
      {name:"Citizenship by Investment (2019-2022 — Closed)",years:0,type:"investment",requirements:"Former 'golden passport' program (real estate €250,000-€450,000 + donation €100,000) — officially ended December 2022",notes:"Historic route now closed — no new applications accepted"},
      {name:"Marriage to Montenegrin Citizen",years:3,type:"family",requirements:"3 years of marriage with residence — significant reduction from standard 10 years",notes:"Major reduction for spouses"},
      {name:"Montenegrin Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Montenegrin ethnic origin with documented ancestry may access simplified naturalization",notes:"Heritage-based route for diaspora"},
      {name:"Montenegrin Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Montenegrin at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"AL",name:"Albania",flag:"🇦🇱",capital:"Tirana",population:"2.9M",gdp:"$18B",
    currency:"ALL (L)",languages:["Albanian"],eu:false,schengen:false,passportRank:50,
    avgSalary:"€8,000",costOfLiving:"Very Low",climate:"Mediterranean/Continental",prYears:5,citizenshipYears:5,
    dualCitizenship:true,taxRate:"15–23%",healthcare:6.5,safety:7.5,education:7.0,
    digitalNomad:false,startupScore:5.0,familyFriendly:7.5,retirementFriendly:7.0,
    visas:["Work Permit","Student","Family Reunification","Business","Investor","Long-stay Visa"],
    pros:["Very affordable","Adriatic & Ionian coast","Dual citizenship allowed","5-year standard citizenship path"],
    cons:["Not EU/Schengen","Weak passport","Limited healthcare","Organized crime perception"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, accommodation, basic Albanian",notes:"Standard route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous legal residence, basic Albanian language, source of income — dual citizenship broadly allowed",notes:"Relatively fast and accessible standard route"},
      {name:"Marriage to Albanian Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Reduced timeline for spouses"},
      {name:"Albanian Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Albanian ethnic origin (large communities in Kosovo, North Macedonia, Montenegro, Greek Epirus) can access simplified naturalization",notes:"Significant given Albanian populations across the Balkans"},
      {name:"Exceptional Merit (Presidential Decree)",years:0,type:"special",requirements:"Citizenship granted at presidential discretion for merit to Albania",notes:"Discretionary, rare"},
      {name:"Albanian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Albanian at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"MK",name:"North Macedonia",flag:"🇲🇰",capital:"Skopje",population:"2.1M",gdp:"$14B",
    currency:"MKD (ден)",languages:["Macedonian","Albanian"],eu:false,schengen:false,passportRank:49,
    avgSalary:"€8,000",costOfLiving:"Very Low",climate:"Continental",prYears:5,citizenshipYears:8,
    dualCitizenship:true,taxRate:"10% flat",healthcare:7.0,safety:8.0,education:7.5,
    digitalNomad:false,startupScore:5.5,familyFriendly:7.8,retirementFriendly:7.5,
    visas:["Work Permit","Student","Family Reunification","Business","Investor"],
    pros:["Very low cost of living","10% flat tax","Dual citizenship allowed"],
    cons:["Not EU/Schengen","Weak passport","Political instability history","Macedonian language barrier"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, stable income, basic Macedonian",notes:"Standard route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence, basic Macedonian language, source of income — dual citizenship broadly permitted",notes:"Standard route"},
      {name:"Marriage to Macedonian Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Significant reduction for spouses"},
      {name:"Macedonian Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Macedonian ethnic origin or descent (diaspora in Australia, Canada, USA, Germany) can access simplified naturalization",notes:"Heritage-based route"},
      {name:"Macedonian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is North Macedonian at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"IS",name:"Iceland",flag:"🇮🇸",capital:"Reykjavik",population:"376K",gdp:"$28B",
    currency:"ISK (kr)",languages:["Icelandic"],eu:false,schengen:true,passportRank:6,
    avgSalary:"ISK 750,000/mo",costOfLiving:"Very High",climate:"Subarctic",prYears:4,citizenshipYears:7,
    dualCitizenship:true,taxRate:"22.5–46.3%",healthcare:9.5,safety:9.9,education:9.5,
    digitalNomad:true,startupScore:8.0,familyFriendly:9.8,retirementFriendly:8.5,
    visas:["Work Permit","Student","Family Reunification","Self-Employed","Research","Long-Term Visa"],
    pros:["Safest country on earth","Universal healthcare","Gender equality leader","Dual citizenship allowed since 2003"],
    cons:["Very expensive","Icelandic language barrier","Isolated island nation","Very cold and dark winters"],
    prPathways:[
      {name:"Permanent Residence Permit",years:4,type:"residence",requirements:"4 years continuous legal residence on work/residence permits, completed Icelandic language courses, stable income",notes:"Standard route — slightly faster than many EU peers"},
      {name:"Nordic Citizens",years:0,type:"treaty",requirements:"Citizens of Denmark, Finland, Norway, Sweden have free movement and residence rights under Nordic Passport Union",notes:"Automatic right under Nordic cooperation agreements"},
      {name:"EEA/EFTA Citizens",years:5,type:"eu",requirements:"5 years continuous legal residence exercising EEA treaty rights",notes:"Standard EEA provision"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:7,type:"residence",requirements:"7 years continuous legal residence, Icelandic A2 language test, financial self-sufficiency — dual citizenship allowed since 2003",notes:"Standard route"},
      {name:"Nordic Citizens Reduced",years:4,type:"treaty",requirements:"4 years residence for citizens of Denmark, Finland, Norway, Sweden via simplified process",notes:"Reduced from standard 7 years reflecting Nordic cooperation"},
      {name:"Spouse of Icelandic Citizen",years:4,type:"family",requirements:"4 years of marriage/cohabitation with Icelandic citizen plus residence, Icelandic language test",notes:"Reduced from standard 7 years"},
      {name:"Parliamentary Citizenship Act",years:0,type:"special",requirements:"Iceland's Althingi can grant citizenship directly to specific individuals via legislation",notes:"Rare, discretionary parliamentary route"},
      {name:"Icelandic Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Icelandic at time of birth — dual citizenship allowed since 2003",notes:"No residency requirement"},
    ]
  },
  {
    id:"LI",name:"Liechtenstein",flag:"🇱🇮",capital:"Vaduz",population:"39K",gdp:"$7.3B",
    currency:"CHF (₣)",languages:["German"],eu:false,schengen:true,passportRank:6,
    avgSalary:"CHF 80,000",costOfLiving:"Very High",climate:"Alpine",prYears:5,citizenshipYears:30,
    dualCitizenship:true,taxRate:"1.2–17.8%",healthcare:9.5,safety:9.9,education:9.5,
    digitalNomad:false,startupScore:7.5,familyFriendly:9.5,retirementFriendly:9.2,
    visas:["Work Permit (quota-limited)","Family Reunification","Investment Residency"],
    pros:["Lowest taxes in Europe (1.2%)","World's highest GDP per capita","Safest country per capita","Financial center"],
    cons:["30-year citizenship path (Europe's longest)","Extremely limited immigration quota system","German required"],
    prPathways:[
      {name:"C Permit (Standard — Quota Based)",years:5,type:"residence",requirements:"5 years continuous B Permit residence PLUS available quota — annual quota system severely limits immigration",notes:"The quota is the main barrier, not the timeline"},
      {name:"EEA Citizens (Quota-Based)",years:5,type:"eu",requirements:"Even EEA citizens face annual quotas for new permits",notes:"Unusually restrictive even for EEA nationals — permanent EEA opt-out on free movement"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:30,type:"residence",requirements:"30 years continuous residence (longest in Europe), German language, MUNICIPAL CITIZENS' ASSEMBLY VOTE required, dual citizenship allowed",notes:"Requires approval at federal + communal level including a democratic vote by existing citizens"},
      {name:"Born/Raised Reduction",years:15,type:"special",requirements:"Time can be partially halved for those born in Liechtenstein or who attended school there for 5+ years",notes:"Significant reduction for those who grew up in the principality"},
      {name:"Marriage to Liechtenstein Citizen",years:0,type:"family",requirements:"Foreign spouses can acquire citizenship via facilitated process — specific residency still expected",notes:"Facilitated but not instant"},
      {name:"Liechtenstein Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Liechtenstein citizen at time of birth",notes:"No residency requirement — dominant route given tiny native population"},
    ]
  },
  {
    id:"MC",name:"Monaco",flag:"🇲🇨",capital:"Monaco",population:"39K",gdp:"$7.8B",
    currency:"Euro (€)",languages:["French"],eu:false,schengen:true,passportRank:6,
    avgSalary:"€100,000+",costOfLiving:"Extreme",climate:"Mediterranean",prYears:5,citizenshipYears:10,
    dualCitizenship:false,taxRate:"No income tax",healthcare:9.8,safety:9.9,education:9.2,
    digitalNomad:false,startupScore:8.0,familyFriendly:9.0,retirementFriendly:10.0,
    visas:["Residency Permit (wealth-based)","Business Residency","Family Reunification"],
    pros:["Zero personal income tax","World's most secure country per capita","Perfect Mediterranean climate"],
    cons:["Most expensive place on earth","Wealth gatekeeping","No dual citizenship for naturalized citizens","Very rare naturalizations"],
    prPathways:[
      {name:"Ordinary Resident Card",years:3,type:"wealth",requirements:"Initial 1-year temporary card, then 3-year 'ordinary' resident cards; proof of accommodation and sufficient financial means",notes:"Residency achievable for those with financial means — barrier is financial, not time-based"},
      {name:"Privileged Resident Card",years:10,type:"wealth",requirements:"After ~10 years continuous ordinary residency, eligible for longer-duration 'privileged resident' card",notes:"Enhanced long-term status — not equivalent to citizenship"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization (Prince's Decree)",years:10,type:"special",requirements:"10 years minimum residency (often longer in practice), French fluency, renunciation of prior nationality, Sovereign Prince's PERSONAL DECREE required",notes:"Entirely discretionary — handful per year. No right to naturalize even after qualifying."},
      {name:"Marriage to Monégasque National",years:0,type:"family",requirements:"Foreign spouses may acquire nationality by declaration — still rare and governmental approval required",notes:"Marriage alone does not guarantee citizenship"},
      {name:"Monégasque Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if a parent is Monégasque at time of birth — by far the most common path",notes:"No residency requirement"},
      {name:"Born in Monaco",years:0,type:"birthright",requirements:"Birth in Monaco alone does NOT confer citizenship — no jus soli provision exists",notes:"Important distinction"},
    ]
  },
  {
    id:"AD",name:"Andorra",flag:"🇦🇩",capital:"Andorra la Vella",population:"77K",gdp:"$3.3B",
    currency:"Euro (€)",languages:["Catalan"],eu:false,schengen:false,passportRank:16,
    avgSalary:"€30,000",costOfLiving:"Medium",climate:"Alpine",prYears:3,citizenshipYears:20,
    dualCitizenship:true,taxRate:"0–10%",healthcare:9.0,safety:9.9,education:8.5,
    digitalNomad:true,startupScore:7.0,familyFriendly:9.2,retirementFriendly:9.5,
    visas:["Active Residency","Passive Residency","Investment Residency","Digital Nomad (Telework Residency)","Family Reunification"],
    pros:["0–10% tax rate","PR in just 3 years","Safest country globally","Digital nomad residency program"],
    cons:["20-year citizenship path","Not in EU/Schengen","Tiny country with limited opportunities","Catalan language"],
    prPathways:[
      {name:"Passive Residency",years:3,type:"passive",requirements:"Investment of ~€600,000 in Andorran assets, proof of sufficient income (~€38,000+/year), minimum 90 days physical presence per year",notes:"Popular with retirees — very low physical presence requirement"},
      {name:"Active Residency (Work/Business)",years:3,type:"residence",requirements:"3 years residence while employed or running a business, full-time physical presence required (183+ days/year)",notes:"For those actually working in Andorra"},
      {name:"Telework / Digital Nomad Residency",years:3,type:"digital",requirements:"Proof of remote employment for non-Andorran company, minimum income threshold, deposit requirement, 90-day minimum presence",notes:"Formalizes remote work residency"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:20,type:"residence",requirements:"20 years continuous legal residence, Catalan language proficiency, renunciation generally required",notes:"Among the longest in the world"},
      {name:"Born in Andorra (Modified Jus Soli)",years:0,type:"birthright",requirements:"Born in Andorra to foreign resident parents — can opt for Andorran nationality upon reaching majority if continuously resident",notes:"Must elect Andorran nationality actively upon turning 18"},
      {name:"Marriage to Andorran Citizen",years:3,type:"family",requirements:"3 years of marriage with residence — significantly reduced from 20-year standard",notes:"Major reduction for spouses"},
      {name:"Andorran Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Andorran at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"SM",name:"San Marino",flag:"🇸🇲",capital:"San Marino City",population:"34K",gdp:"$1.7B",
    currency:"Euro (€)",languages:["Italian"],eu:false,schengen:false,passportRank:24,
    avgSalary:"€30,000",costOfLiving:"Medium",climate:"Mediterranean",prYears:3,citizenshipYears:30,
    dualCitizenship:true,taxRate:"9–35%",healthcare:8.8,safety:9.8,education:8.5,
    digitalNomad:false,startupScore:6.5,familyFriendly:9.0,retirementFriendly:9.0,
    visas:["Work Permit","Residency Permit","Family Reunification","Business Residency"],
    pros:["Fast PR (3 years)","Very safe","World's oldest republic","Dual citizenship allowed"],
    cons:["30-year citizenship path (tied for Europe's longest)","Not in EU/Schengen","Tiny economy"],
    prPathways:[
      {name:"Residence Permit (Standard)",years:3,type:"residence",requirements:"3 years continuous legal residence on temporary permits, Italian language, registered employment or self-sufficiency proof",notes:"Fast standard timeline"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:30,type:"residence",requirements:"30 years continuous legal residence (tied with Liechtenstein for longest in Europe), Italian language — dual citizenship allowed",notes:"Extremely long timeline reflecting San Marino's desire to limit citizenship"},
      {name:"Marriage to Sammarinese Citizen",years:15,type:"family",requirements:"15 years of marriage with residence — still long, but half the standard 30-year requirement",notes:"Significant but still lengthy reduction"},
      {name:"Parliamentary Decree (Exceptional)",years:0,type:"special",requirements:"The Grand and General Council can grant citizenship by special decree for exceptional merit",notes:"Extremely rare"},
      {name:"Sammarinese Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Sammarinese at time of birth — dual citizenship allowed",notes:"No residency requirement — dominant route given tiny native population"},
    ]
  },
  {
    id:"VA",name:"Vatican City",flag:"🇻🇦",capital:"Vatican City",population:"800",gdp:"N/A",
    currency:"Euro (€)",languages:["Latin","Italian"],eu:false,schengen:false,passportRank:1,
    avgSalary:"N/A",costOfLiving:"N/A",climate:"Mediterranean",prYears:999,citizenshipYears:999,
    dualCitizenship:false,taxRate:"No income tax",healthcare:9.0,safety:9.9,education:9.0,
    digitalNomad:false,startupScore:1.0,familyFriendly:5.0,retirementFriendly:5.0,
    visas:["By appointment only (clergy/staff)"],
    pros:["World's smallest country","Unique diplomatic status","Tax-free","Historical and religious significance"],
    cons:["No immigration pathway for general public","Not in EU/Schengen","Citizenship only for Catholic clergy and staff"],
    prPathways:[
      {name:"No Standard PR Pathway",years:999,type:"special",requirements:"Vatican City has no concept of permanent residency for general public — all residence is functional/official",notes:"Not an option for ordinary individuals under any circumstance"},
    ],
    citizenshipPathways:[
      {name:"Functional Citizenship (Office-Tied)",years:0,type:"special",requirements:"Granted only to: Cardinals resident in Vatican or Rome, diplomatic staff of Holy See, persons residing for reasons of office or service",notes:"Unique 'functional' citizenship model — based on role, not residency duration"},
      {name:"Citizenship Ceases Upon Leaving Service",years:0,type:"special",requirements:"Vatican citizenship automatically ceases when the qualifying office/employment ends",notes:"Vatican citizens always retain another nationality"},
      {name:"No Birthright or Descent Citizenship",years:0,type:"special",requirements:"Children born in Vatican City do NOT acquire Vatican citizenship; no jus sanguinis either",notes:"Vatican deliberately has no permanent citizen population by design"},
    ]
  },
  {
    id:"UA",name:"Ukraine",flag:"🇺🇦",capital:"Kyiv",population:"43M",gdp:"$160B",
    currency:"UAH (₴)",languages:["Ukrainian"],eu:false,schengen:false,passportRank:32,
    avgSalary:"€8,000",costOfLiving:"Very Low",climate:"Continental",prYears:5,citizenshipYears:5,
    dualCitizenship:false,taxRate:"5–18%",healthcare:6.5,safety:4.0,education:7.5,
    digitalNomad:false,startupScore:7.5,familyFriendly:6.0,retirementFriendly:4.0,
    visas:["Work Permit","Student","Family Reunification","Business","Investor","IT Specialist Permit"],
    pros:["EU candidate status","Strong IT/tech sector","Low cost of living","2024 dual citizenship reform (partial)","Ancestral routes for diaspora"],
    cons:["Ongoing war (critical safety concern)","Infrastructure disruption","No standard dual citizenship","Economic instability","Very weak passport"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence, stable income, Ukrainian language — wartime conditions significantly affect processing",notes:"Verify current administrative status given the ongoing conflict"},
      {name:"Immediate Family of Ukrainian Citizens",years:2,type:"family",requirements:"2 years residence as spouse/parent/child of Ukrainian citizen",notes:"Reduced from standard 5 years"},
      {name:"Foreign Investors",years:3,type:"investment",requirements:"3 years residence with investment in Ukrainian economy (~$100,000 threshold historically)",notes:"Investment-based reduction"},
      {name:"Ethnic Ukrainians / Repatriates",years:0,type:"heritage",requirements:"Persons of Ukrainian ethnic origin can qualify for simplified immigrant status without standard 5-year wait",notes:"Heritage-based simplified route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:5,type:"residence",requirements:"5 years continuous legal residence, Ukrainian language, renunciation required — 2024 law began allowing dual nationality for EU/NATO partner country citizens",notes:"Evolving dual citizenship rules — 2024 reform a significant change"},
      {name:"Ethnic Ukrainian Descent",years:0,type:"heritage",requirements:"Persons who can prove Ukrainian ethnic origin or ancestors were citizens of former Ukrainian SSR or UNR can acquire citizenship without standard residency",notes:"Important route for the global Ukrainian diaspora"},
      {name:"Marriage to Ukrainian Citizen",years:2,type:"family",requirements:"2 years of marriage with residence",notes:"Reduced from standard 5 years"},
      {name:"Ukrainian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Ukrainian at time of birth",notes:"No residency requirement"},
      {name:"Special Merit (Presidential Decree)",years:0,type:"special",requirements:"Granted for exceptional services to Ukraine — used for foreign volunteers/fighters during current conflict",notes:"Discretionary — used notably during the war"},
    ]
  },
  {
    id:"BY",name:"Belarus",flag:"🇧🇾",capital:"Minsk",population:"9.4M",gdp:"$73B",
    currency:"BYN (Br)",languages:["Belarusian","Russian"],eu:false,schengen:false,passportRank:72,
    avgSalary:"€7,000",costOfLiving:"Very Low",climate:"Continental",prYears:7,citizenshipYears:7,
    dualCitizenship:false,taxRate:"13–16%",healthcare:7.0,safety:5.0,education:7.0,
    digitalNomad:false,startupScore:4.0,familyFriendly:6.0,retirementFriendly:4.0,
    visas:["Work Permit","Student","Family Reunification","Business (limited)"],
    pros:["Low cost of living","Historical Minsk architecture"],
    cons:["Authoritarian government","International sanctions","Not EU/Schengen","Very weak passport","No dual citizenship","Political risk"],
    prPathways:[
      {name:"Permanent Residence Permit",years:7,type:"residence",requirements:"7 years continuous legal residence, stable income, Belarusian or Russian language, registration with local authorities",notes:"Long standard timeline — immigration is limited and political environment creates uncertainty"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:7,type:"residence",requirements:"7 years continuous legal residence, Belarusian or Russian language, legal income, renunciation of prior citizenship required",notes:"Strict single-nationality policy"},
      {name:"Ethnic Belarusian / Repatriation",years:0,type:"heritage",requirements:"Some provisions for ethnic Belarusians or descendants of emigrants — simplified procedures less formalized than EU equivalents",notes:"Less developed diaspora repatriation framework than EU neighbors"},
      {name:"Belarusian Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Belarusian at time of birth",notes:"No residency requirement"},
    ]
  },
  {
    id:"MD",name:"Moldova",flag:"🇲🇩",capital:"Chișinău",population:"2.5M",gdp:"$14B",
    currency:"MDL (L)",languages:["Romanian/Moldovan"],eu:false,schengen:false,passportRank:46,
    avgSalary:"€6,000",costOfLiving:"Very Low",climate:"Continental",prYears:3,citizenshipYears:10,
    dualCitizenship:true,taxRate:"12–18%",healthcare:6.5,safety:7.5,education:7.5,
    digitalNomad:false,startupScore:5.5,familyFriendly:7.0,retirementFriendly:6.5,
    visas:["Work Permit","Student","Family Reunification","Investment Residency","Business"],
    pros:["Fast PR (3 years)","Dual citizenship allowed","Romanian ancestry = EU citizenship pathway","Very affordable"],
    cons:["Not EU/Schengen","Very weak passport","Limited economy","Transnistria unresolved conflict"],
    prPathways:[
      {name:"Permanent Residence Permit",years:3,type:"residence",requirements:"3 years continuous legal residence, stable income, accommodation, basic Romanian/Moldovan language",notes:"Fast timeline for the region"},
      {name:"Marriage to Moldovan Citizen",years:1,type:"family",requirements:"1 year of marriage with cohabitation — accelerated residency status",notes:"Significant acceleration via family ties"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:10,type:"residence",requirements:"10 years continuous legal residence, Romanian/Moldovan language, dual citizenship broadly permitted",notes:"Long standard route — most Moldovans prefer the Romanian ancestry route below"},
      {name:"Romanian Citizenship by Descent (The Key Route)",years:0,type:"heritage",requirements:"Most Moldovans qualify for Romanian citizenship by descent (parents/grandparents were Romanian citizens before 1940 Soviet annexation) — grants automatic EU citizenship, NO Moldovan residency required",notes:"By far the most popular pathway — hundreds of thousands have used this to gain EU citizenship"},
      {name:"Marriage to Moldovan Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Reduced from standard 10 years"},
      {name:"Moldovan Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is Moldovan at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"BA",name:"Bosnia & Herzegovina",flag:"🇧🇦",capital:"Sarajevo",population:"3.3M",gdp:"$23B",
    currency:"BAM (KM)",languages:["Bosnian","Croatian","Serbian"],eu:false,schengen:false,passportRank:60,
    avgSalary:"€10,000",costOfLiving:"Very Low",climate:"Continental/Mediterranean",prYears:5,citizenshipYears:8,
    dualCitizenship:true,taxRate:"10% flat",healthcare:7.0,safety:8.0,education:7.5,
    digitalNomad:false,startupScore:5.5,familyFriendly:7.5,retirementFriendly:7.0,
    visas:["Work Permit","Student","Family Reunification","Business","Investment Residency"],
    pros:["Very cheap","Dual citizenship allowed","Beautiful mountains","Sarajevo multicultural heritage"],
    cons:["Not EU/Schengen","Weak passport","Complex Dayton entity governance","Slow EU accession"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, stable income, basic Bosnian/Croatian/Serbian",notes:"Standard route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence, language proficiency, source of income — dual citizenship broadly permitted",notes:"Reductions to 5 years discussed in pending reforms"},
      {name:"Marriage to BiH Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Significant reduction for spouses"},
      {name:"Bosnian Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Bosnian origin (large diaspora following 1990s war) can access simplified naturalization based on proof of origin",notes:"Important heritage-based route given the large wartime diaspora"},
      {name:"Returnees Under Dayton Agreement",years:0,type:"special",requirements:"Persons displaced during the 1992-1995 conflict and their descendants have specific provisions for re-establishing citizenship",notes:"Post-conflict restitution framework"},
      {name:"BiH Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is a BiH citizen at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
  {
    id:"XK",name:"Kosovo",flag:"🇽🇰",capital:"Pristina",population:"1.8M",gdp:"$9.5B",
    currency:"Euro (€)",languages:["Albanian","Serbian"],eu:false,schengen:false,passportRank:97,
    avgSalary:"€9,000",costOfLiving:"Very Low",climate:"Continental",prYears:5,citizenshipYears:8,
    dualCitizenship:true,taxRate:"0–10%",healthcare:6.5,safety:7.5,education:7.0,
    digitalNomad:false,startupScore:5.0,familyFriendly:7.0,retirementFriendly:6.0,
    visas:["Work Permit","Student","Family Reunification","Business","Investor"],
    pros:["Very affordable","Uses Euro currency","Dual citizenship allowed","Young developing economy"],
    cons:["One of world's weakest passports (97th)","Limited international recognition","Not EU/Schengen","Very weak economy"],
    prPathways:[
      {name:"Permanent Residence Permit",years:5,type:"residence",requirements:"5 years continuous legal residence on temporary permits, stable income, basic Albanian or Serbian",notes:"Standard route"},
    ],
    citizenshipPathways:[
      {name:"Standard Naturalization",years:8,type:"residence",requirements:"8 years continuous legal residence, language proficiency (Albanian or Serbian), source of income — dual citizenship broadly permitted",notes:"Limited international recognition of Kosovo affects how some countries treat Kosovan citizenship"},
      {name:"Marriage to Kosovo Citizen",years:3,type:"family",requirements:"3 years of marriage with residence",notes:"Significant reduction for spouses"},
      {name:"Albanian Descent / Diaspora",years:0,type:"heritage",requirements:"Persons of Albanian ethnic origin (large Kosovo-Albanian diaspora across Western Europe) may access simplified naturalization",notes:"Significant given Kosovo's overwhelmingly ethnic-Albanian population"},
      {name:"Kosovo Parent Descent",years:0,type:"heritage",requirements:"Automatic citizenship if at least one parent is a Kosovo citizen at time of birth, dual citizenship allowed",notes:"No residency requirement"},
    ]
  },
];

// ─────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────
function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const handler = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((path) => {
    window.location.hash = path;
    window.scrollTo(0,0);
  }, []);
  return { hash, navigate };
}

// Pathway type keys that can be deep-linked as anchors, e.g. #/pathways/IT/heritage
const ANCHOR_TYPES = ["residence","skilled","business","investment","family","heritage","eu","humanitarian","birthright","special","adoption","treaty","integration","passive","digital","wealth","regularization","research"];

function parseRoute(hash) {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/" || path === "") return { page: "home" };
  if (path === "/compare") return { page: "compare" };
  const m = path.match(/^\/country\/([A-Z]{2}|XK)$/);
  if (m) return { page: "country", id: m[1] };
  // #/pathways/IT/heritage  -> deep link to a specific pathway type section
  const p2 = path.match(/^\/pathways\/([A-Z]{2}|XK)\/([a-z]+)$/);
  if (p2 && ANCHOR_TYPES.includes(p2[2])) return { page: "pathways", id: p2[1], anchor: p2[2] };
  const p = path.match(/^\/pathways\/([A-Z]{2}|XK)$/);
  if (p) return { page: "pathways", id: p[1] };
  return { page: "home" };
}


// ─────────────────────────────────────────────────────────────
// DESIGN COMPONENTS
// ─────────────────────────────────────────────────────────────
function Chip({ children, color = T.primary }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      display: "inline-block", lineHeight: "20px"
    }}>{children}</span>
  );
}

function Bar({ value, max = 10, color = T.primary }) {
  return (
    <div style={{ background: "#1a2840", borderRadius: 99, height: 5, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min((value/max)*100,100)}%`, height: "100%",
        background: color, borderRadius: 99, transition: "width .7s ease"
      }}/>
    </div>
  );
}

function StatBox({ label, value, color = T.text, sub }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "14px 16px"
    }}>
      <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: .6, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function NavBar({ navigate, compareCount }) {
  return (
    <nav style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      position: "sticky", top: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", height: 56
    }}>
      <div
        onClick={() => navigate("#/")}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
      >
        <span style={{ fontSize: 22 }}>🌍</span>
        <span style={{ fontWeight: 900, fontSize: 17, color: T.text, letterSpacing: -.3 }}>EuroPath</span>
        <span style={{
          background: T.primaryGlow, color: T.primary,
          borderRadius: 6, padding: "1px 8px", fontSize: 9, fontWeight: 800, letterSpacing: .8, textTransform: "uppercase"
        }}>PR & CITIZENSHIP</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["#/","🗺 Explorer"],["#/compare",`⚖ Compare${compareCount>0?` (${compareCount})`:""}`]].map(([h,l])=>(
          <button key={h} onClick={() => navigate(h)} style={{
            background: window.location.hash===h ? T.primary : "transparent",
            color: window.location.hash===h ? "#fff" : T.subtle,
            border: `1px solid ${window.location.hash===h ? T.primary : T.border}`,
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 12, fontWeight: 700, transition: "all .2s"
          }}>{l}</button>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG BUBBLE MAP
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Minimal TopoJSON → GeoJSON conversion (avoids needing the topojson-client
// package, which isn't part of the guaranteed artifact library set).
// Implements just enough of the spec — arc decoding, delta-decoding,
// quantization transform, and Polygon/MultiPolygon assembly — to render
// country borders from a standard world-atlas TopoJSON file.
// ─────────────────────────────────────────────────────────────
function topojsonFeatures(topology, objectName) {
  const { arcs: rawArcs, transform } = topology;
  const { scale, translate } = transform || { scale: [1, 1], translate: [0, 0] };

  // Decode every arc once: TopoJSON arcs are delta-encoded integer coordinates
  const arcs = rawArcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });

  function arcCoords(arcIndex) {
    const i = arcIndex < 0 ? ~arcIndex : arcIndex;
    const coords = arcs[i];
    return arcIndex < 0 ? coords.slice().reverse() : coords;
  }

  function ring(arcIndexes) {
    let pts = [];
    arcIndexes.forEach((ai, idx) => {
      const coords = arcCoords(ai);
      pts = idx === 0 ? pts.concat(coords) : pts.concat(coords.slice(1));
    });
    return pts;
  }

  function geometryToGeoJSON(geom) {
    if (geom.type === "Polygon") {
      return { type: "Polygon", coordinates: geom.arcs.map(ring) };
    }
    if (geom.type === "MultiPolygon") {
      return { type: "MultiPolygon", coordinates: geom.arcs.map(poly => poly.map(ring)) };
    }
    return null;
  }

  const obj = topology.objects[objectName];
  return obj.geometries.map(g => ({
    type: "Feature",
    id: g.id,
    properties: g.properties || {},
    geometry: geometryToGeoJSON(g)
  })).filter(f => f.geometry);
}


// the standard Natural Earth / world-atlas TopoJSON (ne_110m / ne_50m admin-0).
const ISO_NUMERIC = {
  DE:"276",FR:"250",PT:"620",ES:"724",IT:"380",NL:"528",CH:"756",SE:"752",NO:"578",DK:"208",
  FI:"246",IE:"372",GB:"826",AT:"040",BE:"056",LU:"442",GR:"300",PL:"616",CZ:"203",MT:"470",
  CY:"196",HR:"191",EE:"233",LV:"428",LT:"440",SI:"705",SK:"703",HU:"348",RO:"642",BG:"100",
  RS:"688",ME:"499",AL:"008",MK:"807",IS:"352",LI:"438",MC:"492",AD:"020",SM:"674",VA:"336",
  UA:"804",BY:"112",MD:"498",BA:"070",XK:"-99"
};

// Lightweight client-side cache so the (sizeable) TopoJSON is fetched once per session
let _topoCache = null;
let _topoPromise = null;
function loadEuropeTopology() {
  if (_topoCache) return Promise.resolve(_topoCache);
  if (_topoPromise) return _topoPromise;
  _topoPromise = fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
    .then(r => { if (!r.ok) throw new Error("fetch failed"); return r.json(); })
    .then(topo => { _topoCache = topo; return topo; });
  return _topoPromise;
}

// ─────────────────────────────────────────────────────────────
// REAL POLITICAL MAP (actual country borders via d3-geo + TopoJSON)
// Falls back to the bubble grid below if the boundary data can't load
// (e.g. no network) so the explorer always renders something useful.
// ─────────────────────────────────────────────────────────────
function PoliticalMap({ countries, hoveredId, onHover, onSelect, filteredIds }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [paths, setPaths] = useState(null); // { id: { d, cx, cy } }

  useEffect(() => {
    let cancelled = false;
    loadEuropeTopology().then(topo => {
      if (cancelled) return;
      const objectKey = Object.keys(topo.objects)[0];
      const features = topojsonFeatures(topo, objectKey);

      // Build a reverse lookup: numeric ISO id -> our country code
      const numToCode = {};
      Object.entries(ISO_NUMERIC).forEach(([code, num]) => { if (num !== "-99") numToCode[num] = code; });

      // Filter to just Europe-relevant features we can map, project, and turn into path strings
      const relevant = features.filter(f => numToCode[String(f.id).padStart(3,"0")] || numToCode[String(f.id)]);

      const projection = d3.geoMercator()
        .center([15, 53])
        .scale(420)
        .translate([220, 230]);
      const pathGen = d3.geoPath(projection);

      const out = {};
      relevant.forEach(f => {
        const code = numToCode[String(f.id).padStart(3,"0")] || numToCode[String(f.id)];
        if (!code) return;
        const d = pathGen(f);
        const centroid = pathGen.centroid(f);
        if (d) out[code] = { d, cx: centroid[0], cy: centroid[1] };
      });

      if (Object.keys(out).length < 15) throw new Error("too few countries resolved");
      setPaths(out);
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; };
  }, []);

  if (status === "error") {
    // Graceful fallback: the original bubble-grid map
    return <BubbleMap countries={countries} hoveredId={hoveredId} onHover={onHover} onSelect={onSelect} filteredIds={filteredIds}/>;
  }

  if (status === "loading") {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:340, color:T.muted, fontSize:13, gap:10 }}>
        <span style={{
          display:"inline-block", width:16, height:16, border:`2px solid ${T.border}`,
          borderTopColor:T.primary, borderRadius:"50%", animation:"epspin 0.8s linear infinite"
        }}/>
        Loading political map…
        <style>{`@keyframes epspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <svg viewBox="0 0 440 460" style={{ width:"100%", height:"auto", display:"block" }}>
        <rect x="0" y="0" width="440" height="460" fill="#080e1a" rx="10"/>
        {countries.map(c => {
          const geo = paths[c.id];
          if (!geo) return null;
          const active = filteredIds.has(c.id);
          const hov = hoveredId === c.id;
          const color = c.eu ? T.primary : c.schengen ? T.blue : T.subtle;
          return (
            <path
              key={c.id}
              d={geo.d}
              fill={active ? color : T.border}
              fillOpacity={hov ? 1 : active ? 0.75 : 0.35}
              stroke={hov ? "#fff" : "#080e1a"}
              strokeWidth={hov ? 1.4 : 0.6}
              style={{ cursor:"pointer", transition:"fill-opacity .15s, stroke-width .15s" }}
              onMouseEnter={()=>onHover(c.id)}
              onMouseLeave={()=>onHover(null)}
              onClick={()=>onSelect(c)}
            />
          );
        })}
        {/* Microstates are often invisible at this scale — draw a marker dot so they stay clickable */}
        {countries.map(c => {
          const geo = paths[c.id];
          if (!geo) return null;
          const isMicro = ["MC","AD","SM","VA","LI","MT"].includes(c.id);
          if (!isMicro) return null;
          const active = filteredIds.has(c.id);
          const hov = hoveredId === c.id;
          const color = c.eu ? T.primary : c.schengen ? T.blue : T.subtle;
          return (
            <circle key={c.id+"-dot"} cx={geo.cx} cy={geo.cy} r={hov?5:3}
              fill={active ? color : T.border} stroke="#fff" strokeWidth={hov?1.2:0.6}
              opacity={active?1:.6}
              style={{ cursor:"pointer" }}
              onMouseEnter={()=>onHover(c.id)}
              onMouseLeave={()=>onHover(null)}
              onClick={()=>onSelect(c)}
            />
          );
        })}
        {hoveredId && paths[hoveredId] && (() => {
          const c = countries.find(x=>x.id===hoveredId);
          const geo = paths[hoveredId];
          if (!c || !geo) return null;
          return (
            <g style={{ pointerEvents:"none" }}>
              <rect x={Math.min(Math.max(geo.cx-46,2),440-94)} y={Math.max(geo.cy-26,2)} width={92} height={18} rx={5}
                fill="#0f172a" stroke="#334155" strokeWidth={0.6}/>
              <text x={Math.min(Math.max(geo.cx,48),440-48)} y={Math.max(geo.cy-13,14)} textAnchor="middle"
                fontSize={9} fill="#e2e8f0" fontWeight="800">
                {c.flag} {c.name}
              </text>
            </g>
          );
        })()}
      </svg>
      <div style={{ display:"flex", gap:14, marginTop:8, flexWrap:"wrap" }}>
        {[[T.primary,"EU Member"],[T.blue,"Schengen Only"],[T.subtle,"Other"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:T.muted }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
            {l}
          </div>
        ))}
        <div style={{ fontSize:10, color:T.muted, marginLeft:"auto", fontStyle:"italic" }}>
          Boundaries: Natural Earth (public domain) · microstates shown as dots
        </div>
      </div>
    </div>
  );
}

// Original abstract bubble-grid map, kept as the offline-safe fallback
function BubbleMap({ countries, hoveredId, onHover, onSelect, filteredIds }) {
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="260 60 420 390" style={{ width:"100%", height:"auto", display:"block" }}>
        <rect x="260" y="60" width="420" height="390" fill="#080e1a" rx="10"/>
        {[100,150,200,250,300,350,400].map(y=>(
          <line key={y} x1="260" y1={y} x2="680" y2={y} stroke="#1e3050" strokeWidth=".4"/>
        ))}
        {[300,350,400,450,500,550,600,650].map(x=>(
          <line key={x} x1={x} y1="60" x2={x} y2="450" stroke="#1e3050" strokeWidth=".4"/>
        ))}
        {countries.map(c => {
          const pos = MAP_POS[c.id];
          if (!pos) return null;
          const active = filteredIds.has(c.id);
          const hov = hoveredId === c.id;
          const color = c.eu ? T.primary : c.schengen ? T.blue : T.subtle;
          return (
            <g key={c.id} style={{cursor:"pointer"}}
              onMouseEnter={()=>onHover(c.id)}
              onMouseLeave={()=>onHover(null)}
              onClick={()=>onSelect(c)}
            >
              {hov && <circle cx={pos[0]} cy={pos[1]} r={16} fill={color} opacity={.12}/>}
              <circle cx={pos[0]} cy={pos[1]}
                r={hov ? 9 : 6}
                fill={active ? color : T.border}
                opacity={active ? 1 : .35}
                stroke={hov ? "#fff" : "none"}
                strokeWidth={1.5}
                style={{transition:"all .2s"}}
              />
              {hov ? (
                <text x={pos[0]} y={pos[1]-13} textAnchor="middle" fontSize={8.5} fill="#e2e8f0" fontWeight="800">
                  {c.flag} {c.name}
                </text>
              ) : active ? (
                <text x={pos[0]} y={pos[1]+3} textAnchor="middle" fontSize={5.5} fill="#fff" opacity={.7}>
                  {c.id}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={{ display:"flex", gap:14, marginTop:8, flexWrap:"wrap" }}>
        {[[T.primary,"EU Member"],[T.blue,"Schengen Only"],[T.subtle,"Other"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:T.muted }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COUNTRY CARD
// ─────────────────────────────────────────────────────────────
function CountryCard({ c, navigate, compareIds, onCompareToggle }) {
  const [hov, setHov] = useState(false);
  const inCompare = compareIds.has(c.id);
  return (
    <div
      style={{
        background: hov ? `linear-gradient(135deg, #131f35 0%, #0f1a2e 100%)` : T.card,
        border: `1px solid ${hov ? T.primary : T.border}`,
        borderRadius: 14, padding: 18, cursor: "pointer",
        transition: "all .2s", transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 8px 32px ${T.primary}22` : "none",
        display: "flex", flexDirection: "column", gap: 14
      }}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={()=>navigate(`#/country/${c.id}`)}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <span style={{ fontSize:36 }}>{c.flag}</span>
          <div style={{ fontSize:17, fontWeight:800, color:T.text, marginTop:2 }}>{c.name}</div>
          <div style={{ fontSize:11, color:T.muted }}>{c.capital} · {c.population}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
          {c.eu && <Chip color={T.primary}>EU</Chip>}
          {c.schengen && <Chip color={T.blue}>Schengen</Chip>}
          {c.digitalNomad && <Chip color={T.green}>🌐 Nomad</Chip>}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div style={{ background:T.surface, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>PR Eligibility</div>
          <div style={{ fontSize:16, fontWeight:800, color:T.green }}>{c.prYears>=999?"N/A":`${c.prYears} yrs`}</div>
        </div>
        <div style={{ background:T.surface, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>Citizenship</div>
          <div style={{ fontSize:16, fontWeight:800, color:T.primary }}>{c.citizenshipYears>=999?"N/A":`${c.citizenshipYears} yrs`}</div>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[["Safety",c.safety,T.green],["Healthcare",c.healthcare,T.blue],["Education",c.education,T.amber]].map(([l,v,col])=>(
          <div key={l}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:10, color:T.muted }}>{l}</span>
              <span style={{ fontSize:10, color:T.subtle }}>{v}/10</span>
            </div>
            <Bar value={v} color={col}/>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:c.dualCitizenship?T.green:T.red, fontWeight:700 }}>
          {c.dualCitizenship?"✓ Dual OK":"✗ No Dual"}
        </span>
        <span style={{ color:T.border }}>·</span>
        <span style={{ fontSize:11, color:T.subtle }}>{c.taxRate}</span>
      </div>

      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {c.visas.slice(0,3).map(v=>(
          <span key={v} style={{
            background:T.surface, border:`1px solid ${T.border}`,
            borderRadius:6, fontSize:9, color:T.subtle, padding:"2px 7px"
          }}>{v}</span>
        ))}
        {c.visas.length>3&&<span style={{ fontSize:9, color:T.primary, padding:"2px 4px" }}>+{c.visas.length-3}</span>}
      </div>

      <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
        <button
          onClick={e=>{e.stopPropagation();onCompareToggle(c);}}
          style={{
            flex:1, padding:"7px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700,
            background: inCompare ? T.primary : "transparent",
            border:`1px solid ${inCompare ? T.primary : T.border}`,
            color: inCompare ? "#fff" : T.subtle, transition:"all .2s"
          }}
        >{inCompare?"✓ Comparing":"+ Compare"}</button>
        <button
          onClick={e=>{e.stopPropagation();navigate(`#/pathways/${c.id}`);}}
          style={{
            flex:1, padding:"7px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700,
            background:"transparent", border:`1px solid ${T.border}`,
            color:T.primary, transition:"all .2s"
          }}
        >All Pathways</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────
function HomePage({ navigate, compareIds, onCompareToggle }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [filters, setFilters] = useState({ eu:"All", schengen:"All", dual:"All", nomad:"All", pr:"All", cit:"All" });
  const [hoveredId, setHoveredId] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const filtered = useMemo(()=>{
    return COUNTRIES.filter(c=>{
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.capital.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.eu==="EU" && !c.eu) return false;
      if (filters.eu==="Non-EU" && c.eu) return false;
      if (filters.schengen==="Schengen" && !c.schengen) return false;
      if (filters.schengen==="Non-Schengen" && c.schengen) return false;
      if (filters.dual==="Allows Dual" && !c.dualCitizenship) return false;
      if (filters.dual==="No Dual" && c.dualCitizenship) return false;
      if (filters.nomad==="Has Nomad Visa" && !c.digitalNomad) return false;
      if (filters.nomad==="No Nomad Visa" && c.digitalNomad) return false;
      if (filters.pr==="≤3 yrs" && c.prYears>3) return false;
      if (filters.pr==="4-5 yrs" && (c.prYears<4||c.prYears>5)) return false;
      if (filters.pr==="6-10 yrs" && (c.prYears<6||c.prYears>10)) return false;
      if (filters.pr==="10+ yrs" && c.prYears<=10) return false;
      if (filters.cit==="≤5 yrs" && c.citizenshipYears>5) return false;
      if (filters.cit==="6-10 yrs" && (c.citizenshipYears<6||c.citizenshipYears>10)) return false;
      if (filters.cit==="11+ yrs" && c.citizenshipYears<=10) return false;
      return true;
    }).sort((a,b)=>{
      if (sort==="name") return a.name.localeCompare(b.name);
      if (sort==="pr") return a.prYears-b.prYears;
      if (sort==="citizenship") return a.citizenshipYears-b.citizenshipYears;
      if (sort==="safety") return b.safety-a.safety;
      if (sort==="healthcare") return b.healthcare-a.healthcare;
      return 0;
    });
  },[search,sort,filters]);

  const filteredIds = useMemo(()=>new Set(filtered.map(c=>c.id)),[filtered]);
  const setF = (k,v) => setFilters(p=>({...p,[k]:v}));

  return (
    <div>
      <div style={{ textAlign:"center", padding:"36px 20px 24px", background:`linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`, borderBottom:`1px solid ${T.border}` }}>
        <div style={{
          display:"inline-block", background:T.primaryGlow, color:T.primary,
          borderRadius:99, padding:"5px 16px", fontSize:11, fontWeight:800,
          letterSpacing:1, textTransform:"uppercase", marginBottom:14
        }}>{COUNTRIES.length} European Countries · All PR & Citizenship Pathways</div>
        <h1 style={{
          fontSize:"clamp(26px,5vw,50px)", fontWeight:900, margin:"0 0 10px",
          background:"linear-gradient(135deg, #f1f5f9 0%, #6366f1 60%, #a855f7 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.1
        }}>Your European<br/>Immigration Guide</h1>
        <p style={{ color:T.muted, fontSize:15, maxWidth:480, margin:"0 auto 22px" }}>
          Every PR pathway, every citizenship route, every visa option — for all European countries.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {[["🏆","Fastest PR","Norway: 3 yrs"],["⚡","Fastest Citizenship","Portugal/Serbia: 5/3 yrs"],["🌳","Ancestry Routes","Italy, Poland, Romania & more"],["🌐","Digital Nomad","12+ Countries"]].map(([ic,l,v])=>(
            <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 16px", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:18 }}>{ic}</span>
              <div>
                <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5 }}>{l}</div>
                <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"20px 16px" }}>
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:15 }}>🔍</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search countries or capitals..."
              style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px 10px 38px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:12, outline:"none", cursor:"pointer" }}>
            <option value="name">A–Z</option>
            <option value="pr">Fastest PR</option>
            <option value="citizenship">Fastest Citizenship</option>
            <option value="safety">Safety</option>
            <option value="healthcare">Healthcare</option>
          </select>
          <button onClick={()=>setShowMap(!showMap)} style={{ background: showMap?T.primaryGlow:T.card, border:`1px solid ${showMap?T.primary:T.border}`, color:showMap?T.primary:T.subtle, borderRadius:10, padding:"10px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
            {showMap?"🗺 Map":"🗺 Show Map"}
          </button>
        </div>

        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14, marginBottom:18 }}>
          <div style={{ display:"grid", gap:10 }}>
            {[
              ["EU Status","eu",["All","EU","Non-EU"]],
              ["Schengen","schengen",["All","Schengen","Non-Schengen"]],
              ["Dual Citizenship","dual",["All","Allows Dual","No Dual"]],
              ["Digital Nomad","nomad",["All","Has Nomad Visa","No Nomad Visa"]],
              ["PR Timeline","pr",["All","≤3 yrs","4-5 yrs","6-10 yrs","10+ yrs"]],
              ["Citizenship Timeline","cit",["All","≤5 yrs","6-10 yrs","11+ yrs"]],
            ].map(([label,key,opts])=>(
              <div key={key} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:T.muted, minWidth:110, flexShrink:0 }}>{label}:</span>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {opts.map(opt=>(
                    <button key={opt} onClick={()=>setF(key,opt)} style={{
                      background: filters[key]===opt?T.primary:T.surface,
                      color: filters[key]===opt?"#fff":T.subtle,
                      border:`1px solid ${filters[key]===opt?T.primary:T.border}`,
                      borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:600,
                      cursor:"pointer", transition:"all .15s"
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showMap && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:18, marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h3 style={{ margin:0, color:T.text, fontSize:15, fontWeight:800 }}>Political Map of Europe</h3>
              <span style={{ fontSize:11, color:T.muted }}>Hover to preview · Click to open country page · {filtered.length} shown</span>
            </div>
            <PoliticalMap
              countries={COUNTRIES}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={c=>navigate(`#/country/${c.id}`)}
              filteredIds={filteredIds}
            />
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:T.text }}>
            {filtered.length} {filtered.length===1?"Country":"Countries"}
            {search && <span style={{ color:T.muted, fontWeight:400 }}> matching "{search}"</span>}
          </h2>
          {compareIds.size>0&&(
            <button onClick={()=>navigate("#/compare")} style={{
              background:T.primary, color:"#fff", border:"none", borderRadius:8,
              padding:"8px 16px", cursor:"pointer", fontSize:12, fontWeight:700
            }}>Compare {compareIds.size} →</button>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {filtered.map(c=>(
            <CountryCard key={c.id} c={c} navigate={navigate} compareIds={compareIds} onCompareToggle={onCompareToggle}/>
          ))}
        </div>
        {filtered.length===0&&(
          <div style={{ textAlign:"center", padding:60, color:T.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16, color:T.subtle, marginBottom:6 }}>No countries found</div>
            <div style={{ fontSize:13 }}>Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COUNTRY DETAIL PAGE
// ─────────────────────────────────────────────────────────────
function CountryPage({ id, navigate, compareIds, onCompareToggle }) {
  const c = COUNTRIES.find(x=>x.id===id);
  const [tab, setTab] = useState("overview");
  if (!c) return <div style={{ padding:40, color:T.muted, textAlign:"center" }}>Country not found</div>;

  const tabs = [
    {id:"overview",label:"Overview"},
    {id:"visas",label:"Visa Types"},
    {id:"pr",label:"PR Pathways"},
    {id:"citizenship",label:"Citizenship"},
    {id:"proscons",label:"Pros & Cons"},
    {id:"timeline",label:"Timeline"},
  ];

  return (
    <div style={{ maxWidth:980, margin:"0 auto", padding:"20px 16px" }}>
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:18, fontSize:12, color:T.muted }}>
        <button onClick={()=>navigate("#/")} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:12, padding:0 }}>← Explorer</button>
        <span>/</span>
        <span style={{ color:T.primary }}>{c.flag} {c.name}</span>
      </div>

      <div style={{ background:`linear-gradient(135deg, ${T.surface} 0%, ${T.card} 100%)`, border:`1px solid ${T.border}`, borderRadius:16, padding:26, marginBottom:20 }}>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
              {c.eu && <Chip color={T.primary}>EU Member</Chip>}
              {c.schengen && <Chip color={T.blue}>Schengen</Chip>}
              {c.digitalNomad && <Chip color={T.green}>Digital Nomad Visa</Chip>}
              {c.dualCitizenship && <Chip color={T.amber}>Dual Citizenship ✓</Chip>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
              <span style={{ fontSize:56 }}>{c.flag}</span>
              <div>
                <h1 style={{ margin:0, fontSize:30, fontWeight:900, color:T.text }}>{c.name}</h1>
                <div style={{ color:T.muted, fontSize:13 }}>{c.capital} · {c.population} · {c.currency}</div>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, flex:1, minWidth:200 }}>
            <StatBox label="PR Eligibility" value={c.prYears>=999?"N/A":`${c.prYears} years`} color={T.green}/>
            <StatBox label="Citizenship" value={c.citizenshipYears>=999?"N/A":`${c.citizenshipYears} years`} color={T.primary}/>
            <StatBox label="Avg Salary" value={c.avgSalary} color={T.text}/>
            <StatBox label="Passport Rank" value={`#${c.passportRank}`} color={T.amber}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          <button
            onClick={()=>navigate(`#/pathways/${c.id}`)}
            style={{ background:T.primary, color:"#fff", border:"none", borderRadius:9, padding:"9px 18px", cursor:"pointer", fontSize:12, fontWeight:700 }}
          >🛣 All Pathways Detail</button>
          <button
            onClick={()=>onCompareToggle(c)}
            style={{ background: compareIds.has(c.id)?T.primaryGlow:"transparent", color:T.primary, border:`1px solid ${T.primary}`, borderRadius:9, padding:"9px 18px", cursor:"pointer", fontSize:12, fontWeight:700 }}
          >{compareIds.has(c.id)?"✓ Comparing":"+ Add to Compare"}</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:5, marginBottom:18, overflowX:"auto", paddingBottom:4 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id?T.primary:T.card,
            color: tab===t.id?"#fff":T.subtle,
            border:`1px solid ${tab===t.id?T.primary:T.border}`,
            borderRadius:9, padding:"8px 16px", cursor:"pointer",
            fontSize:12, fontWeight:700, whiteSpace:"nowrap", transition:"all .2s"
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="overview" && (
        <div style={{ display:"grid", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
            {[["Healthcare",c.healthcare,T.blue],["Safety",c.safety,T.green],["Education",c.education,T.amber],["Startup Scene",c.startupScore,T.purple],["Family Friendly",c.familyFriendly,T.green],["Retirement",c.retirementFriendly,T.cyan]].map(([l,v,col])=>(
              <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:T.subtle, fontSize:13 }}>{l}</span>
                  <span style={{ color:col, fontWeight:800, fontSize:13 }}>{v}/10</span>
                </div>
                <Bar value={v} color={col}/>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
            <h3 style={{ color:T.text, margin:"0 0 14px", fontSize:15 }}>Country Facts</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
              {[["GDP",c.gdp],["Languages",c.languages.join(", ")],["Climate",c.climate],["Cost of Living",c.costOfLiving],["Tax Rate",c.taxRate],["Passport Rank",`#${c.passportRank} globally`]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="visas" && (
        <div style={{ display:"grid", gap:10 }}>
          {c.visas.map((v,i)=>(
            <div key={v} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:15, display:"flex", gap:14, alignItems:"center" }}>
              <div style={{ width:36, height:36, borderRadius:9, background:T.surface, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, fontWeight:800, fontSize:12, flexShrink:0 }}>
                {String(i+1).padStart(2,"0")}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:T.text, fontWeight:700, fontSize:14, marginBottom:2 }}>{v}</div>
                <div style={{ color:T.muted, fontSize:12 }}>{getVisaDesc(v,c)}</div>
              </div>
              <Chip color={T.green}>Active</Chip>
            </div>
          ))}
        </div>
      )}

      {tab==="pr" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ background:`${T.green}10`, border:`1px solid ${T.green}30`, borderRadius:12, padding:16, marginBottom:4 }}>
            <div style={{ color:T.green, fontWeight:800, marginBottom:4, fontSize:14 }}>🏠 Permanent Residency in {c.name}</div>
            <div style={{ color:T.muted, fontSize:13, marginBottom:10 }}>Standard minimum: <b style={{color:T.green}}>{c.prYears>=999?"Not available to general public":`${c.prYears} years`}</b> · {(c.prPathways||[]).length} pathways available</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[...new Set((c.prPathways||[]).map(p=>p.type))].map(type=>{
                const meta = PATHWAY_TYPE_META[type]||{label:type,icon:"📋",color:T.subtle};
                return (
                  <button key={type} onClick={()=>navigate(`#/pathways/${c.id}/${type}`)} style={{
                    display:"flex", alignItems:"center", gap:5, background:meta.color+"18",
                    border:`1px solid ${meta.color}33`, borderRadius:99, padding:"3px 10px",
                    cursor:"pointer", fontSize:10, fontWeight:700, color:meta.color
                  }}>{meta.icon} {meta.label} →</button>
                );
              })}
            </div>
          </div>
          {(c.prPathways||[]).map((p,i)=>(
            <PathwayCard key={i} p={p} type="pr"/>
          ))}
        </div>
      )}

      {tab==="citizenship" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ background:`${T.primary}10`, border:`1px solid ${T.primary}30`, borderRadius:12, padding:16, marginBottom:4 }}>
            <div style={{ color:T.primary, fontWeight:800, marginBottom:4, fontSize:14 }}>🎖 Citizenship in {c.name}</div>
            <div style={{ color:T.muted, fontSize:13, marginBottom:10 }}>Standard minimum: <b style={{color:T.primary}}>{c.citizenshipYears>=999?"Not available to general public":`${c.citizenshipYears} years`}</b> · Dual citizenship: <b style={{color:c.dualCitizenship?T.green:T.red}}>{c.dualCitizenship?"Allowed":"Restricted"}</b> · {(c.citizenshipPathways||[]).length} pathways available</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[...new Set((c.citizenshipPathways||[]).map(p=>p.type))].map(type=>{
                const meta = PATHWAY_TYPE_META[type]||{label:type,icon:"📋",color:T.subtle};
                return (
                  <button key={type} onClick={()=>navigate(`#/pathways/${c.id}/${type}`)} style={{
                    display:"flex", alignItems:"center", gap:5, background:meta.color+"18",
                    border:`1px solid ${meta.color}33`, borderRadius:99, padding:"3px 10px",
                    cursor:"pointer", fontSize:10, fontWeight:700, color:meta.color
                  }}>{meta.icon} {meta.label} →</button>
                );
              })}
            </div>
          </div>
          {(c.citizenshipPathways||[]).map((p,i)=>(
            <PathwayCard key={i} p={p} type="citizenship"/>
          ))}
        </div>
      )}

      {tab==="proscons" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ background:T.card, border:`1px solid ${T.green}30`, borderRadius:12, padding:20 }}>
            <h3 style={{ color:T.green, margin:"0 0 14px", fontSize:15 }}>✓ Advantages</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {c.pros.map((item,i)=>(
                <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                  <span style={{ color:T.green, fontSize:14, flexShrink:0, lineHeight:"20px" }}>+</span>
                  <span style={{ color:T.subtle, fontSize:13, lineHeight:"20px" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.red}30`, borderRadius:12, padding:20 }}>
            <h3 style={{ color:T.red, margin:"0 0 14px", fontSize:15 }}>✗ Challenges</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {c.cons.map((item,i)=>(
                <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                  <span style={{ color:T.red, fontSize:14, flexShrink:0, lineHeight:"20px" }}>−</span>
                  <span style={{ color:T.subtle, fontSize:13, lineHeight:"20px" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="timeline" && (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:24 }}>
          <h3 style={{ color:T.text, margin:"0 0 24px", fontSize:15, fontWeight:800 }}>Immigration Timeline — {c.name}</h3>
          {c.prYears>=999 ? (
            <div style={{ color:T.muted, textAlign:"center", padding:30 }}>Standard immigration timeline not applicable for {c.name}</div>
          ) : (
            <TimelineView c={c}/>
          )}
        </div>
      )}

      <div style={{ background:`${T.amber}10`, border:`1px solid ${T.amber}30`, borderRadius:11, padding:14, marginTop:18 }}>
        <div style={{ color:T.amber, fontWeight:700, fontSize:12, marginBottom:4 }}>⚠ Important Disclaimer</div>
        <div style={{ color:T.muted, fontSize:12 }}>Immigration laws change frequently. Always verify information with official government sources and qualified immigration lawyers before making any decisions. Data updated June 2025.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PATHWAYS DETAIL PAGE
// ─────────────────────────────────────────────────────────────
function PathwaysPage({ id, navigate, anchor }) {
  const c = COUNTRIES.find(x=>x.id===id);

  // Decide which tab the anchor lives in (PR, citizenship, or both)
  const anchorInPR = anchor ? (c?.prPathways||[]).some(p=>p.type===anchor) : false;
  const anchorInCit = anchor ? (c?.citizenshipPathways||[]).some(p=>p.type===anchor) : false;
  const defaultSection = anchor ? (anchorInCit && !anchorInPR ? "citizenship" : "pr") : "pr";

  const [activeSection, setActiveSection] = useState(defaultSection);

  // Re-sync active section + scroll whenever the anchor changes (e.g. user clicks another legend chip)
  useEffect(() => {
    if (!anchor || !c) return;
    const targetSection = (anchorInCit && !anchorInPR) ? "citizenship" : "pr";
    setActiveSection(targetSection);
    // Wait a tick for the section to render before scrolling
    const t = setTimeout(() => {
      const el = document.getElementById(`anchor-${anchor}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, id]);

  if (!c) return <div style={{ padding:40, color:T.muted, textAlign:"center" }}>Country not found</div>;

  const goToAnchor = (type) => navigate(`#/pathways/${c.id}/${type}`);
  const clearAnchor = () => navigate(`#/pathways/${c.id}`);

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"20px 16px" }}>
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:18, fontSize:12, color:T.muted, flexWrap:"wrap" }}>
        <button onClick={()=>navigate("#/")} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:12,padding:0 }}>← Explorer</button>
        <span>/</span>
        <button onClick={()=>navigate(`#/country/${c.id}`)} style={{ background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:12,padding:0 }}>{c.name}</button>
        <span>/</span>
        <button onClick={clearAnchor} style={{ background:"none",border:"none",color:anchor?T.muted:T.primary,cursor:"pointer",fontSize:12,padding:0 }}>All Pathways</button>
        {anchor && (
          <>
            <span>/</span>
            <span style={{ color:T.primary, display:"flex", alignItems:"center", gap:4 }}>
              {(PATHWAY_TYPE_META[anchor]||{}).icon} {(PATHWAY_TYPE_META[anchor]||{}).label || anchor}
            </span>
          </>
        )}
      </div>

      {anchor && (
        <div style={{
          background:`${(PATHWAY_TYPE_META[anchor]||{color:T.primary}).color}15`,
          border:`1px solid ${(PATHWAY_TYPE_META[anchor]||{color:T.primary}).color}40`,
          borderRadius:12, padding:"12px 16px", marginBottom:16,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>{(PATHWAY_TYPE_META[anchor]||{}).icon}</span>
            <span style={{ color:T.text, fontSize:13, fontWeight:700 }}>
              Jumped straight to {(PATHWAY_TYPE_META[anchor]||{}).label || anchor} routes for {c.name}
            </span>
          </div>
          <button onClick={clearAnchor} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.muted, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:600 }}>
            ✕ Clear filter
          </button>
        </div>
      )}

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:24, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:52 }}>{c.flag}</span>
          <div>
            <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:900, color:T.text }}>All Immigration Pathways</h1>
            <div style={{ color:T.muted, fontSize:14 }}>{c.name} · {(c.prPathways||[]).length} PR routes · {(c.citizenshipPathways||[]).length} citizenship routes</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginTop:18 }}>
          <StatBox label="Fastest PR" value={c.prPathways?.length>0?`${Math.min(...c.prPathways.map(p=>p.years))} yrs`:"N/A"} color={T.green}/>
          <StatBox label="Fastest Citizenship" value={c.citizenshipPathways?.length>0?`${Math.min(...c.citizenshipPathways.map(p=>p.years))} yrs`:"N/A"} color={T.primary}/>
          <StatBox
            label="Ancestry Route"
            value={(c.citizenshipPathways||[]).some(p=>p.type==="heritage")?"✓ Available":"✗ None"}
            color={(c.citizenshipPathways||[]).some(p=>p.type==="heritage")?T.green:T.red}
          />
          <StatBox
            label="Investment Route"
            value={(c.prPathways||[]).concat(c.citizenshipPathways||[]).some(p=>p.type==="investment")?"✓ Available":"✗ None"}
            color={(c.prPathways||[]).concat(c.citizenshipPathways||[]).some(p=>p.type==="investment")?T.amber:T.muted}
          />
          <StatBox label="Dual Citizenship" value={c.dualCitizenship?"✓ Allowed":"✗ Restricted"} color={c.dualCitizenship?T.green:T.red}/>
          <StatBox label="Family Routes" value={(c.citizenshipPathways||[]).filter(p=>p.type==="family").length>0?`${(c.citizenshipPathways||[]).filter(p=>p.type==="family").length} available`:"Limited"} color={T.purple}/>
        </div>

        {/* Quick-jump links to common route types, clickable deep links */}
        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:8 }}>Jump to a route type</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[...new Set([...(c.prPathways||[]),...(c.citizenshipPathways||[])].map(p=>p.type))].map(type=>{
              const meta = PATHWAY_TYPE_META[type]||{label:type,icon:"📋",color:T.subtle};
              const isActive = anchor===type;
              return (
                <button key={type} onClick={()=>goToAnchor(type)} style={{
                  display:"flex", alignItems:"center", gap:5,
                  background: isActive ? meta.color+"30" : meta.color+"15",
                  border:`1px solid ${isActive ? meta.color : meta.color+"40"}`,
                  borderRadius:99, padding:"5px 12px", cursor:"pointer",
                  fontSize:11, fontWeight:700, color:meta.color, transition:"all .15s"
                }}>
                  <span>{meta.icon}</span>{meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["pr","🏠 Permanent Residency"],["citizenship","🎖 Citizenship"]].map(([k,l])=>(
          <button key={k} onClick={()=>{ setActiveSection(k); if(anchor) clearAnchor(); }} style={{
            flex:1, background:activeSection===k?T.primary:T.card,
            color:activeSection===k?"#fff":T.subtle,
            border:`1px solid ${activeSection===k?T.primary:T.border}`,
            borderRadius:10, padding:"11px 20px", cursor:"pointer",
            fontSize:13, fontWeight:800, transition:"all .2s"
          }}>{l}</button>
        ))}
      </div>

      {activeSection==="pr" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <h2 style={{ margin:0, color:T.text, fontSize:18, fontWeight:900 }}>Permanent Residency Pathways</h2>
            <Chip color={T.green}>{(c.prPathways||[]).length} routes</Chip>
          </div>
          <PathwayTypeLegend pathways={c.prPathways||[]} activeType={anchor} onTypeClick={goToAnchor}/>
          {(c.prPathways||[]).map((p,i)=>(
            <PathwayCard key={i} p={p} type="pr" index={i+1} highlighted={anchor===p.type} anchorId={anchor===p.type?`anchor-${p.type}`:undefined}/>
          ))}
          {(!c.prPathways||c.prPathways.length===0)&&<div style={{ color:T.muted, padding:20, textAlign:"center" }}>No detailed pathways available for this country.</div>}
        </div>
      )}

      {activeSection==="citizenship" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <h2 style={{ margin:0, color:T.text, fontSize:18, fontWeight:900 }}>Citizenship Pathways</h2>
            <Chip color={T.primary}>{(c.citizenshipPathways||[]).length} routes</Chip>
          </div>
          <PathwayTypeLegend pathways={c.citizenshipPathways||[]} activeType={anchor} onTypeClick={goToAnchor}/>
          {(c.citizenshipPathways||[]).map((p,i)=>(
            <PathwayCard key={i} p={p} type="citizenship" index={i+1} highlighted={anchor===p.type} anchorId={anchor===p.type?`anchor-${p.type}`:undefined}/>
          ))}
          {(!c.citizenshipPathways||c.citizenshipPathways.length===0)&&<div style={{ color:T.muted, padding:20, textAlign:"center" }}>No detailed pathways available for this country.</div>}
        </div>
      )}

      <div style={{ background:`${T.amber}10`, border:`1px solid ${T.amber}30`, borderRadius:11, padding:14, marginTop:20 }}>
        <div style={{ color:T.amber, fontWeight:700, fontSize:12, marginBottom:4 }}>⚠ Important Disclaimer</div>
        <div style={{ color:T.muted, fontSize:12 }}>Immigration laws change frequently. Always verify with official government sources and a qualified immigration lawyer before making decisions. Data updated June 2025.</div>
      </div>
    </div>
  );
}

function PathwayTypeLegend({ pathways, activeType, onTypeClick }) {
  const types = [...new Set(pathways.map(p=>p.type))];
  if (types.length===0) return null;
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
      {types.map(type=>{
        const meta = PATHWAY_TYPE_META[type]||{label:type,icon:"📋",color:T.subtle};
        const isActive = activeType===type;
        return (
          <button key={type} onClick={()=>onTypeClick&&onTypeClick(type)} style={{
            display:"flex", alignItems:"center", gap:5,
            background: isActive ? meta.color+"35" : meta.color+"18",
            border:`1px solid ${isActive ? meta.color : meta.color+"33"}`,
            borderRadius:99, padding:"3px 10px", cursor: onTypeClick ? "pointer" : "default",
            transition:"all .15s"
          }}>
            <span style={{ fontSize:12 }}>{meta.icon}</span>
            <span style={{ fontSize:10, color:meta.color, fontWeight:700 }}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PathwayCard({ p, type, index, highlighted, anchorId }) {
  const [open, setOpen] = useState(!!highlighted);
  const meta = PATHWAY_TYPE_META[p.type]||{label:p.type||"Standard",icon:"📋",color:T.subtle};
  const accentColor = type==="pr" ? T.green : T.primary;
  const isInstant = p.years===0;
  const isUnavail = p.years>=999;

  // If this card becomes the highlighted/deep-linked one after mount, force it open
  useEffect(() => { if (highlighted) setOpen(true); }, [highlighted]);

  return (
    <div id={anchorId} style={{
      background:T.card,
      border:`1px solid ${highlighted ? meta.color : (open?meta.color:T.border)}`,
      borderRadius:13, overflow:"hidden", transition:"border .2s, box-shadow .3s",
      boxShadow: highlighted ? `0 0 0 3px ${meta.color}33, 0 8px 28px ${meta.color}22` : "none",
      scrollMarginTop: 90
    }}>
      <div
        style={{ padding:"16px 18px", cursor:"pointer", display:"flex", gap:14, alignItems:"center" }}
        onClick={()=>setOpen(!open)}
      >
        {index && (
          <div style={{ width:34, height:34, borderRadius:9, background:meta.color+"22", border:`1px solid ${meta.color}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:14 }}>{meta.icon}</span>
          </div>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
            <span style={{ color:T.text, fontWeight:800, fontSize:14 }}>{p.name}</span>
            <span style={{ background:meta.color+"22", color:meta.color, borderRadius:99, padding:"1px 8px", fontSize:10, fontWeight:700, border:`1px solid ${meta.color}33`, flexShrink:0 }}>
              {meta.icon} {meta.label}
            </span>
            {highlighted && (
              <span style={{ background:meta.color, color:"#fff", borderRadius:99, padding:"1px 8px", fontSize:9, fontWeight:800, flexShrink:0 }}>
                🔗 LINKED HERE
              </span>
            )}
          </div>
          <div style={{ fontSize:12, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"90%" }}>
            {p.requirements.substring(0,80)}{p.requirements.length>80?"...":""}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:isInstant?11:18, fontWeight:900, color: isInstant?T.amber:isUnavail?T.muted:accentColor, lineHeight:1 }}>
            {isInstant?"INSTANT":isUnavail?"N/A":`${p.years}`}
          </div>
          {!isInstant && !isUnavail && <div style={{ fontSize:9, color:T.muted }}>years</div>}
          <div style={{ fontSize:16, color:T.muted, marginTop:4 }}>{open?"▲":"▼"}</div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:"16px 18px", display:"grid", gap:12 }}>
          <div>
            <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:6 }}>Requirements</div>
            <div style={{ color:T.text, fontSize:13, lineHeight:1.7 }}>{p.requirements}</div>
          </div>
          {p.notes && (
            <div style={{ background:meta.color+"0f", border:`1px solid ${meta.color}22`, borderRadius:8, padding:"10px 14px" }}>
              <div style={{ fontSize:10, color:meta.color, textTransform:"uppercase", letterSpacing:.5, marginBottom:4, fontWeight:800 }}>💡 Key Note</div>
              <div style={{ color:T.subtle, fontSize:12, lineHeight:1.6 }}>{p.notes}</div>
            </div>
          )}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <div style={{ background:T.surface, borderRadius:8, padding:"8px 14px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:2 }}>Timeline</div>
              <div style={{ fontSize:13, fontWeight:800, color:isInstant?T.amber:accentColor }}>{isInstant?"Immediate/0 years":isUnavail?"Not applicable":`${p.years} year${p.years!==1?"s":""} from arrival`}</div>
            </div>
            <div style={{ background:T.surface, borderRadius:8, padding:"8px 14px" }}>
              <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:2 }}>Category</div>
              <div style={{ fontSize:13, fontWeight:800, color:meta.color }}>{meta.label}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineView({ c }) {
  const milestones = [
    {label:"Arrival & Registration",year:0,color:T.primary,detail:"Register with local authorities, obtain initial residence permit/visa"},
    {label:"First Permit Renewal",year:1,color:T.blue,detail:"Annual or biennial permit renewal — maintain qualifying employment or income"},
    {label:"Language Certification",year:Math.min(2,c.prYears-1),color:T.purple,detail:`Obtain required language certification (typically ${c.languages[0]} A2-B1 or higher)`},
    {label:"PR Eligibility",year:c.prYears,color:T.green,detail:`Apply for Permanent Residency after ${c.prYears} continuous years`},
    ...(c.citizenshipYears<999?[{label:"Citizenship Eligibility",year:c.citizenshipYears,color:T.amber,detail:`Apply for naturalization after ${c.citizenshipYears} years from arrival`}]:[]),
  ].filter(m=>m.year<=Math.max(c.citizenshipYears,20));

  return (
    <div>
      {milestones.map((m,i)=>(
        <div key={i} style={{ display:"flex", gap:16, marginBottom: i<milestones.length-1?0:0 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:50, flexShrink:0 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:m.color+"22", border:`2px solid ${m.color}`, display:"flex", alignItems:"center", justifyContent:"center", color:m.color, fontWeight:900, fontSize:10, flexShrink:0, zIndex:1 }}>
              Y{m.year}
            </div>
            {i<milestones.length-1 && <div style={{ width:2, flex:1, background:T.border, minHeight:28, margin:"4px 0" }}/>}
          </div>
          <div style={{ paddingTop:8, paddingBottom:24 }}>
            <div style={{ color:m.color, fontWeight:800, fontSize:14, marginBottom:3 }}>{m.label}</div>
            <div style={{ color:T.muted, fontSize:13 }}>{m.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARE PAGE
// ─────────────────────────────────────────────────────────────
function ComparePage({ compareIds, onRemove, navigate }) {
  const countries = COUNTRIES.filter(c=>compareIds.has(c.id));
  if (countries.length<2) {
    return (
      <div style={{ textAlign:"center", padding:"80px 20px", color:T.muted }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚖️</div>
        <div style={{ fontSize:20, fontWeight:800, color:T.subtle, marginBottom:8 }}>Select Countries to Compare</div>
        <div style={{ fontSize:14, marginBottom:20 }}>Click "+ Compare" on at least 2 country cards from the Explorer.</div>
        <button onClick={()=>navigate("#/")} style={{ background:T.primary, color:"#fff", border:"none", borderRadius:9, padding:"10px 22px", cursor:"pointer", fontSize:13, fontWeight:700 }}>Go to Explorer</button>
      </div>
    );
  }

  const rows = [
    {label:"Flag",render:c=><span style={{fontSize:28}}>{c.flag}</span>},
    {label:"EU Member",render:c=>c.eu?<Chip color={T.primary}>Yes</Chip>:<Chip color={T.muted}>No</Chip>},
    {label:"Schengen",render:c=>c.schengen?<Chip color={T.blue}>Yes</Chip>:<Chip color={T.muted}>No</Chip>},
    {label:"PR Eligibility",render:(c,best)=><span style={{fontWeight:900,fontSize:16,color:c.prYears===best.pr?T.green:T.text}}>{c.prYears>=999?"N/A":`${c.prYears} yrs`}{c.prYears===best.pr&&c.prYears<999?" ★":""}</span>,bestFn:cs=>({pr:Math.min(...cs.filter(c=>c.prYears<999).map(c=>c.prYears))})},
    {label:"Citizenship",render:(c,best)=><span style={{fontWeight:900,fontSize:16,color:c.citizenshipYears===best.cit?T.primary:T.text}}>{c.citizenshipYears>=999?"N/A":`${c.citizenshipYears} yrs`}{c.citizenshipYears===best.cit&&c.citizenshipYears<999?" ★":""}</span>,bestFn:cs=>({cit:Math.min(...cs.filter(c=>c.citizenshipYears<999).map(c=>c.citizenshipYears))})},
    {label:"Dual Citizenship",render:c=>c.dualCitizenship?<Chip color={T.green}>✓ Allowed</Chip>:<Chip color={T.red}>✗ Restricted</Chip>},
    {label:"Digital Nomad Visa",render:c=>c.digitalNomad?<Chip color={T.green}>Available</Chip>:<Chip color={T.muted}>None</Chip>},
    {label:"Avg Salary",render:c=><span style={{color:T.text,fontWeight:700}}>{c.avgSalary}</span>},
    {label:"Cost of Living",render:c=><span style={{color:T.text}}>{c.costOfLiving}</span>},
    {label:"Tax Rate",render:c=><span style={{color:T.amber}}>{c.taxRate}</span>},
    {label:"PR Pathways",render:(c,best)=><span style={{fontWeight:800,color:(c.prPathways?.length||0)===best.prp?T.green:T.text}}>{c.prPathways?.length||0} routes{(c.prPathways?.length||0)===best.prp?" ★":""}</span>,bestFn:cs=>({prp:Math.max(...cs.map(c=>c.prPathways?.length||0))})},
    {label:"Citizenship Pathways",render:(c,best)=><span style={{fontWeight:800,color:(c.citizenshipPathways?.length||0)===best.cp?T.primary:T.text}}>{c.citizenshipPathways?.length||0} routes{(c.citizenshipPathways?.length||0)===best.cp?" ★":""}</span>,bestFn:cs=>({cp:Math.max(...cs.map(c=>c.citizenshipPathways?.length||0))})},
    {label:"Safety",render:(c,best)=><><span style={{fontWeight:900,color:c.safety===best.saf?T.green:T.text}}>{c.safety}/10</span><div style={{width:80,marginTop:4}}><Bar value={c.safety} color={c.safety===best.saf?T.green:T.blue}/></div></>,bestFn:cs=>({saf:Math.max(...cs.map(c=>c.safety))})},
    {label:"Healthcare",render:(c,best)=><><span style={{fontWeight:900,color:c.healthcare===best.hc?T.green:T.text}}>{c.healthcare}/10</span><div style={{width:80,marginTop:4}}><Bar value={c.healthcare} color={c.healthcare===best.hc?T.green:T.blue}/></div></>,bestFn:cs=>({hc:Math.max(...cs.map(c=>c.healthcare))})},
    {label:"Education",render:(c,best)=><><span style={{fontWeight:900,color:c.education===best.ed?T.green:T.text}}>{c.education}/10</span><div style={{width:80,marginTop:4}}><Bar value={c.education} color={c.education===best.ed?T.green:T.blue}/></div></>,bestFn:cs=>({ed:Math.max(...cs.map(c=>c.education))})},
    {label:"Ancestry Route",render:c=>(c.citizenshipPathways||[]).some(p=>p.type==="heritage")?<Chip color={T.green}>✓ Yes</Chip>:<Chip color={T.muted}>No</Chip>},
    {label:"Investment Route",render:c=>(c.prPathways||[]).concat(c.citizenshipPathways||[]).some(p=>p.type==="investment")?<Chip color={T.amber}>✓ Yes</Chip>:<Chip color={T.muted}>No</Chip>},
    {label:"Languages",render:c=><span style={{color:T.muted,fontSize:12}}>{c.languages.join(", ")}</span>},
    {label:"Passport Rank",render:(c,best)=><span style={{fontWeight:900,color:c.passportRank===best.pp?T.amber:T.text}}>#{c.passportRank}{c.passportRank===best.pp?" ★":""}</span>,bestFn:cs=>({pp:Math.min(...cs.map(c=>c.passportRank))})},
  ];

  const bestValues = rows.reduce((acc,row)=>{
    if (row.bestFn) Object.assign(acc, row.bestFn(countries));
    return acc;
  },{});

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px" }}>
      <div style={{ marginBottom:18 }}>
        <h2 style={{ margin:"0 0 4px", color:T.text, fontSize:22, fontWeight:900 }}>Country Comparison</h2>
        <p style={{ color:T.muted, margin:0, fontSize:13 }}>⭐ = best in class · Compare up to 4 countries</p>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                <th style={{ padding:"14px 18px", textAlign:"left", color:T.muted, fontSize:12, width:150 }}>Metric</th>
                {countries.map(c=>(
                  <th key={c.id} style={{ padding:"14px 18px", textAlign:"center", borderLeft:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <span style={{ fontSize:26 }}>{c.flag}</span>
                      <span style={{ color:T.text, fontSize:13, fontWeight:800 }}>{c.name}</span>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>navigate(`#/country/${c.id}`)} style={{ background:T.primaryGlow, color:T.primary, border:`1px solid ${T.primary}33`, borderRadius:6, padding:"2px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>Details</button>
                        <button onClick={()=>onRemove(c.id)} style={{ background:T.surface, color:T.muted, border:`1px solid ${T.border}`, borderRadius:6, padding:"2px 8px", cursor:"pointer", fontSize:10 }}>Remove</button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row=>(
                <tr key={row.label} style={{ borderBottom:`1px solid ${T.border}` }}>
                  <td style={{ padding:"12px 18px", color:T.muted, fontSize:12, fontWeight:600 }}>{row.label}</td>
                  {countries.map(c=>(
                    <td key={c.id} style={{ padding:"12px 18px", textAlign:"center", borderLeft:`1px solid ${T.border}` }}>
                      {row.render(c, bestValues)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getVisaDesc(visa, c) {
  const d = {
    "Skilled Worker":`For professionals with job offers in ${c.name}. Employer sponsorship typically required with salary threshold.`,
    "EU Blue Card":"EU-wide highly-qualified worker permit. Minimum salary and degree requirements apply.",
    "Digital Nomad":`Work remotely for non-${c.name} employers while residing here. Income above threshold required.`,
    "Student":"For enrolled students at recognised institutions. Limited work rights typically apply.",
    "Family Reunification":"For family members of legal residents. Sponsor must meet income and housing requirements.",
    "Golden Visa":"Investment-based residency through real estate or capital investment. Low or no physical presence required.",
    "Investor":"Business or capital investment residency pathway. Varies by investment amount and type.",
    "Entrepreneur":"For those establishing or running a business. Business plan and capital requirements apply.",
    "Startup":"For founders of innovative, high-growth startups. Endorsement by innovation body typically required.",
    "Research":"For academic researchers affiliated with recognised institutions. Hosting agreement required.",
    "Seasonal":"Temporary permits for agricultural, tourism, and hospitality workers. Usually summer season only.",
    "Job Seeker":"Short-term permit to actively search for employment without prior job offer.",
  };
  return d[visa] || `Legal pathway for ${visa.toLowerCase()} activities in ${c.name}.`;
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const { hash, navigate } = useHashRouter();
  const [compareIds, setCompareIds] = useState(new Set());
  const route = parseRoute(hash);

  const handleCompareToggle = useCallback((c) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(c.id)) next.delete(c.id);
      else if (next.size < 4) next.add(c.id);
      return next;
    });
  }, []);

  const handleCompareRemove = useCallback((id) => {
    setCompareIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Inter',system-ui,-apple-system,sans-serif", color:T.text }}>
      <NavBar navigate={navigate} compareCount={compareIds.size}/>
      <div>
        {route.page==="home" && (
          <HomePage navigate={navigate} compareIds={compareIds} onCompareToggle={handleCompareToggle}/>
        )}
        {route.page==="country" && (
          <CountryPage id={route.id} navigate={navigate} compareIds={compareIds} onCompareToggle={handleCompareToggle}/>
        )}
        {route.page==="pathways" && (
          <PathwaysPage id={route.id} navigate={navigate} anchor={route.anchor}/>
        )}
        {route.page==="compare" && (
          <ComparePage compareIds={compareIds} onRemove={handleCompareRemove} navigate={navigate}/>
        )}
      </div>
      <footer style={{ borderTop:`1px solid ${T.border}`, marginTop:48, padding:"20px 24px", textAlign:"center", color:T.muted, fontSize:11 }}>
        <div style={{ marginBottom:6 }}>⚠️ <strong>Disclaimer:</strong> Immigration laws change frequently. Always verify information with official government sources and qualified immigration lawyers before making decisions.</div>
        <div>EuroPath Immigration Explorer · Data compiled June 2025 · {COUNTRIES.length} countries · All pathways research-based</div>
      </footer>
    </div>
  );
}
