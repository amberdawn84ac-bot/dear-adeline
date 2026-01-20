-- ============================================
-- TEXTBOOKS SEED DATA
-- Starter content for History Timeline & Science Skill Tree
-- ============================================

-- ============================================
-- HISTORY EVENTS
-- ============================================

INSERT INTO public.textbook_events (title, date_display, era, century, decade, mainstream_narrative, primary_sources, source_citations, scripture_references, sort_order, approved)
VALUES
-- CREATION ERA
(
    'Creation of the World',
    'In the Beginning',
    'creation',
    NULL,
    NULL,
    'The universe began 13.8 billion years ago with the Big Bang. Earth formed 4.5 billion years ago. Life evolved over millions of years from simple organisms to complex beings.',
    'The Bible records that God created the heavens and the earth in six days. The Hebrew word "yom" (day) with a number always means a literal 24-hour day in Scripture. The complexity and information in DNA points to intelligent design, not random chance.',
    '["Genesis 1-2", "Psalm 19:1 - The heavens declare the glory of God", "Romans 1:20 - God''s invisible qualities clearly seen"]',
    '["Genesis 1:1", "Genesis 1:31", "John 1:1-3", "Colossians 1:16"]',
    1,
    true
),
(
    'The Fall of Man',
    'After Creation',
    'creation',
    NULL,
    NULL,
    'Humans evolved moral awareness gradually. The concept of original sin is a religious construct not supported by evolutionary biology.',
    'Adam and Eve were real people who made a real choice that affected all humanity. Death entered the world through sin, not before. This explains why the world has suffering - it was not part of God''s original "very good" creation.',
    '["Genesis 3", "Romans 5:12 - Sin entered through one man"]',
    '["Genesis 3:1-24", "Romans 5:12-21", "1 Corinthians 15:22"]',
    2,
    true
),
(
    'The Global Flood',
    '~2348 BC',
    'creation',
    NULL,
    NULL,
    'There was no global flood. Flood myths in various cultures are exaggerated local flood memories. The geological column proves millions of years of gradual deposition.',
    'Over 270 flood legends exist in cultures worldwide, all describing a global catastrophic flood with survivors in a boat. Polystrate fossils (trees spanning multiple geological layers) and soft tissue in dinosaur bones suggest rapid burial, not slow processes. Marine fossils on mountaintops worldwide confirm global flooding.',
    '["Genesis 6-9", "Flood legends from Babylon, China, Native American, Hawaiian cultures", "Polystrate fossil documentation", "Dr. Mary Schweitzer - dinosaur soft tissue discoveries"]',
    '["Genesis 6:17", "Genesis 7:11", "2 Peter 3:5-6", "Matthew 24:37-39"]',
    3,
    true
),
(
    'Tower of Babel & Language Origins',
    '~2200 BC',
    'creation',
    NULL,
    NULL,
    'Languages evolved gradually over hundreds of thousands of years from primitive sounds to complex grammar.',
    'All human languages share deep structural similarities suggesting a common origin point. The sudden appearance of fully complex languages in the archaeological record matches the Biblical account of God confusing languages at Babel.',
    '["Genesis 11:1-9", "Linguistic research on language families"]',
    '["Genesis 11:1-9"]',
    4,
    true
),

-- ANCIENT ERA
(
    'Abraham Called by God',
    '~2000 BC',
    'ancient',
    -20,
    NULL,
    'Abraham is considered a legendary figure by some scholars, with his story developing over centuries of oral tradition.',
    'Archaeological discoveries confirm the historical accuracy of Genesis - the cities, customs, names, and trade routes all match the time period described. Abraham''s journey from Ur to Canaan follows known ancient trade routes.',
    '["Genesis 12-25", "Archaeological findings from Ur and surrounding regions"]',
    '["Genesis 12:1-3", "Hebrews 11:8-10", "Galatians 3:6-9"]',
    10,
    true
),
(
    'The Exodus from Egypt',
    '~1446 BC',
    'ancient',
    -15,
    NULL,
    'Many scholars doubt the Exodus happened as described. No Egyptian records mention Hebrew slaves or the plagues.',
    'The Ipuwer Papyrus describes catastrophes matching the plagues. The Berlin Pedestal mentions "Israel" in Egypt. Egyptian records would not publicize defeats. The sudden collapse of the Middle Kingdom matches the Exodus timing. Chariot wheels found in the Red Sea.',
    '["Exodus 1-15", "Ipuwer Papyrus", "Berlin Pedestal", "Red Sea chariot discoveries"]',
    '["Exodus 14:21-31", "Psalm 78:12-16", "Acts 7:36"]',
    11,
    true
),
(
    'King David''s Reign',
    '~1010-970 BC',
    'ancient',
    -10,
    NULL,
    'David was likely a minor tribal chief, not the great king described in the Bible. The united monarchy may be legendary.',
    'The Tel Dan Inscription (1993 discovery) confirms the "House of David" existed. The Mesha Stele also references David''s dynasty. Archaeological evidence of David''s palace has been found in Jerusalem.',
    '["1 Samuel 16 - 1 Kings 2", "Tel Dan Inscription", "Mesha Stele"]',
    '["2 Samuel 7:12-16", "Acts 13:22"]',
    12,
    true
),
(
    'Construction of Solomon''s Temple',
    '~966 BC',
    'ancient',
    -10,
    NULL,
    'The scale of Solomon''s building projects is exaggerated. Israel was too small for such grand structures.',
    'Recent archaeological discoveries at Khirbet Qeiyafa show sophisticated construction in Israel during this period. The detailed descriptions in 1 Kings match known ancient Near Eastern temple designs.',
    '["1 Kings 6-8", "Archaeological findings at Temple Mount"]',
    '["1 Kings 6:1", "2 Chronicles 3:1"]',
    13,
    true
),
(
    'Assyrian Empire Conquers Israel',
    '722 BC',
    'ancient',
    -8,
    NULL,
    'The Northern Kingdom fell to Assyria as recorded in both Biblical and Assyrian accounts.',
    'Assyrian records confirm the conquest of Samaria. The Taylor Prism and other Assyrian records mention specific kings and events also recorded in the Bible. This is one of the most well-documented ancient events.',
    '["2 Kings 17", "Assyrian Royal Annals", "Taylor Prism"]',
    '["2 Kings 17:6-23", "Hosea 13:16"]',
    14,
    true
),
(
    'Babylonian Captivity',
    '586 BC',
    'ancient',
    -6,
    NULL,
    'Babylon conquered Judah and destroyed Jerusalem, as confirmed by both Biblical and Babylonian records.',
    'The Babylonian Chronicles record Nebuchadnezzar''s siege of Jerusalem. The Lachish Letters are actual correspondence from this period. Jeremiah''s prophecy of 70 years captivity was precisely fulfilled.',
    '["2 Kings 25", "Jeremiah 25:11-12", "Babylonian Chronicles", "Lachish Letters"]',
    '["Jeremiah 29:10", "Daniel 9:2"]',
    15,
    true
),

