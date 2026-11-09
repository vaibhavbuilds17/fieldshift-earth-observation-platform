export interface AdaptationStrategy {
  id: string;
  title: string;
  category: 'water' | 'crops' | 'soil' | 'microclimate' | 'systemic';
  tag: string;
  focusRegion: string;
  summary: string;
  scientificMechanism: string;
  benefits: string[];
  tradeOffs: string[];
  resourceNeeds: string[];
  kvkQuestions: string[];
}

export const ADAPTATION_STRATEGIES: AdaptationStrategy[] = [
  {
    id: 'in-situ-rainwater-harvesting',
    title: 'Broad Bed Furrow (BBF) & Farm Ponds (Shet Tale)',
    category: 'water',
    tag: 'Moisture Retention',
    focusRegion: 'Semi-Arid Deccan Plateau (Maharashtra Vertisols)',
    summary:
      'Engineered soil land configurations that slow surface runoff, encourage deep vertical infiltration into clay soils, and store excess monsoon bursts in lined farm ponds for protective deficit irrigation during prolonged dry spells.',
    scientificMechanism:
      'BBF systems increase the effective soil moisture contact duration during high-intensity rainfall events, reducing peak surface velocity and soil erosion while recharging the lower root zone.',
    benefits: [
      'Buffers crops against mid-season drought dry spells lasting 15–25 days.',
      'Prevents waterlogging during intense short-duration monsoon cloudbursts.',
      'Enables 1–2 life-saving protective irrigations during critical flowering stages.',
    ],
    tradeOffs: [
      'Lined farm ponds take approximately 5–8% of cultivable land area out of production.',
      'Requires capital investment in pond excavation, HDPE geomembrane lining, and solar or diesel pumping.',
      'Unlined ponds in permeable soils suffer high seepage and evaporation losses.',
    ],
    resourceNeeds: [
      'Topographical survey to identify natural drainage contours.',
      'HDPE plastic film (minimum 500 microns) to prevent water seepage.',
      'Tractor-drawn BBF seed-cum-fertilizer drill.',
    ],
    kvkQuestions: [
      'What is the optimal bed width and furrow depth for my specific soil clay fraction?',
      'Are government subsidies (e.g., Magel Tyala Shet Tale scheme) currently available in Ahmednagar district?',
    ],
  },
  {
    id: 'precision-drip-irrigation',
    title: 'Sub-Surface & Automated Drip Irrigation with Mulching',
    category: 'water',
    tag: 'Irrigation Efficiency',
    focusRegion: 'Horticultural Tracts (Nashik, Shirdi, Pune, Solapur)',
    summary:
      'Transitioning from flood furrow irrigation to pressurized drip systems combined with silver-black polyethylene or sugarcane trash organic mulching to slash evaporation losses and maximize water productivity.',
    scientificMechanism:
      'Drip delivers water directly to the active rhizosphere at rates matching crop evapotranspiration (ETc), reducing surface wetted area and cutting evaporative loss by 40–60% compared to surface flooding.',
    benefits: [
      'Increases crop water productivity from ~0.3 kg/m³ to over 1.2 kg/m³ in sugarcane and vegetables.',
      'Prevents diurnal soil temperature spikes in the top 10 cm of the root zone.',
      'Enables precision fertigation, cutting synthetic fertilizer runoff into local groundwater.',
    ],
    tradeOffs: [
      'High initial setup cost (₹50,000–₹90,000 per hectare depending on spacing).',
      'Requires regular maintenance: acid washing and filtration to prevent emitter clogging from hard groundwater.',
      'Plastic mulching generates non-biodegradable waste unless durable or biodegradable films are sourced.',
    ],
    resourceNeeds: [
      'Consistent power source (solar micro-grid or stable agricultural feeder).',
      'Sand-media and disc filters calibrated for groundwater hardness.',
      'Flow meters and soil tension meters or tensiometers.',
    ],
    kvkQuestions: [
      'How does my well water salinity/EC affect drip emitter selection and clogging risk?',
      'What irrigation scheduling formula (liters/plant/day) matches NASA ETo estimations in our taluka?',
    ],
  },
  {
    id: 'crop-diversification-millets',
    title: 'Climate-Resilient Millets & Short-Duration Pulses',
    category: 'crops',
    tag: 'Crop Selection',
    focusRegion: 'Marathwada & Rain-Shadow Zones of Maharashtra',
    summary:
      'Diversifying water-intensive mono-cropping (sugarcane, water-thirsty cotton) with C4 coarse grains like Pearl Millet (Bajra), Sorghum (Jowar), Finger Millet (Ragi), and drought-tolerant pulses (Pigeon Pea / Tur, Chickpea / Chana).',
    scientificMechanism:
      'C4 photosynthetic pathway possesses higher photosynthetic water use efficiency (PWUE) and functions effectively at ambient temperatures up to 40°C where C3 crops suffer photorespiration.',
    benefits: [
      'Requires only 250–350 mm of water compared to 1,800–2,200 mm for annual sugarcane crops.',
      'Deeper root penetration scavenges residual soil moisture and nutrients from deep vertisols.',
      'Intercropping pulses fixes atmospheric nitrogen, improving soil health and family nutrition.',
    ],
    tradeOffs: [
      'Market price volatility compared to assured Minimum Support Price (MSP) or sugar factory cane contracts.',
      'Storage susceptibility to store-grain pests (weevils) during humid post-monsoon months.',
      'Requires consumer demand linkage and processing infrastructure (dehullers).',
    ],
    resourceNeeds: [
      'Certified high-yielding drought-resilient seed cultivars (e.g. ICRISAT/MPKV Rahuri releases).',
      'Village-level seed cleaning and mini-mill processing units.',
    ],
    kvkQuestions: [
      'Which Rahuri-developed Jowar or Bajra hybrids show the highest drought tolerance in Kopargaon?',
      'What intercropping ratio (e.g., 2:1 Bajra + Pigeon Pea) provides optimal economic and risk balance?',
    ],
  },
  {
    id: 'soil-organic-carbon',
    title: 'Cover Cropping, Green Manuring & Residue Retention',
    category: 'soil',
    tag: 'Soil Water Capacity',
    focusRegion: 'All Agro-Ecological Zones of Maharashtra',
    summary:
      'Halting crop residue burning (e.g. sugarcane trash, wheat straw) and incorporating compost, vermicompost, biochar, and dhaincha/sunnhemp green manures to rebuild soil organic carbon (SOC) levels above 0.75%.',
    scientificMechanism:
      'Every 1% increase in soil organic matter increases the soil available water holding capacity by roughly 140,000–180,000 liters per hectare, buffering crops against dry intervals.',
    benefits: [
      'Expands root-zone water storage reservoir, delaying drought onset by 5–10 days.',
      'Improves soil aggregate stability, reducing crusting during heavy rainfall.',
      'Enhances beneficial microbial populations and mycorrhizal nutrient transport.',
    ],
    tradeOffs: [
      'Residue retention without chopper-shredders can complicate mechanical intercultural operations.',
      'Decomposition of high C:N ratio residues can temporarily immobilize soil nitrogen unless balanced.',
      'Noticeable soil health gains require 2–4 continuous seasons of disciplined practice.',
    ],
    resourceNeeds: [
      'Tractor-mounted residue shredder/mulcher (Super Seeder or Happy Seeder).',
      'On-farm composting or bio-digester setups.',
      'Green manure seeds (Sesbania aculeata or Crotalaria juncea).',
    ],
    kvkQuestions: [
      'How can I speed up in-situ sugarcane trash decomposition without nitrogen depression?',
      'What is my baseline Soil Organic Carbon from recent Soil Health Card testing?',
    ],
  },
  {
    id: 'agroforestry-windbreaks',
    title: 'Field Boundary Agroforestry & Shelterbelts',
    category: 'microclimate',
    tag: 'Canopy Buffering',
    focusRegion: 'Wind-Swept & Drought-Vulnerable Deccan Agro-Ecosystems',
    summary:
      'Planting multi-tiered native trees (Neem, Drumstick/Moringa, Melia dubia, Subabul) along field perimeters to reduce horizontal wind speeds, lower vapor pressure deficit (VPD), and moderate extreme afternoon canopy heating.',
    scientificMechanism:
      'Shelterbelts create a windward and leeward microclimate buffer that suppresses boundary-layer turbulent heat flux, decreasing crop transpiration demand by 15–25% in the sheltered zone.',
    benefits: [
      'Reduces mechanical lodging risk in standing grain and fruit crops during gusty pre-monsoon winds.',
      'Provides secondary farm revenue through Moringa pods, fodder, or timber harvesting.',
      'Enhances natural biological pest control by harboring predatory birds and beneficial insects.',
    ],
    tradeOffs: [
      'Trees compete with boundary crop rows for light and moisture if root-pruning trenches are not dug.',
      'Takes 3–5 years for trees to reach functional shelterbelt height.',
      'Requires protection from roaming livestock during early establishment years.',
    ],
    resourceNeeds: [
      'Quality saplings suited to local climate and water conditions.',
      'Protective tree guards or live fencing.',
      'Sub-soiler or trenching plough to sever horizontal root intrusion into main crop fields.',
    ],
    kvkQuestions: [
      'Which tree species have deep taproots that do not compete with crop surface feeding roots?',
      'How far into the field does the protective wind reduction zone extend?',
    ],
  },
];
