-- Migration: Import AppWrite Template Data
-- Generated: 2026-02-07 05:09:48
-- Source: AppWrite Backup

-- Disable triggers during import
SET session_replication_role = replica;

-- ============================================================================
-- Support Directory (10 organizations)
-- ============================================================================

TRUNCATE TABLE support_directory CASCADE;

INSERT INTO support_directory (name, category, phone, location, address, description_am, description_en, description_or, verified, lat, lng)
VALUES
  ('EWLA Legal Hotline', 'hotline', '7711', 'National (Addis Ababa)', 'Kirkos Sub-city', 'ነፃ የህግ ምክር እና የጥበቃ አገልግሎት።', 'Free legal advice and protection services via toll-free hotline.', 'Gargaarsa seeraa bilisaa fi tajaajila eegumsaa sarara bilbilaa bilisaatiin.', true, 9.0125, 38.7512),
  ('Setaweet Counseling', 'counseling', '8044', 'Addis Ababa', 'Bole Sub-city', 'ለሴቶች የስነ-ልቦና ድጋፍ እና የምክር አገልግሎት።', 'Feminist-led psychological support and counseling for women.', 'Deeggarsa xiinsammuu fi gorsa dubartootaaf dubartootaan durfamu.', true, 8.995, 38.788),
  ('Red Cross Emergency', 'medical', '907', 'National', 'Stadium Area', 'የአደጋ ጊዜ አምቡላንስ እና የመጀመሪያ እርዳታ።', '24/7 Emergency ambulance and first aid medical services.', 'Tajaajila ambulaansii hatattamaa fi gargaarsa jalqabaa yaalaa.', true, 9.015, 38.75),
  ('Federal Police SOS', 'hotline', '991', 'National', 'Mexico Square', 'አስቸኳይ የፖሊስ እርዳታ።', 'Immediate 24-hour police emergency response.', 'Gargaarsa poolisii hatattamaa sa''aatii 24.', true, 9.01, 38.748),
  ('Gandhi One-Stop Centre', 'medical', '0910721145', 'Addis Ababa', 'Gandhi Memorial Hospital', 'የሕክምና እና የሕግ ድጋፍ በአንድ ማዕከል።', 'Integrated medical and legal support in a single center.', 'Tajaajila yaalaa fi seeraa qindaa''aa giddugala tokko keessatti.', true, 9.02, 38.755),
  ('AWSAD Shelter', 'shelter', '0116672290', 'Addis Ababa', 'Confidential', 'ለጥቃት የተጋለጡ ሴቶች መጠለያ።', 'Safe housing and rehabilitation for women at risk.', 'Bakka qubannaa nageenyaa fi deebisanii dhaabuu dubartootaaf.', true, 9.03, 38.74),
  ('UNHCR Protection', 'legal', '0905012823', 'Addis Ababa', 'Kirkos Sub-city', 'ለስደተኛ ሴቶች የጥበቃ እና የህግ ድጋፍ።', 'Protection and legal assistance for refugee women.', 'Eegumsa fi gargaarsa seeraa dubartoota baqattootaaf.', true, 9.01, 38.752),
  ('Mental Health Hotline', 'counseling', '8335', 'National', 'MOH Ethiopia', 'ነፃ የሥነ-አእምሮ ጤና ምክር።', 'Free and confidential mental health support.', 'Gorsa fayyaa sammuu bilisaa fi iccitii eeggame.', true, 9.018, 38.752),
  ('Child Helpline', 'hotline', '919', 'National', 'Adama/Addis', 'የልጆች ደህንነት መጠበቂያ ስልክ።', 'Advice and support for children and families.', 'Gorsa fi deeggarsa daa''immanii fi maatiiwwaniif.', true, 8.54, 39.27),
  ('Legal Aid Center (AAU)', 'legal', '0111239752', 'Addis Ababa', '6 Kilo Campus', 'ለችግረኛ ሴቶች ነፃ የህግ ውክልና።', 'Free legal representation for disadvantaged women.', 'Bakka bu''iinsa seeraa bilisaa dubartoota harka qalleeyyiidhaaf.', true, 9.04, 38.76);

-- ============================================================================
-- Master Security Tasks (5 templates)
-- ============================================================================

TRUNCATE TABLE master_security_tasks CASCADE;