-- CLASSICAL ERA
(
    'Return from Exile & Temple Rebuilt',
    '516 BC',
    'classical',
    -6,
    NULL,
    'Cyrus allowed Jews to return, as recorded in the Cyrus Cylinder.',
    'The Cyrus Cylinder confirms Cyrus''s policy of allowing exiled peoples to return home. Isaiah prophesied Cyrus by name 150 years before he was born (Isaiah 44:28-45:1), demonstrating supernatural foreknowledge.',
    '["Ezra 1-6", "Isaiah 44:28-45:1 (written ~700 BC)", "Cyrus Cylinder"]',
    '["Ezra 1:1-4", "Isaiah 44:28"]',
    20,
    true
),
(
    'Greek Empire under Alexander',
    '336-323 BC',
    'classical',
    -4,
    NULL,
    'Alexander the Great conquered the known world and spread Greek culture.',
    'Daniel prophesied the Greek Empire (the "bronze belly" of the statue, the swift leopard) centuries before Alexander. The prophet even described the empire splitting into four parts after the leader''s sudden death - exactly what happened.',
    '["Daniel 2:39", "Daniel 7:6", "Daniel 8:5-8, 21-22", "Historical records of Alexander"]',
    '["Daniel 8:21-22", "Daniel 11:3-4"]',
    21,
    true
),
(
    'The Maccabean Revolt',
    '167-160 BC',
    'classical',
    -2,
    NULL,
    'Jewish rebels fought against Seleucid oppression, celebrated today as Hanukkah.',
    'Daniel 11 describes the persecution by Antiochus Epiphanes and the resistance in remarkable detail - written centuries before the events. The Books of Maccabees record the historical account. Jesus celebrated Hanukkah (John 10:22).',
    '["Daniel 11:21-35", "1 Maccabees", "Josephus Antiquities"]',
    '["Daniel 11:31-32", "John 10:22"]',
    22,
    true
),
(
    'Birth of Jesus Christ',
    '~5-4 BC',
    'classical',
    -1,
    NULL,
    'Jesus was a historical figure, though the miraculous elements of his birth are considered religious additions by secular scholars.',
    'Over 300 Old Testament prophecies fulfilled in Jesus - his birthplace (Micah 5:2), virgin birth (Isaiah 7:14), lineage (Isaiah 11:1), timing of appearance (Daniel 9:25). The statistical probability of fulfilling just 8 prophecies is 1 in 10^17.',
    '["Matthew 1-2", "Luke 1-2", "Micah 5:2", "Isaiah 7:14", "Daniel 9:25-26"]',
    '["Matthew 2:1", "Luke 2:11", "Galatians 4:4"]',
    23,
    true
),
(
    'Crucifixion and Resurrection',
    '~33 AD',
    'classical',
    1,
    NULL,
    'Jesus was crucified under Pontius Pilate. The resurrection is considered a matter of faith, not history, by secular scholars.',
    'The resurrection has more historical evidence than many accepted ancient events. The empty tomb was never disputed even by enemies. Over 500 eyewitnesses. The transformation of terrified disciples into bold martyrs. The growth of the church despite persecution. No body was ever produced.',
    '["All four Gospels", "1 Corinthians 15:3-8", "Josephus Antiquities 18.3.3", "Tacitus Annals 15.44"]',
    '["1 Corinthians 15:3-8", "Acts 1:3", "Romans 1:4"]',
    24,
    true
),
(
    'Destruction of Jerusalem',
    '70 AD',
    'classical',
    1,
    NULL,
    'The Romans destroyed Jerusalem and the Temple after a Jewish revolt.',
    'Jesus prophesied this destruction in detail 40 years before it happened (Matthew 24, Luke 21). He said not one stone would be left on another - the Temple was so thoroughly destroyed that we still debate its exact location. Josephus, who witnessed it, recorded the fulfillment.',
    '["Matthew 24:1-2", "Luke 21:20-24", "Josephus The Jewish War"]',
    '["Matthew 24:2", "Luke 19:43-44", "Luke 21:24"]',
    25,
    true
),

-- MEDIEVAL ERA
(
    'Council of Nicaea',
    '325 AD',
    'medieval',
    4,
    NULL,
    'Constantine created the Bible at Nicaea, choosing which books to include and establishing Jesus as divine for political purposes.',
    'This is a popular myth but historically false. Nicaea did not determine the Biblical canon - it addressed the Arian controversy about Christ''s nature. The council affirmed what churches had believed for 300 years based on apostolic writings. The canon was recognized, not created.',
    '["Council of Nicaea records", "Early church fathers quoting NT books as Scripture before Nicaea", "Muratorian Fragment (170 AD)"]',
    '["John 1:1-14", "Colossians 2:9", "Hebrews 1:3"]',
    30,
    true
),
(
    'The Council of Carthage',
    '397 AD',
    'medieval',
    4,
    NULL,
    'The church selected which books belonged in the Bible, rejecting many "lost gospels."',
    'The council recognized books already accepted by churches for 300 years. The criteria: apostolic origin, consistent doctrine, widespread acceptance. The "lost gospels" (Gnostic texts) were written 100-200 years after the apostles and contradicted eyewitness accounts.',
    '["Council of Carthage records", "Comparison of canonical gospels (50-95 AD) vs gnostic texts (150-300 AD)"]',
    '["2 Timothy 3:16", "2 Peter 1:20-21"]',
    31,
    true
),
(
    'Fall of Rome',
    '476 AD',
    'medieval',
    5,
    NULL,
    'The Roman Empire fell due to political, economic, and military factors.',
    'Rome''s fall was prophesied in Daniel as the iron legs crumbling into iron and clay (Daniel 2:41-43). The division into nations that would "not remain united" matches European history for 1500 years - no one has successfully reunited Europe despite many attempts.',
    '["Daniel 2:40-43", "Historical records of Rome''s decline"]',
    '["Daniel 2:41-43"]',
    32,
    true
),
(
    'Preservation of Scripture Through Middle Ages',
    '500-1500 AD',
    'medieval',
    NULL,
    NULL,
    'Monks preserved texts through the "Dark Ages," though they made many copying errors.',
    'The Dead Sea Scrolls (discovered 1947) proved the remarkable accuracy of manuscript transmission. Isaiah scrolls from 100 BC matched medieval copies almost perfectly after 1000+ years of copying. God preserved His Word as promised.',
    '["Dead Sea Scrolls comparison studies", "Manuscript evidence"]',
    '["Isaiah 40:8", "Matthew 5:18", "1 Peter 1:25"]',
    33,
    true
),
(
    'The Crusades',
    '1095-1291 AD',
    'medieval',
    11,
    NULL,
    'Religious wars motivated by fanaticism, greed, and intolerance.',
    'The full picture is more complex. The Crusades were a response to 400 years of Islamic expansion that had conquered Christian lands. Many Crusaders were sincere believers, though atrocities occurred on all sides. Primary sources from both Christian and Muslim perspectives should be studied.',
    '["Contemporary chronicles from both sides", "Letters from Crusaders", "Muslim historians like Ibn al-Athir"]',
    '[]',
    34,
    true
),
(
    'Magna Carta',
    '1215 AD',
    'medieval',
    13,
    NULL,
    'A foundational document for constitutional government and human rights.',
    'The Magna Carta was influenced by Biblical concepts of limited government and the rule of law that applies even to kings. The Bible established that even rulers are under God''s law, not above it.',
    '["Magna Carta text", "Deuteronomy 17:14-20 - laws for kings"]',
    '["Deuteronomy 17:18-20", "Romans 13:1-7"]',
    35,
    true
),

