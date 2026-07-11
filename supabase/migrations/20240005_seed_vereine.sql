-- Seed-Daten: Vereine der Gemeinde Wasserlosen
-- Quellen: wasserlosen.de, Wikipedia, silo.tips (Gemeindebroschüre)

-- Hilfsfunktion: village_id by name auflösen
-- Format: (name, description, icon, gemeinde_id, village_id)

insert into clubs (name, description, icon, gemeinde_id, village_id)

-- ============================================================
-- FREIWILLIGE FEUERWEHREN (alle 8 Ortsteile)
-- ============================================================
select 'Freiwillige Feuerwehr Brebersdorf', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Brebersdorf' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Burghausen', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Burghausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Greßthal', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Greßthal' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Kaisten', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Kaisten' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Rütschenhausen', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Rütschenhausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Schwemmelsbach', 'Freiwillige Feuerwehr (gegr. 1889)', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Schwemmelsbach' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Wasserlosen', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wasserlosen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Freiwillige Feuerwehr Wülfershausen', 'Freiwillige Feuerwehr', 'flame-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wülfershausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid

-- ============================================================
-- MUSIKVEREINE
-- ============================================================
union all
select 'Musik- und Gesangverein Brebersdorf', 'Musik- und Gesangverein', 'musical-notes-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Brebersdorf' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Musikverein Greßthal', 'Musikverein', 'musical-notes-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Greßthal' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Musikverein Schwemmelsbach', 'Musikverein (Schwemmelsbacher Musikanten, gegr. 1972)', 'musical-notes-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Schwemmelsbach' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Musikfreunde Wasserlosen', 'Musikverein', 'musical-notes-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wasserlosen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Musikkapelle Wülfershausen', 'Musikkapelle', 'musical-notes-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wülfershausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid

-- ============================================================
-- SPORTVEREINE (DJK / FC / TT)
-- ============================================================
union all
select 'DJK Brebersdorf', 'Sportverein', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Brebersdorf' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'DJK Greßthal', 'Sportverein', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Greßthal' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'DJK Schwemmelsbach e.V.', 'Sportverein (gegr. 1929)', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Schwemmelsbach' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'FC Wasserlosen', 'Fußballverein', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wasserlosen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'DJK Wülfershausen', 'Sportverein', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wülfershausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'TT Schwebenried/Burghausen', 'Tischtennisverein', 'bicycle-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Burghausen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid

-- ============================================================
-- GEMEINDEWEITE / ÜBERGREIFENDE VEREINE (village_id = null)
-- ============================================================
union all
select 'Korbball-SG Greßthal/Wasserlosen', 'Korbball-Spielgemeinschaft', 'bicycle-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, null
union all
select 'JFG Werntal-Kicker', 'Jugendfußballgemeinschaft', 'football-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, null
union all
select 'Gewerbeverein Wasserlosen', 'Gewerbeverein der Gemeinde', 'hammer-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, null
union all
select 'Katholischer Frauenbund', 'Kath. Frauenbund Wasserlosen', 'heart-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, null

-- ============================================================
-- SONSTIGE ORTSVEREINE
-- ============================================================
union all
select 'Dorfgemeinschaft Schwemmelsbach e.V.', 'Dorfgemeinschaft', 'people-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Schwemmelsbach' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Eigenheimer Schwemmelsbach', 'Eigenheimvereinigung (gegr. 1984)', 'hammer-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Schwemmelsbach' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Eigenheimervereinigung Wasserlosen e.V.', 'Eigenheimvereinigung', 'hammer-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wasserlosen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid
union all
select 'Johanneszweigverein Wasserlosen e.V.', 'Kath. Sozialverein', 'heart-outline',
  '11111111-1111-1111-1111-111111111111'::uuid, v.id from villages v
  where v.name = 'Wasserlosen' and v.gemeinde_id = '11111111-1111-1111-1111-111111111111'::uuid;