INSERT INTO master_security_tasks (task_name_en, task_name_am, task_name_or, risk_level, platform, instr_en)
VALUES
  ('Check Location Sharing', 'የአካባቢ ማጋራትን ያረጋግጡ', 'Bakka jireenyaa qooduun jiraachuu isaa mirkaneeffadhaa.', 'high', 'phone', 'Open Google Maps > Profile > Location Sharing. Stop sharing with anyone suspicious.'),
  ('Review Active Sessions', 'ገባሪ ክፍለ-ጊዜዎችን ይገምግሙ', 'Tajaajiloota banaman sakatta''aa.', 'high', 'social', 'In Telegram/Facebook settings, select ''Terminate all other sessions'' to kick off intruders.'),
  ('Audit Saved Passwords', 'የተቀመጡ የይለፍ ቃላትን ይፈትሹ', 'Jecha iccitii ol-ka''aman sakatta''aa.', 'medium', 'email', 'Delete saved passwords for Shield-ET in your browser settings to keep the app hidden.'),
  ('Emergency SOS Toggle', 'የአደጋ ጊዜ የSOS ቅንብር', 'Siriiba hatattamaa (SOS) sakatta''aa.', 'low', 'phone', 'Turn off the ''Countdown Sound'' in SOS settings so an emergency call doesn''t alert an abuser.'),
  ('Banking SMS Alerts', 'የባንክ የኤስኤምኤስ መልዕክቶች', 'SMS Baankii sakatta''aa.', 'high', 'banking', 'Ensure bank alerts are sent to your secret phone number only.');

-- ============================================================================
-- Predefined Safety Plans (5 templates)
-- ============================================================================

TRUNCATE TABLE predefined_plans CASCADE;

-- Insert plans with specific UUIDs so we can reference them in steps
INSERT INTO predefined_plans (id, title_en, description_en, category, difficulty, duration, icon)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'The 10-Minute Exit', 'High-speed emergency plan for when there is an immediate physical threat. Focuses on speed and essential documents.', 'urgent', 'hard', '10-15 Minutes', 'alert-triangle'),
  ('22222222-2222-2222-2222-222222222222', 'Stealth Preparation', 'Strategic plan for survivors planning to leave in the near future. Focuses on gathering evidence and saving money discreetly.', 'stealth', 'moderate', '2-4 Weeks', 'eye-off'),
  ('33333333-3333-3333-3333-333333333333', 'Safe Co-habitation', 'For when leaving is not currently an option. Focuses on de-escalation, identifying safe rooms, and emergency signals.', 'stay', 'easy', 'Daily', 'home'),
  ('44444444-4444-4444-4444-444444444444', 'Digital Lockdown', 'Hardening your digital life. Covers social media privacy, location tracking, and clearing evidence of help-seeking.', 'stealth', 'moderate', '30 Minutes', 'shield-lock'),
  ('55555555-5555-5555-5555-555555555555', 'Child Safety Protocol', 'Planning for survivors with children. Focuses on teaching kids emergency signals and securing their travel documents.', 'kids', 'moderate', '45 Minutes', 'users');

-- ============================================================================
-- Predefined Safety Steps (16 steps)
-- ============================================================================

TRUNCATE TABLE predefined_steps CASCADE;

-- Map AppWrite plan IDs to our new UUIDs:
-- 6951aebde581fb4dfd1b -> The 10-Minute Exit -> 11111111-1111-1111-1111-111111111111
-- 6951aebde58711b05293 -> Stealth Preparation -> 22222222-2222-2222-2222-222222222222
-- 6951aebde5888ef1c592 -> Safe Co-habitation -> 33333333-3333-3333-3333-333333333333
-- 6951aebde589ed615e74 -> Digital Lockdown -> 44444444-4444-4444-4444-444444444444
-- 6951aebde58b4abf0941 -> Child Safety Protocol -> 55555555-5555-5555-5555-555555555555