-- REFORMATION ERA
(
    'Gutenberg Printing Press',
    '1440 AD',
    'reformation',
    15,
    NULL,
    'A technological revolution that democratized knowledge.',
    'Gutenberg specifically designed his press to print the Bible. Within 50 years, millions of people could read Scripture for themselves. This was God''s providence to prepare for the Reformation and the spread of His Word.',
    '["Gutenberg Bible", "Historical records of early printing"]',
    '["Isaiah 40:8", "Habakkuk 2:2"]',
    40,
    true
),
(
    'Protestant Reformation Begins',
    '1517 AD',
    'reformation',
    16,
    NULL,
    'Luther''s 95 Theses started a religious revolution against Catholic abuses.',
    'Luther rediscovered that salvation is by grace through faith, not by works or payments to the church. He translated the Bible into German so common people could read it. The church had drifted far from Scripture, selling indulgences and keeping the Bible in Latin.',
    '["Luther''s 95 Theses", "Luther''s writings", "Romans and Galatians"]',
    '["Romans 1:17", "Ephesians 2:8-9", "Galatians 2:16"]',
    41,
    true
),
(
    'King James Bible Published',
    '1611 AD',
    'reformation',
    17,
    NULL,
    'An important English translation commissioned by King James I.',
    'The KJV was translated by 47 scholars working from the best available manuscripts. Its beauty and accuracy made Scripture accessible to English speakers worldwide. It shaped the English language itself and was the dominant Bible for 400 years.',
    '["King James Bible preface", "Translators'' notes"]',
    '["2 Timothy 2:15"]',
    42,
    true
),
(
    'Pilgrims Land at Plymouth',
    '1620 AD',
    'reformation',
    17,
    NULL,
    'Pilgrims seeking religious freedom established colonies in America.',
    'The Mayflower Compact explicitly stated they came "for the glory of God and advancement of the Christian faith." Primary documents show America was founded by people seeking to build a society based on Biblical principles.',
    '["Mayflower Compact", "William Bradford''s diary", "Plymouth Colony records"]',
    '["2 Corinthians 3:17", "Galatians 5:1"]',
    43,
    true
),

-- MODERN ERA
(
    'American Declaration of Independence',
    '1776 AD',
    'modern',
    18,
    1770,
    'Enlightenment ideals inspired American independence from Britain.',
    'The Declaration explicitly appeals to "the Laws of Nature and of Nature''s God" and states rights come from "their Creator." The founders, while not all orthodox Christians, built on Biblical principles: human equality (made in God''s image), unalienable rights (from God, not government), moral accountability.',
    '["Declaration of Independence", "Founders'' writings on religion and government"]',
    '["Genesis 1:27", "Proverbs 14:34"]',
    50,
    true
),
(
    'Darwin''s Origin of Species',
    '1859 AD',
    'modern',
    19,
    1850,
    'Darwin discovered evolution by natural selection, explaining the origin of species without divine intervention.',
    'Darwin observed variation within species (which creationists agree with) but extrapolated to explain all life from a common ancestor. His theory requires information to increase through random mutations, but observed mutations lose information. The Cambrian Explosion shows complex life appearing suddenly, not gradually.',
    '["Origin of Species", "Scientific critiques of neo-Darwinism", "Cambrian fossil evidence"]',
    '["Genesis 1:21", "Genesis 1:25"]',
    51,
    true
),
(
    'World War I',
    '1914-1918 AD',
    'modern',
    20,
    1910,
    'The Great War reshaped the world through devastating trench warfare.',
    'WWI ended centuries of optimism about human progress. The war''s devastation showed that without God, "civilized" nations descend into barbarism. The Balfour Declaration during WWI set the stage for Israel''s rebirth.',
    '["Primary documents from WWI", "Balfour Declaration 1917"]',
    '["Jeremiah 17:9", "Romans 3:10-18"]',
    52,
    true
),
(
    'Israel Becomes a Nation',
    '1948 AD',
    'modern',
    20,
    1940,
    'After the Holocaust, the UN partitioned Palestine to create a Jewish state.',
    'The Bible prophesied Israel''s return to the land after worldwide dispersion. Ezekiel 37 describes dry bones coming to life - a nation dead for 2000 years reborn in a day (Isaiah 66:8). This is the greatest prophetic fulfillment in modern times.',
    '["Isaiah 66:8", "Ezekiel 37", "UN Resolution 181", "Declaration of Independence of Israel"]',
    '["Isaiah 66:8", "Ezekiel 37:21-22", "Amos 9:14-15"]',
    53,
    true
),
(
    'Dead Sea Scrolls Discovered',
    '1947 AD',
    'modern',
    20,
    1940,
    'Ancient scrolls found in caves near Qumran provided insight into Second Temple Judaism.',
    'The Dead Sea Scrolls, hidden before 70 AD, proved the Bible text was transmitted accurately for over 1000 years. Critics who claimed the Bible was corrupted over time were silenced. God preserved His Word exactly as He promised.',
    '["Dead Sea Scrolls texts", "Comparison studies with medieval manuscripts"]',
    '["Isaiah 40:8", "Psalm 12:6-7"]',
    54,
    true
),
(
    'Operation Paperclip',
    '1945-1959 AD',
    'modern',
    20,
    1940,
    'The US recruited German scientists after WWII to advance American technology.',
    'Declassified documents reveal the US secretly brought over 1,600 Nazi scientists, engineers, and technicians to America. Many had been members of the Nazi Party and some were implicated in war crimes. The program was hidden from the public and Congress. This shaped NASA, the CIA, and US military technology.',
    '["Declassified Operation Paperclip documents", "National Archives records", "Jacobsen, Annie - Operation Paperclip"]',
    '[]',
    55,
    true
),
(
    'MKUltra Mind Control Program',
    '1953-1973 AD',
    'modern',
    20,
    1950,
    'For decades this was dismissed as conspiracy theory.',
    'Declassified CIA documents confirm MKUltra was real. The CIA conducted illegal experiments on unwitting American citizens using drugs (especially LSD), hypnosis, and psychological torture to develop mind control techniques. Many documents were destroyed in 1973. What we know comes from files that survived.',
    '["Declassified CIA documents", "Church Committee hearings 1975", "FOIA releases"]',
    '["Proverbs 12:22", "Ephesians 5:11"]',
    56,
    true
),
(
    'Gulf of Tonkin Incident',
    '1964 AD',
    'modern',
    20,
    1960,
    'North Vietnam attacked US ships, justifying American involvement in Vietnam.',
    'Declassified NSA documents (2005) prove the second attack never happened. President Johnson used the non-existent attack to pass the Gulf of Tonkin Resolution, escalating the Vietnam War. This cost 58,000 American lives and over 1 million Vietnamese.',
    '["NSA declassified report 2005", "LBJ Presidential Library recordings"]',
    '["Proverbs 6:16-19", "Exodus 20:16"]',
    57,
    true
),
(
    'COINTELPRO Exposed',
    '1956-1971 AD',
    'modern',
    20,
    1960,
    'FBI surveillance programs to protect national security.',
    'Declassified FBI documents reveal COINTELPRO illegally surveilled, infiltrated, and disrupted American political organizations - including civil rights leaders, anti-war protesters, and even Congress members. The FBI tried to blackmail Martin Luther King Jr. into suicide.',
    '["Church Committee Final Report", "Declassified FBI COINTELPRO files"]',
    '["Psalm 94:20", "Proverbs 29:12"]',
    58,
    true
),

