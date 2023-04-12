const categories = {};

export function prepareCategories() {
  categories.krāsas = ['sarkans', 'oranžs', 'dzeltens', 'laima', 'zaļš', 'ciāns', 'zils', 'violets', 'violets', 'rozā', 'melns', 'balts', 'varavīksne'];
  categories.dzīvnieki = ['kaķis', 'suns', 'žirafe', 'papagailis', 'zilonis', 'čūska', 'pele', 'tīģeris', 'lācis', 'vilks', 'krokodils', 'delfīns'];
  categories.automašīnas = ['hyundai', 'volkswagen', 'ford', 'BMW', 'tesla', 'ferrari', 'porsche', 'honda', 'toyota', 'lamborghini'];
  categories.meklētāj_programmas = ['google', 'yahoo', 'yandex', 'bing', 'mozilla', 'explorer', 'edge', 'netscape', 'mosaic'];
  categories.pilsētas = ['riga', 'daugavpils', 'jelgava', 'jurmala', 'liepaja', 'ventspils', 'rezekne', 'valmiera', 'jekabpils', 'ogre'];
  categories.valstis = ['anglija', 'amerika', 'kanāda', 'brazīlija', 'francija', 'somija', 'īslande', 'latvija', 'spānija', 'vācija', 'austrālija', 'austrija', ' meksika', 'madagaskara', 'beļģija', 'nīderlande', 'ķīna', 'japāna', 'dienvidkoreja', 'ziemeļkoreja', 'jaunzēlande'];
  categories.sociālie_medijis = ['youtube', 'instagram', 'facebook', 'snapchat', 'twitter'];
  categories.komunikācijas = ['discord', 'skype', 'whatsapp', 'zoom', 'teamspeak'];
  categories.dzērieni = ['ūdens', 'sula', 'pepsi', 'cocacola', 'fanta', 'sprite', 'mountaindew', 'sevenup'];
  categories.augļi = ['ābols', 'banāns', 'kivi', 'apelsīns', 'vīnoga', 'mellenes', 'ananāss', 'bumbieris', 'papaija'];
  categories.priekšmetiem = ['matemātika', 'ķīmija', 'fizika', 'vēsture', 'bioloģija', 'angļu valoda', 'latviešu valoda'];
  categories.dārzeņi = ['tomāts', 'gurķis', 'kukurūza', 'sīpols'];
  categories.filmas = ['Terminators', 'TumšaisBruņinieks', 'TumšaisBruņinieksCeļas', 'Džokers', 'Zirnekļcilvēks', 'Atriebēji', 'TaisnībasLīga', 'Matrica', 'monsters', ' harijsPoters', 'pašnāvniekuVienība', 'deadpool', 'dzelzsVīrs'];
  return categories;
}