INSERT INTO predefined_steps (plan_id, label_en, label_am, label_or, priority, module)
VALUES
  -- The 10-Minute Exit steps
  ('11111111-1111-1111-1111-111111111111', 'Identify your primary exit route (Door/Window).', 'ዋናውን መውጫ መንገድ ይለዩ (በር ወይም መስኮት)።', 'Karaa ba''umsaa keessan adda baafadhaa.', 1, 'exit'),
  ('11111111-1111-1111-1111-111111111111', 'Grab your National/Kebele ID and hide it in your shoe or pocket.', 'የቀበሌ መታወቂያዎን ይዘው በኪስዎ ወይም በጫማዎ ውስጥ ይደብቁ።', 'Waraqaa eenyummaa keessan adda baafadhaa kofloo keessa kaa''adhaa.', 2, 'exit'),
  ('11111111-1111-1111-1111-111111111111', 'Put on comfortable walking or running shoes.', 'ምቹ ጫማዎችን (ስኒከር) ያድርጉ።', 'Koppee deemsaaf mijatu uffadhaa.', 3, 'exit'),
  ('11111111-1111-1111-1111-111111111111', 'Take only your emergency cash and secret phone.', 'የአደጋ ጊዜ ገንዘብዎን እና ምስጢራዊ ስልክዎን ብቻ ይያዙ።', 'Maallaqa hatattamaa fi bilbila iccitii qofa fudhadhaa.', 4, 'exit'),
  
  -- Stealth Preparation steps
  ('22222222-2222-2222-2222-222222222222', 'Slowly move 50-100 ETB daily to a trusted friend or hidden spot.', 'በቀን ከ50-100 ብር ለታመነ ጓደኛ ወይም በድብቅ ቦታ ያስቀምጡ።', 'Guyyaatti qarshii 50-100 hiriyaa amanamuuf ykn bakka icciitii kaa''aa.', 1, 'legal'),
  ('22222222-2222-2222-2222-222222222222', 'Gather original Marriage and Birth Certificates discreetly.', 'የጋብቻ እና የልደት ምስክር ወረቀቶችን በድብቅ ያከማቹ።', 'Waraqaa ragaa gaa''elaa fi dhalootaa iccitii dhaan sassaabaa.', 2, 'legal'),
  ('22222222-2222-2222-2222-222222222222', 'Start taking photos of injuries or property damage for the vault.', 'ጉዳቶችን ወይም የንብረት ውድመቶችን ፎቶ አንስተው በቮልት ውስጥ ያስቀምጡ።', 'Miidhaa qaamaa fi qabeenyaa suuraa kaasaa kuusaa (vault) keessa kaa''aa.', 3, 'legal'),
  
  -- Safe Co-habitation steps
  ('33333333-3333-3333-3333-333333333333', 'Identify a room with an outside lock or an exit door.', 'የውጪ መቆለፊያ ወይም መውጫ በር ያለው ክፍል ይለዩ።', 'Mana hulaa alaa qabu ykn kan keessaan banamu adda baafadhaa.', 1, 'exit'),
  ('33333333-3333-3333-3333-333333333333', 'Agree on a ''Safe Signal'' with a neighbor (e.g. a porch light on).', 'ከጎረቤት ጋር ''የደህንነት ምልክት'' ይስማሙ (ለምሳሌ መብራት ማብራት)።', 'Mallattoo nageenyaa ollaa waliin waliif galii.', 2, 'exit'),
  ('33333333-3333-3333-3333-333333333333', 'Avoid the kitchen or bathroom during an argument (weapons risk).', 'ክርክር በሚፈጠርበት ጊዜ ወጥ ቤት ወይም መታጠቢያ ቤትን ያስወግዱ።', 'Yeroo falmiin jiru jikinaa fi mana fincaanii irraa fagaadhaa.', 3, 'exit'),
  
  -- Digital Lockdown steps
  ('44444444-4444-4444-4444-444444444444', 'Log out of your Facebook and Telegram on all shared computers.', 'በጋራ ኮምፒተሮች ላይ ከፌስቡክ እና ቴሌግራም አካውንትዎ ይውጡ።', 'Kompiitara waliinii irratti Feesbuukii fi Telegiraama keessan cufaa.', 1, 'digital'),
  ('44444444-4444-4444-4444-444444444444', 'Check Google/Apple Maps for ''Location Sharing'' with the abuser.', 'በጎግል ማፕ ላይ ''Location Sharing'' መብራቱን ያረጋግጡ።', 'Google Maps irratti bakka jireenyaa qooduun jiraachuu isaa mirkaneeffadhaa.', 2, 'digital'),
  ('44444444-4444-4444-4444-444444444444', 'Clear the search history for any NGO or legal aid websites.', 'የNGO ወይም የህግ ድጋፍ ድረ-ገጾችን ፍለጋ ታሪክ ያጥፉ።', 'Seenaa dubbisa (search history) marsariitiiwwan gargaarsaa haquu.', 3, 'digital'),
  
  -- Child Safety Protocol steps
  ('55555555-5555-5555-5555-555555555555', 'Teach children a secret ''Code Word'' to signal they must hide.', 'ልጆች እንዲደበቁ የሚያደርጋቸው ሚስጥራዊ ''የኮድ ቃል'' ያስተምሯቸው።', 'Daa''imman mallattoo iccitii akka dhokatan isaan barsiisaa.', 1, 'kids'),
  ('55555555-5555-5555-5555-555555555555', 'Secure your children''s original immunization and birth records.', 'የልጆችዎን የክትባት እና የልደት ካርዶች ደህንነቱ በተጠበቀ ቦታ ይያዙ።', 'Waraqaa ragaa talaallii fi dhalootaa daa''immanii bakka nagaa kaa''aa.', 2, 'kids'),
  ('55555555-5555-5555-5555-555555555555', 'Plan a meeting spot outside the house if you get separated.', 'ከተለያዩ በኋላ የሚገናኙበትን ቦታ ከቤት ውጭ ይወስኑ።', 'Yoo gargar baatan bakka itti wal argattan alatti murteessaa.', 3, 'kids');


-- Re-enable triggers
SET session_replication_role = DEFAULT;