-- CURRENT ERA
(
    'September 11 Attacks',
    '2001 AD',
    'current',
    21,
    2000,
    'Al-Qaeda terrorists hijacked planes and attacked America, killing nearly 3,000 people.',
    'The 9/11 attacks were a real tragedy. However, many questions remain unanswered. The 9/11 Commission Report itself notes it did not receive full cooperation. Building 7 collapsed without being hit by a plane. Primary sources include the Commission Report, NIST reports, and eyewitness testimonies.',
    '["9/11 Commission Report", "NIST reports", "Eyewitness accounts"]',
    '["Psalm 46:1", "Romans 8:28"]',
    60,
    true
),
(
    'Iraq War and WMD Claims',
    '2003 AD',
    'current',
    21,
    2000,
    'The US invaded Iraq because intelligence showed weapons of mass destruction.',
    'Declassified documents and the Chilcot Inquiry reveal intelligence was manipulated to justify a predetermined decision to invade. No WMDs were found. The war cost thousands of American lives and hundreds of thousands of Iraqi civilians.',
    '["Chilcot Report 2016", "Declassified intelligence assessments", "CIA Inspector General Report"]',
    '["Proverbs 24:6", "James 4:1-2"]',
    61,
    true
),
(
    'Mass Surveillance Revealed',
    '2013 AD',
    'current',
    21,
    2010,
    'Edward Snowden was a traitor who endangered national security.',
    'Snowden''s leaked NSA documents revealed the US government was illegally collecting data on millions of Americans without warrants. Programs like PRISM gave the government access to private communications from major tech companies. Courts later ruled some programs unconstitutional.',
    '["Snowden document releases", "Court rulings on NSA programs", "Congressional testimony"]',
    '["Proverbs 15:3", "Ecclesiastes 12:14"]',
    62,
    true
),
(
    'COVID-19 Origin Debate',
    '2020-Present',
    'current',
    21,
    2020,
    'The virus had natural origins from a wet market in Wuhan.',
    'Initially dismissed as conspiracy theory, the lab leak hypothesis gained credibility. Declassified intelligence assessments now say a lab leak is plausible. The Wuhan Institute of Virology was researching coronaviruses. Early attempts to investigate were blocked. The full truth may never be known.',
    '["Declassified intelligence reports", "Congressional hearings", "Scientific papers on virus origins"]',
    '["John 8:32"]',
    63,
    true
);

-- ============================================
-- SCIENCE CONCEPTS
-- ============================================

INSERT INTO public.textbook_concepts (title, branch, prerequisite_ids, why_it_matters, what_we_observe, what_models_say, what_we_dont_know, key_ideas, sort_order, approved)
VALUES
-- MATTER
(
    'What is Matter?',
    'matter',
    '{}',
    'Everything you can touch, taste, or smell is made of matter. Understanding matter helps you understand how the world around you works.',
    '["Everything has weight (mass) and takes up space", "Matter can be solid, liquid, or gas", "You can change matter by heating, cooling, or mixing", "Matter doesn''t appear from nothing or disappear into nothing"]',
    'Scientists describe matter as being made of tiny particles called atoms. Atoms are made of even smaller particles (protons, neutrons, electrons). This model helps predict how matter will behave.',
    'We cannot actually see atoms - we infer their existence from experiments. Why matter exists at all is a profound mystery. Why the particular atoms we observe exist (and not others) is unknown.',
    '["Mass - how much matter something has", "Volume - how much space it takes up", "States of matter - solid, liquid, gas", "Conservation - matter is not created or destroyed, only changed"]',
    1,
    true
),
(
    'Atoms & Elements',
    'matter',
    '{}',
    'Everything is made of a relatively small number of building blocks combined in different ways - like letters forming words.',
    '["Pure substances behave consistently", "Elements combine in fixed ratios", "The periodic table organizes elements by properties", "Different elements have different weights and behaviors"]',
    'The atomic model describes tiny particles with a nucleus (protons, neutrons) and orbiting electrons. This model successfully predicts chemical behavior and has been refined over 200 years.',
    'Why do exactly these elements exist and not others? What gives matter its properties? The model is useful but may be an approximation of something deeper we don''t yet understand.',
    '["Elements are pure substances that cannot be broken down further by ordinary chemistry", "Compounds are elements combined in fixed ratios", "The periodic table organizes elements by atomic structure"]',
    2,
    true
),
(
    'Mixtures & Solutions',
    'matter',
    '{}',
    'Most things in daily life are mixtures. Understanding how to mix, separate, and purify substances is essential for cooking, cleaning, medicine, and more.',
    '["Some things dissolve in water, others don''t", "You can separate mixtures by filtering, evaporating, or other methods", "Temperature affects how much dissolves", "Oil and water don''t mix"]',
    'Dissolution is explained by molecules interacting - polar substances dissolve in polar solvents, nonpolar in nonpolar ("like dissolves like").',
    'Why do some substances mix and others don''t at a fundamental level? The explanations we have are descriptive rather than truly explanatory.',
    '["Solutions - uniform mixtures where one substance dissolves in another", "Suspensions - mixtures where particles float but don''t dissolve", "Separating mixtures - filtration, evaporation, distillation"]',
    3,
    true
),
(
    'Chemical Reactions',
    'matter',
    '{}',
    'Cooking, rusting, burning, digestion - these all involve chemical reactions. Understanding them helps you work with matter safely and effectively.',
    '["Burning produces heat, light, and new substances", "Rust forms when iron is exposed to water and air", "Cooking changes food permanently", "Some reactions are reversible, others aren''t"]',
    'Chemical reactions involve atoms rearranging into new combinations. Energy is absorbed or released. Conservation laws mean atoms aren''t created or destroyed.',
    'Why do certain reactions happen and others don''t? Why do reactions have the rates they do? Models predict outcomes but don''t fully explain why.',
    '["Reactants become products", "Energy changes - endothermic (absorbs heat) vs exothermic (releases heat)", "Catalysts speed up reactions without being consumed"]',
    4,
    true
),

-- ENERGY
(
    'What is Energy?',
    'energy',
    '{}',
    'Energy is one of the most important concepts in science. Understanding it helps you understand everything from why you need food to how the sun shines.',
    '["Things can move, heat up, light up, make sound", "These abilities seem related - heat can make things move, movement can create heat", "Energy seems to change form but the total amount stays constant", "We measure energy in various ways (calories, joules, watts)"]',
    'Energy is defined as the ability to do work. It exists in forms (kinetic, potential, thermal, chemical, etc.) and transforms between them. The First Law of Thermodynamics says total energy is conserved.',
    'What IS energy, fundamentally? We can describe its behavior and measure it, but its essential nature remains mysterious. It''s almost a placeholder word for "the ability to cause change."',
    '["Energy is the ability to do work or cause change", "Energy changes form but isn''t created or destroyed", "Common forms: kinetic (motion), potential (stored), thermal (heat), chemical"]',
    10,
    true
),
(
    'Heat & Temperature',
    'energy',
    '{}',
    'Understanding heat helps you cook, stay warm, prevent spoilage, and work with materials safely.',
    '["Hot things cool down, cold things warm up until they match", "Heat flows from hot to cold, never the reverse naturally", "Different materials conduct heat differently", "Thermometers measure temperature"]',
    'Temperature measures average molecular motion. Heat is energy transfer due to temperature difference. The Second Law of Thermodynamics describes heat flow direction.',
    'Why does heat always flow from hot to cold? The laws describe what happens but don''t explain why at the deepest level. What determines the direction of time?',
    '["Temperature measures how hot or cold something is", "Heat is energy flowing from hot to cold", "Conduction, convection, radiation - ways heat travels", "Insulators slow heat transfer, conductors speed it up"]',
    11,
    true
),
(
    'Light',
    'energy',
    '{}',
    'Light lets us see, grow food, communicate, and understand the universe. It''s essential for life and technology.',
    '["Light travels in straight lines", "Light reflects off surfaces", "Light bends when passing between materials (refraction)", "White light splits into colors", "We only see a small part of the electromagnetic spectrum"]',
    'Light is described as electromagnetic waves or particles (photons) depending on the experiment. The wave-particle duality is a central mystery of modern physics.',
    'What IS light? It behaves like a wave AND like a particle, which seems contradictory. How can something be both? Our models work but may not capture reality.',
    '["Light travels very fast (about 186,000 miles per second)", "Reflection - light bouncing off surfaces", "Refraction - light bending when entering new materials", "Spectrum - light comes in many wavelengths (colors)"]',
    12,
    true
),
(
    'Sound',
    'energy',
    '{}',
    'Sound is how we communicate, enjoy music, detect danger, and experience much of the world around us.',
    '["Sound needs a medium to travel (can''t travel through vacuum)", "Sound travels slower than light", "Pitch relates to frequency, loudness to amplitude", "Sound reflects (echoes), absorbs, and bends"]',
    'Sound is described as mechanical waves - compressions and rarefactions traveling through matter. Frequency determines pitch, amplitude determines volume.',
    'How does vibrating air become experience of music in our minds? The physics is well understood but the connection to conscious experience is not.',
    '["Sound is vibrations traveling through matter", "Frequency determines pitch (high/low)", "Amplitude determines volume (loud/soft)", "Sound travels at different speeds through different materials"]',
    13,
    true
),
(
    'Electricity',
    'energy',
    '{}',
    'Electricity powers nearly everything in modern life. Understanding it helps you use it safely and effectively.',
    '["Some materials conduct electricity, others don''t", "Electricity flows in circuits (complete paths)", "Static electricity builds up and discharges", "Electricity and magnetism are related", "Electricity can be dangerous"]',
    'Electric current is described as flowing electrons. Voltage is electrical pressure, current is flow rate, resistance opposes flow. Ohm''s Law relates these.',
    'What IS electric charge at the fundamental level? Why do like charges repel and opposite charges attract? We describe the behavior without knowing the ultimate cause.',
    '["Current - flow of electric charge", "Voltage - electrical pressure/potential difference", "Resistance - opposition to current flow", "Circuits - complete paths for electricity to flow"]',
    14,
    true
),

-- FORCES & MOTION
(
    'Motion',
    'forces',
    '{}',
    'Understanding motion helps you throw a ball, drive safely, design machines, and predict how things will move.',
    '["Objects at rest stay at rest unless pushed or pulled", "Moving objects keep moving unless something stops them", "Objects speed up, slow down, and change direction", "Motion is relative - depends on your reference point"]',
    'Newton''s Laws describe motion mathematically. Objects resist changes in motion (inertia). Force equals mass times acceleration. Every action has an equal and opposite reaction.',
    'Why do Newton''s Laws work? What IS inertia at a fundamental level? The laws describe behavior perfectly but don''t explain why matter resists acceleration.',
    '["Speed - how fast something moves", "Velocity - speed with direction", "Acceleration - change in velocity", "Inertia - resistance to changes in motion"]',
    20,
    true
),
(
    'Forces',
    'forces',
    '{}',
    'Forces are pushes and pulls that make things move, stop, or change shape. Understanding forces helps you build, move, and work effectively.',
    '["Pushes and pulls change motion", "Multiple forces can combine or cancel out", "Friction opposes motion between surfaces", "Forces can act at a distance (magnets, static electricity)"]',
    'Forces are described mathematically as vectors (direction and magnitude). Net force determines acceleration. Forces come in pairs (Newton''s Third Law).',
    'What IS a force at the deepest level? How do forces act at a distance? These questions lead to deep physics that even scientists debate.',
    '["Force is a push or pull", "Net force - combination of all forces", "Balanced forces mean no acceleration", "Unbalanced forces cause acceleration"]',
    21,
    true
),
(
    'Simple Machines',
    'forces',
    '{}',
    'Simple machines multiply force, change direction, or trade distance for force. They''re the basis of all tools and complex machines.',
    '["A lever makes lifting easier", "A ramp requires less force than lifting straight up", "Pulleys change force direction and can multiply force", "Wheels reduce friction", "Screws are really spiral ramps"]',
    'Simple machines trade force for distance (mechanical advantage). No machine creates energy - they just transform or redirect it. Efficiency measures how much input becomes useful output.',
    'The math works perfectly, but why do these relationships hold? Why can''t we get more out than we put in? These are deep questions about the nature of energy.',
    '["Lever - a bar that pivots on a fulcrum", "Inclined plane - a ramp", "Wedge - two inclined planes back-to-back", "Screw - an inclined plane wrapped around a cylinder", "Wheel and axle", "Pulley"]',
    22,
    true
),
(
    'Friction',
    'forces',
    '{}',
    'Friction is everywhere. It lets you walk, write, and hold things. It also causes wear and wastes energy. Understanding friction helps you work with it.',
    '["Rough surfaces have more friction than smooth ones", "Friction produces heat", "Lubricants reduce friction", "Friction depends on the materials and force pressing them together"]',
    'Friction is described as surface irregularities interlocking. Static friction (not moving) is usually greater than kinetic friction (sliding). Friction force = coefficient x normal force.',
    'At the atomic level, friction is surprisingly complex. Why do certain materials have the friction coefficients they do? The simple models are approximations of complex surface interactions.',
    '["Static friction - resistance to starting motion", "Kinetic friction - resistance to continuing motion", "Friction always opposes the direction of motion", "Lubrication reduces friction by separating surfaces"]',
    23,
    true
),

-- GRAVITY
(
    'What is Gravity?',
    'gravity',
    '{}',
    'Gravity keeps you on the ground, the Moon orbiting Earth, and Earth orbiting the Sun. It shapes the entire universe.',
    '["Things fall when released", "Heavier objects push down harder but fall at the same speed as light ones (ignoring air resistance)", "The Moon orbits Earth, Earth orbits Sun", "Tides are caused by gravitational pull of Moon and Sun"]',
    'Newton described gravity as a force between masses (bigger masses, stronger force; greater distance, weaker force). Einstein described gravity not as a force but as the curvature of spacetime caused by mass. Both models predict observations accurately in their domains.',
    'What IS gravity? Newton''s model says it''s a force but doesn''t explain how masses "know" about each other across space. Einstein''s model says it''s geometry but doesn''t explain what spacetime IS or why mass curves it. Nobody knows what gravity actually is at the fundamental level.',
    '["Objects attract each other based on their masses", "Gravity gets weaker with distance", "Newton described it as a force; Einstein described it as curved spacetime", "Both are models that make accurate predictions - neither is the final truth"]',
    30,
    true
),
(
    'Weight vs Mass',
    'gravity',
    '{}',
    'Understanding the difference between weight and mass helps you understand gravity and avoid confusion in science.',
    '["Your weight changes on different planets but your mass stays the same", "Astronauts are weightless in orbit but still have mass", "Mass is measured with a balance, weight with a scale"]',
    'Mass is the amount of matter (measured in kilograms). Weight is the gravitational force on that mass (measured in Newtons). Weight = mass x gravitational acceleration.',
    'What IS mass? Why does matter resist acceleration (inertia)? The Higgs field explains how particles gain mass, but this just pushes the mystery back - what is the Higgs field?',
    '["Mass - amount of matter, doesn''t change with location", "Weight - gravitational force on an object, changes with gravity", "On Moon (weaker gravity) you weigh less but have the same mass"]',
    31,
    true
),
(
    'Orbits',
    'gravity',
    '{}',
    'Understanding orbits explains how satellites work, why we have seasons, and how to navigate using the Sun and stars.',
    '["The Moon orbits Earth, Earth orbits Sun", "Orbits are elliptical (oval), not perfect circles", "Satellites stay up because they''re moving sideways as fast as they fall", "Closer objects orbit faster"]',
    'Objects in orbit are constantly falling toward what they orbit but moving sideways fast enough to keep missing. Kepler''s laws describe orbital shapes and speeds mathematically.',
    'Why does gravity work this way? Why do orbits follow these precise mathematical laws? The equations describe the patterns but don''t explain why these patterns exist.',
    '["Orbit - a curved path around another object caused by gravity", "Objects in orbit are in constant free fall", "Orbital speed and distance are related - closer = faster"]',
    32,
    true
),

-- GROWING THINGS
(
    'Seeds & Germination',
    'growing',
    '{}',
    'Understanding seeds helps you grow your own food, save seeds, and appreciate the miracle of life.',
    '["Seeds contain a tiny plant and food supply", "Seeds need water, warmth, and sometimes light to germinate", "Different seeds need different conditions", "Seeds can stay dormant for years"]',
    'Germination is described as a process triggered by environmental conditions. Enzymes activate, stored food is used, the embryo grows, and the seedling emerges.',
    'What triggers a seed to "know" when to germinate? How does a tiny seed contain the information to build a complex plant? The genetic code stores information, but how it unfolds into a living organism is still being studied.',
    '["Seeds contain an embryo (tiny plant), food supply, and seed coat", "Germination - when a seed starts to grow", "Seeds need water, warmth, oxygen, and sometimes light or cold treatment"]',
    40,
    true
),
(
    'Soil & Composting',
    'growing',
    '{}',
    'Healthy soil grows healthy plants. Understanding soil helps you garden successfully and care for God''s creation.',
    '["Plants grow better in rich, dark soil", "Dead plants and animals break down into soil", "Worms and bugs help make soil", "Adding compost improves poor soil"]',
    'Soil is described as a mixture of minerals (from rock), organic matter (from dead organisms), water, air, and living organisms. Decomposers break down organic matter, releasing nutrients.',
    'Soil is incredibly complex - a single handful contains billions of organisms. We''re still discovering how all these organisms interact to create healthy soil.',
    '["Soil components - minerals, organic matter, water, air, organisms", "Composting - controlled decomposition of organic matter", "Soil pH - acidity or alkalinity affects nutrient availability"]',
    41,
    true
),
(
    'Photosynthesis',
    'growing',
    '{}',
    'Photosynthesis is how plants make food from sunlight. It''s the foundation of almost all food chains and produces the oxygen we breathe.',
    '["Plants need light to grow", "Plants take in carbon dioxide and release oxygen", "Plants are green because of chlorophyll", "Plants use sunlight, water, and carbon dioxide to make sugar"]',
    'Photosynthesis is described as a chemical process where chlorophyll captures light energy to convert carbon dioxide and water into glucose and oxygen.',
    'How did such a complex process originate? The molecular machinery of photosynthesis is incredibly sophisticated. Its origin is a profound mystery.',
    '["Plants use light energy to make sugar from carbon dioxide and water", "Oxygen is released as a byproduct", "Chlorophyll is the green pigment that captures light"]',
    42,
    true
),
(
    'Plant Life Cycles',
    'growing',
    '{}',
    'Understanding plant life cycles helps you plan gardens, save seeds, and work with nature''s rhythms.',
    '["Some plants live one year (annuals), some two (biennials), some many (perennials)", "Plants flower, produce seeds, and die or go dormant", "Some plants reproduce without seeds (bulbs, runners, cuttings)"]',
    'Life cycles are described as genetic programs responding to environmental signals (day length, temperature, etc.).',
    'How do plants "know" what season it is? How do they count days? These sensing mechanisms are complex and still being studied.',
    '["Annual - completes life cycle in one year", "Biennial - takes two years to complete life cycle", "Perennial - lives many years", "Plants sense day length and temperature to time their cycles"]',
    43,
    true
),

-- ANIMALS
(
    'Animal Classification',
    'animals',
    '{}',
    'Classification helps us understand and identify the amazing variety of animals God created.',
    '["Animals can be grouped by similar features", "Major groups: mammals, birds, reptiles, amphibians, fish, insects", "Animals in the same group share characteristics"]',
    'Classification systems organize animals by shared characteristics. Modern systems use genetics in addition to physical features.',
    'Where do the boundaries between groups lie? Classification is a human system imposed on nature''s continuous variation. Some animals don''t fit neatly into categories.',
    '["Vertebrates have backbones; invertebrates don''t", "Mammals - warm-blooded, hair/fur, milk for young", "Birds - warm-blooded, feathers, lay eggs", "Classification helps us identify and understand animals"]',
    50,
    true
),
(
    'Animal Behavior',
    'animals',
    '{}',
    'Understanding animal behavior helps you work with animals, raise livestock, and appreciate God''s creatures.',
    '["Animals have instincts - behaviors they''re born knowing", "Animals can also learn", "Animals communicate in various ways", "Migration, hibernation, and other seasonal behaviors"]',
    'Behavior is described as resulting from genetics (instinct) and experience (learning). Hormones and nervous systems control behavior.',
    'Do animals think? Are they conscious? These are philosophical questions that science can''t fully answer. What is instinct really, and how does it get encoded in DNA?',
    '["Instinct - built-in behavior patterns", "Learned behavior - acquired through experience", "Communication - signals between animals", "Animals behave in ways suited to their environment and needs"]',
    51,
    true
),
(
    'Caring for Animals',
    'animals',
    '{}',
    'God gave humans responsibility to care for animals. Understanding their needs helps us do this well.',
    '["Different animals need different food, shelter, and care", "Animals need clean water, appropriate food, shelter, and space", "Animals can get sick and need treatment", "Baby animals often need special care"]',
    'Animal husbandry is the care and breeding of animals. Nutrition, veterinary science, and behavior all inform good animal care.',
    'What do animals experience? How do we balance using animals for food and work with caring for their wellbeing? These are ethical questions beyond science alone.',
    '["Animals need food, water, shelter, and care suited to their species", "Observe animals to notice when something is wrong", "Prevention is better than treatment", "Each kind of animal has specific needs"]',
    52,
    true
),

-- FOOD & PRESERVATION
(
    'Food Preservation Basics',
    'food',
    '{}',
    'Preserving food prevents waste and provides for times of scarcity. Our ancestors survived by mastering these skills.',
    '["Food spoils due to microorganisms, enzymes, and oxidation", "Drying, salting, smoking, and fermenting have been used for thousands of years", "Cold slows spoilage; freezing nearly stops it", "Canning and brining kill or prevent microbial growth"]',
    'Food preservation works by removing conditions microbes need (water, warmth, oxygen) or by killing microbes with heat, acid, salt, or smoke.',
    'The precise mechanisms vary and are complex. Fermentation, for example, involves intricate microbial communities that are still being studied.',
    '["Microorganisms cause most food spoilage", "Remove water (drying), add salt or acid, remove air, add heat, or reduce temperature to preserve food", "Different methods work better for different foods"]',
    60,
    true
),
(
    'Fermentation',
    'food',
    '{}',
    'Fermentation transforms food, enhances nutrition, aids digestion, and creates unique flavors. It''s an ancient art and essential science.',
    '["Fermentation produces bubbles, alcohol, or acid depending on the process", "Fermented foods last longer than fresh", "Many traditional foods are fermented: bread, cheese, sauerkraut, yogurt, kimchi", "Fermentation changes flavor and sometimes nutrition"]',
    'Fermentation is described as anaerobic metabolism by microorganisms, converting sugars to acids, gases, or alcohol.',
    'The microbial communities in fermented foods are extremely complex. Each batch is unique. We''re still learning how these communities work and how to guide them.',
    '["Fermentation - microorganisms converting sugars to other substances", "Lactic acid fermentation - makes sauerkraut, kimchi, yogurt", "Alcoholic fermentation - makes bread rise, produces wine and beer", "Fermented foods often have enhanced nutrition and probiotics"]',
    61,
    true
),
(
    'Nutrition Basics',
    'food',
    '{}',
    'Understanding nutrition helps you make wise food choices and maintain health.',
    '["We need different types of nutrients: proteins, fats, carbohydrates, vitamins, minerals", "Different foods provide different nutrients", "Too much or too little of nutrients causes problems", "Our bodies convert food into energy and building materials"]',
    'Nutrition science describes required nutrients, recommended amounts, and metabolic pathways. Macronutrients provide energy; micronutrients enable body functions.',
    'Nutritional science is constantly evolving and often contradictory. What''s "healthy" seems to change frequently. Individual needs vary greatly. Much remains unknown about optimal human nutrition.',
    '["Macronutrients - proteins, fats, carbohydrates (needed in large amounts)", "Micronutrients - vitamins and minerals (needed in small amounts)", "Whole, unprocessed foods generally provide better nutrition", "Nutritional needs vary by individual"]',
    62,
    true
),

-- NATURAL HEALTH
(
    'The Immune System',
    'health',
    '{}',
    'Understanding your immune system helps you stay healthy and recover from illness.',
    '["Your body fights off most germs automatically", "Fever, inflammation, and tiredness during illness are the body fighting infection", "Getting sick once often prevents getting the same illness again", "Rest, nutrition, and hydration help recovery"]',
    'The immune system is described as a complex network of cells, tissues, and organs that recognize and fight pathogens. Innate immunity provides immediate defense; adaptive immunity learns and remembers.',
    'The immune system is incredibly complex - we''re still discovering new components. How the body distinguishes self from non-self, and how immune memory works at the molecular level, are active research areas.',
    '["Your body has multiple layers of defense against germs", "Fever is the body''s way of fighting infection", "The immune system can remember past infections", "Healthy lifestyle supports immune function"]',
    70,
    true
),
(
    'Medicinal Plants & Herbs',
    'health',
    '{}',
    'God provided plants for food and medicine. Understanding herbal medicine connects us to traditional wisdom.',
    '["Many modern medicines come from plants", "Herbs have been used medicinally for thousands of years", "Plants contain active compounds that affect the body", "Different parts of plants (leaves, roots, bark) may have different uses"]',
    'Pharmacognosy is the study of medicinal compounds from natural sources. Active compounds can be isolated, studied, and sometimes synthesized.',
    'We don''t fully understand how many traditional remedies work. Plants contain complex mixtures of compounds that may work together. Scientific validation of traditional uses is ongoing.',
    '["Many plants have medicinal properties", "Active compounds - specific chemicals that cause effects", "Traditional knowledge holds valuable information", "Plants should be used carefully - natural doesn''t mean safe for everyone"]',
    71,
    true
),
(
    'First Aid Basics',
    'health',
    '{}',
    'First aid skills can save lives. Everyone should know basic responses to common emergencies.',
    '["Wounds need cleaning and protection", "Bleeding can be stopped with pressure", "Burns need cooling", "Broken bones need immobilization", "Know when to get professional help"]',
    'First aid is based on understanding body systems and how to support them during emergencies. Training provides protocols based on medical evidence.',
    'Emergency medicine continues to evolve. Some traditional first aid practices have been revised based on new research. Always learn current techniques from qualified sources.',
    '["Stop severe bleeding with direct pressure", "Clean wounds to prevent infection", "Cool burns with cool (not ice cold) water", "Immobilize suspected fractures", "Know when emergency requires professional help"]',
    72,
    true
),

-- WEATHER & NAVIGATION
(
    'Understanding Weather',
    'weather',
    '{}',
    'Understanding weather helps you plan activities, stay safe, and appreciate God''s creation.',
    '["Weather changes constantly but follows patterns", "Wind, clouds, temperature, and humidity all interact", "Pressure changes often predict weather changes", "Seasons have characteristic weather patterns"]',
    'Weather is described as the state of the atmosphere resulting from solar heating, Earth''s rotation, water cycles, and geography interacting.',
    'Weather prediction has improved but remains limited. The atmosphere is a chaotic system where small changes can have large effects. We cannot predict weather more than about 10 days ahead.',
    '["Weather is the state of the atmosphere at a given time and place", "High pressure usually means fair weather; low pressure means storms", "Clouds indicate what''s happening in the atmosphere", "Fronts are boundaries between air masses"]',
    80,
    true
),
(
    'Reading the Sky',
    'weather',
    '{}',
    'Before modern forecasting, people read the sky to predict weather. These skills are still valuable.',
    '["Red sky at night, sailor''s delight; red sky in morning, sailor''s warning", "Certain cloud types predict certain weather", "Birds and animals often sense weather changes", "Wind direction and changes indicate weather patterns"]',
    'These traditional observations are based on real atmospheric phenomena. Red skies indicate dust particles in dry air; cloud types indicate atmospheric stability.',
    'Traditional weather lore isn''t always accurate - it depends on local conditions and latitude. Some folk wisdom is reliable; some is not.',
    '["Learn to recognize cloud types and what they indicate", "Observe patterns in your local area", "Wind shifts often precede weather changes", "Natural signs can supplement forecasts"]',
    81,
    true
),
(
    'Navigation Without Electronics',
    'weather',
    '{}',
    'Knowing how to find your way without electronics is an essential survival skill and connects you to your ancestors.',
    '["The sun rises in the east and sets in the west", "The North Star indicates true north in the Northern Hemisphere", "Shadows, plants, and other natural signs can indicate direction", "Maps and compasses work without batteries"]',
    'Navigation is based on understanding Earth''s rotation, the positions of celestial bodies, and magnetic fields.',
    'Magnetic north is not true north - the difference (declination) varies by location. Magnetic poles also drift over time. Natural navigation signs can be unreliable in some conditions.',
    '["Sun moves from east to west (appears to)", "Find north using the North Star or sun position", "A compass points to magnetic north, which differs from true north", "Develop awareness of direction and position habitually"]',
    82,
    true
),

-- WATER
(
    'The Water Cycle',
    'water',
    '{}',
    'Understanding the water cycle explains where our water comes from and where it goes.',
    '["Water evaporates from oceans, lakes, and land", "Water vapor rises, cools, and forms clouds", "Water falls as rain, snow, sleet, or hail", "Water flows back to oceans through streams and groundwater"]',
    'The water cycle is described as solar-driven evaporation, condensation, precipitation, and collection in an endless loop.',
    'Water cycles through the environment but we don''t fully understand all the pathways, especially underground. Human activities are affecting water cycles in complex ways.',
    '["Evaporation - liquid water becomes water vapor", "Condensation - water vapor becomes liquid droplets (clouds)", "Precipitation - water falls from clouds", "Collection - water gathers in oceans, lakes, groundwater"]',
    90,
    true
),
(
    'Water Purification',
    'water',
    '{}',
    'Access to clean water is essential for life. Knowing how to purify water could save your life.',
    '["Unclear water may contain harmful microorganisms", "Boiling kills most pathogens", "Filtering removes particles and some contaminants", "Chemical treatment can kill microorganisms"]',
    'Water purification removes or kills pathogens and removes harmful chemicals using physical (filtration, UV), chemical (chlorine, iodine), or thermal (boiling) methods.',
    'No method removes all contaminants. Different methods are effective against different threats. Water testing is the only way to know if water is truly safe.',
    '["Boiling for 1-3 minutes kills most pathogens", "Filtering removes particles but not all microorganisms", "Chemical treatment (iodine, chlorine) kills most microorganisms", "Multiple methods together are most effective"]',
    91,
    true
),

-- LIFE (General biology)
(
    'Cells - Building Blocks of Life',
    'life',
    '{}',
    'Understanding cells helps you understand how all living things work, from bacteria to humans.',
    '["All living things are made of cells", "Some organisms are single cells; others have trillions", "Cells have different parts with different jobs", "Cells come from other cells - they don''t appear from nothing"]',
    'Cell theory describes cells as the basic unit of life, with common structures (membrane, cytoplasm, genetic material) and processes.',
    'How the first cell came to be is unknown and deeply mysterious. The simplest cells are incredibly complex - far more so than any human technology. The origin of life remains unexplained.',
    '["All living things are made of cells", "Cells have structures (organelles) that perform specific functions", "Cells reproduce by dividing", "The origin of the first cells is a profound mystery"]',
    100,
    true
),
(
    'DNA & Genetics',
    'life',
    '{}',
    'DNA carries the information that makes you, you. Understanding genetics helps you understand inheritance, health, and life itself.',
    '["Children resemble parents because of inherited traits", "Traits follow patterns across generations", "DNA is found in cells and carries genetic information", "DNA can be damaged or have errors"]',
    'DNA is described as a double helix containing coded instructions using four chemical "letters." Genes are segments of DNA that code for proteins. Mutations are changes in DNA sequence.',
    'How did the genetic code originate? How does DNA encode the information to build a complex organism? Information in DNA seems to require an intelligent source, but this is debated. The relationship between DNA and the traits it produces is far more complex than simple one-gene-one-trait models suggest.',
    '["DNA contains coded instructions for building organisms", "Genes are segments of DNA that code for specific traits", "Children inherit DNA from both parents", "The genetic code is universal across all known life"]',
    101,
    true
),
(
    'Ecosystems',
    'life',
    '{}',
    'Understanding ecosystems helps you see how all living things are connected and how to care for creation.',
    '["Living things depend on each other", "Energy flows from sun to plants to animals", "Nutrients cycle through ecosystems", "Changes to one part affect other parts"]',
    'Ecosystems are described as communities of organisms interacting with their physical environment through energy flow and nutrient cycles.',
    'Ecosystems are incredibly complex. We can''t fully predict how they will respond to changes. The "balance of nature" is more dynamic and complex than simple models suggest.',
    '["Producers (plants) capture energy from sunlight", "Consumers (animals) get energy by eating other organisms", "Decomposers break down dead organisms and recycle nutrients", "Ecosystems can be disrupted by changes to any component"]',
    102,
    true
);
