import { useState, useMemo, useEffect, useRef, Component } from 'react';
import './App.css';
import motifsData from './data.json';

// Error Boundary Component to prevent white pages
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Crash de l'application:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'white', background: '#1a1a1a', height: '100vh' }}>
          <h1>⚠️ Oups ! Une erreur est survenue.</h1>
          <p>L'application a rencontré un problème inattendu.</p>
          <pre style={{ background: '#333', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxWidth: '100%' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            🔄 Redémarrer l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback communes for Dpt 21 (offline mode)
const communes21_fallback = [
  "AIGNAY-LE-DUC", "AISEREY", "ALISE-SAINTE-REINE", "ALLEREI", "AMPUILLY-LES-BORDES", "ANRECEY", "ARCEAU", "ARC-SUR-TILLE", "ARGILLY", "ARNAY-LE-DUC", "ASNIERES-LES-DIJON", "ATHIE", "AUBIGNY-EN-PLAINE", "AUBIGNY-LA-RONCE", "AUTRICOURT", "AUXONNE", "AVELANGES", "AVOSNES", "AVOT", "BAGNOT", "BAIGNEUX-LES-JUIFS", "BALOT", "BARBIREY-SUR-OUCHE", "BARD-LE-REGULIER", "BARD-LES-EPOISSES", "BARGE", "BAR-LES-SEUR", "BAUBIGNY", "BAULME-LA-ROCHE", "BEAULIEU", "BEAUMONT-SUR-VINGEANNE", "BEAUNE", "BEIRE-LE-CHATEL", "BEIRE-LE-FORT", "BELAN-SUR-OURCE", "BELLEFOND", "BELLEVENEUVRE", "BELLENEVRE", "BELLENOT-SOUS-POUILLY", "BELLENOT-SUR-SEINE", "BESSEY-EN-CHAUME", "BESSEY-LA-COUR", "BESSEY-LES-CITEAUX", "BEURIZOT", "BEUVE-MERY", "BEZE", "BEZOUOTTE", "BIARE-SUR-OUCHE", "BILLEY", "BILLY-LES-CHANCEAUX", "BINGES", "BLAGNY-SUR-VINGEANNE", "BLAISY-BAS", "BLAISY-HAUT", "BLANOT", "BLIGNY-LE-SEC", "BLIGNY-SUR-OUCHE", "BONCOURT-LE-BOIS", "BOUDROT", "BOUILLAND", "BOUIX", "BOULHES", "BOUQUEROT", "BOUX-SOUS-SALMAISE", "BRAUX", "BRAZEY-EN-MORVAN", "BRAZEY-EN-PLAINE", "BREMUR-ET-VAUROIS", "BRESSAY", "BRETENIERE", "BRETIGNY", "BRIANNY", "BRION-SUR-OURCE", "BROCHON", "BROGNON", "BROIN", "BROINDON", "BUFFON", "BURE-LES-TEMPLIERS", "BUSSEAUT", "BUSSEROTTE-ET-MONTENAILLE", "BUSSIERES", "BUSSSEY-LA-PESLE", "BUSSEY-LE-GRAND", "BUSSSEY-LES-ECHALOT", "CENNES", "CERILLY", "CESSEY-SUR-TILLE", "CHAILLY-SUR-ARMANCON", "CHALANCEY", "CHALAIN-D'UZEL", "CHALAMONT", "CHALLES", "CHAMBOEUF", "CHAMBOLLE-MUSIGNY", "CHAMMEUME", "CHAMPAIN", "CHAMPDOTRE", "CHAMPEAU-EN-MORVAN", "CHAMPAGNE-SUR-VINGEANNE", "CHAMPAGNY", "CHAMPD'OISEAU", "CHAMPIGNEULLE", "CHANCEAUX", "CHANNAY", "CHARENCEY", "CHARIGNY", "CHARMES", "CHARNY", "CHARREY-SUR-SAONE", "CHARREY-SUR-SEINE", "CHASSAGNE-MONTRACHET", "CHASNANS", "CHATEAUNEUF", "CHATILLON-SUR-SEINE", "CHAUDENAY-LA-VILLE", "CHAUDENAY-LE-CHATEAU", "CHAUX", "CHAUME-LES-BAIGNEUX", "CHAUMONT-LE-BOIS", "CHAZILLY", "CHEMIN-D'AISEY", "CHENNOVE", "CHEVANNES", "CHEVIGNY-EN-VALIERE", "CHEVIGNY-SAINT-SAUVEUR", "CHEVIGNY-SOUS-COCHIN", "CHIVRES", "CHOREY-LES-BEAUNE", "CLAMEREY", "CLEMENCEY", "CLENAY", "CLERY", "CLMOT-LES-DIJON", "COLOMBIER", "COMMARIN", "CORCELLES-LES-CITEAUX", "CORCELLES-LES-MONTS", "CORCELLES-LES-ARTS", "CORGOLOIN", "CORGOLON", "CORMATOT", "CORPEAU", "CORPOMONT", "CORRUE-LES-MONTS", "CORSINT", "COURBAN", "COURCELLES-FREMOY", "COURCELLES-LES-MONTBARD", "COURCELLES-LES-SEMUR", "COURCHAMP", "COURON", "COUTERNON", "COUVRAY", "CREANCEY", "CREPAN", "CRUGEY", "CUISELEY", "CURLEY", "CURTIL-SAINT-DENIS", "CURTIL-VERGY", "CUSSEY-LES-FORGES", "DAIX", "DAMPIERRE-EN-MONTAGNE", "DAMPIERRE-ET-FLEE", "DARCEY", "DAROIS", "DETRAIN", "DIANCEY", "DIJON", "DOMOIS", "DREE", "DUN-LES-PLACES", "ECHALOT", "ECHANNAY", "ECHENOISE-SUR-ARMANCON", "ECHEVRONNE", "ECHIGEY", "ECRIOLLES", "EGUILLY", "EPERNAY-SOUS-GEVREY", "EPOISSES", "EPONNEY", "EPONNEY-LE-FRANC", "ERNAY", "ESBARRES", "ESSAROIS", "ESSEY", "ETAILANTE", "ETALANTE", "ETANG-SUR-ARROUX", "ETEVAUX", "ETORNAY", "ETROCHEY", "FAIN-LES-MONTBARD", "FAIN-LES-MOUTIERS", "FAUVERNEY", "FELIX-DE-LODIN", "FENAY", "FERRIERE-SUR-RECHEL", "FIXIN", "FLAGEY-ECHÉZEAUX", "FLAMMERANS", "FLAVIGNEROT", "FLAVIGNY-SUR-OZERAIN", "FLEE", "FLEUREY-SUR-OUCHE", "FOISSY", "FONCEGRIVE", "FONTAINE-EN-DUESMOIS", "FONTAINE-FRANCAISE", "FONTAINE-LES-DIJON", "FONTANGES", "FONTENAY", "FONTENELLE", "FORLEANS", "FRAIGNOT-ET-VESVROTTE", "FRANCHEVILLE", "FRANOIS", "FRENES", "FROLOIS", "GEMEAUX", "GENAY", "GENLIS", "GERGUEIL", "GERLAND", "GEVREY-CHAMBERTIN", "GEVROLLES", "GILLY-LES-CITEAUX", "GISSEY-LE-VIEIL", "GISSEY-SOUS-FLAVIGNY", "GISSEY-SUR-OUCHE", "GLANON", "GOMMEVILLE", "GRANCEY-LE-CHATEAU-NEUVELLE", "GRANCEY-SUR-OURCE", "GRENAY", "GRESIGNY-SAINTE-REINE", "GRIGNON", "GUMERY", "GURGY-LA-VILLE", "GURGY-LE-CHATEAU", "HAUTEROCHE", "HAUTEVILLE-LES-DIJON", "HEUILLEY-SUR-SAONE", "IS-SUR-TILLE", "IVRY-EN-MONTAGNE", "IVOY-LE-PRE", "IZEURE", "IZIER", "JAILLY-LES-MOULINS", "JALLANGES", "JANCIGNY", "JEUX-LES-BARD", "JOUEY", "JUILLENAY", "JUILLY", "LABERGEMENT-FOIGNEY", "LABERGEMENT-LES-AUXONNE", "LABERGEMENT-LES-SEUR", "LABRUYERE", "LA CANIERE", "LA CHAUME", "LADOUX", "LA GESTE", "LAMARCHE-SUR-SAONE", "LANTE", "LANTHENAY", "LANTENAY", "LAPERRIERE-SUR-SAONE", "LARREY", "LA ROCHE-EN-BRENIL", "LA ROCHE-POT", "LA ROCHEPOT", "LA ROCHE-VANNEAU", "LA VILLENEUVE-LES-CONVERS", "LECHATELET", "LE FETE", "LE GLEU", "LE MEIX", "LEMEIX", "LENAY", "LERY", "LEUGLAY", "LEUILLE", "LEVERNOIS", "LIERNAIS", "LIGNEROLLES", "LONGCHAMP", "LONGEAULT", "LONGECOURT-EN-PLAINE", "LONGECOURT-LES-CULETRE", "LONGVIC", "LOSNE", "LOUESME", "LUCEY", "LUCENAY-LE-DUC", "LUSIGNY-SUR-OUCHE", "LUX", "MAGNY-LA-VILLE", "MAGNY-LAMBERT", "MAGNY-LES-AUBIGNY", "MAGNY-LES-VILLERS", "MAGNY-MONTARLOT", "MAGNY-SAINT-MEDARD", "MAGNY-SUR-TILLE", "MAILLY-LA-VILLE", "MAILLY-LE-CHATEAU", "MALAIN", "MALIGNY", "MANLAY", "MARANDEUIL", "MARCELLOIS", "MARCENAY", "MARCHSEUIL", "MARCILLY-ET-DRACY", "MARCILLY-OGNY", "MARCILLY-SUR-TILLE", "MAREY-LES-FUSSEY", "MAREY-SUR-TILLE", "MARIGNY-LE-CAHOUET", "MARIGNY-LES-REULLEE", "MARLIENS", "MARMAGNE", "MARSANNAY-LA-COTE", "MARSANNAY-LE-BOIS", "MARTROIS", "MASSINGY", "MASSINGY-LES-SEMUR", "MASSINGY-LES-VITTEAUX", "MAUVILLY", "MAXILLY-SUR-SAONE", "MEILLY-SUR-ROUVRES", "MELOISEY", "MENESSEIL", "MENETREUX-LE-PITTORESQUE", "MERCEUIL", "MESMONT", "MESSIGNY-ET-VANTOUX", "MEULSON", "MEURSAULT", "MEURSANGES", "MEURSANGLES", "MIMEURE", "MINOT", "MIREBEAU-SUR-BEZE", "MISSERY", "MOITRON", "MOLESME", "MOLLIERE", "MOLINOT", "MOLPHEY", "MOLPHEY", "MOLOY", "MOLPHEY", "MONTAGNY-LES-BEAUNE", "MONTAGNY-LES-SEUR", "MONTBARD", "MONTBERTHAUT", "MONTCEAU-ET-ECHARNANT", "MONTELIER", "MONTIGNY-MORNNAY-VILLENEUVE-SUR-VINGEANNE", "MONTIGNY-SAINT-BARTHELEMY", "MONTIGNY-SUR-ARMANCON", "MONTIGNY-SUR-AUBE", "MONT LAY-EN-AUXOIS", "MONTLIARD", "MONTMAIN", "MONTMANCON", "MONTOILLOT", "MONTOT", "MONTPANCON", "MONTSALIER", "MOREY-SAINT-DENIS", "MOSSON", "MOUSTIERS-SAINT-JEAN", "MUTIGNEY", "NAN-SOUS-THIL", "NANTOUX", "NEILLY", "NESSIGNY", "NICEEY", "NOD-SUR-SEINE", "NOGENT-LES-MONTBARD", "NOIRON-SUR-BEZE", "NOIRON-SUR-SEINE", "NOLAY", "NORGES-LA-VILLE", "NORMIER", "NUITS-SAINT-GEORGES", "OBTREEY", "OGNY", "OIGNY", "OISILLY", "ORAIN", "ORGEUX", "ORIGNY-SUR-SEINE", "ORRET", "ORVILLE", "OSERAY", "OS-SUR-TILLE", "OUGES", "PACEY", "PAGNY-LA-VILLE", "PAGNY-LE-CHATEAU", "PAINBLANC", "PAMPIN", "PANGES", "PASQUES", "PELLEREY", "PERNAND-VERGELESSES", "PERRIGNY-LES-DIJON", "PERRIGNY-SUR-L'OGNON", "PICHANGES", "PLANAY", "PLOMBIERES-LES-DIJON", "PLUVET", "PLUVAULT", "POMMARD", "PONCEY-LES-ATHEE", "PONCEY-SUR-L'IGNON", "PONT", "PONT-A-MOUSSON", "PONTALIER-SUR-SAONE", "PONT-ET-MASSENE", "POSANGES", "POTANGEY", "POUILLENAY", "POUILLY-EN-AUXOIS", "POUILLY-SUR-SAONE", "POUILLY-SUR-VINGEANNE", "PRALON", "PRECY-SOUS-THIL", "PREMEAUX-PRISSEY", "PREMIERE", "PRENOIS", "PRUSLY-SUR-OURCE", "PUITS", "PULIGNY-MONTRACHET", "QUEMIGNY-POISOT", "QUEMIGNY-SUR-SEINE", "QUETIGNY", "QUINCEY", "QUINCEY", "QUINCIEUX", "RECEY-SUR-OURCE", "REULLEE", "REMIREY", "RIEL-LES-EAUX", "ROCHEFORT", "ROUVRAY", "ROUVRES-EN-PLAINE", "SAFFRES", "SAINT-ANDRE-SUR-OUCHE", "SAINT-ANTHOT", "SAINT-APOLLINAIRE", "SAINT-AUBIN", "SAINT-BERNARD", "SAINT-BROING-LES-MOINES", "SAINT-DIDIER", "SAINTE-COLOMBE", "SAINTE-COLOMBE-SUR-SEINE", "SAINTE-MARIE-LA-BLANCHE", "SAINTE-MARIE-SUR-OUCHE", "SAINTE-SABINE", "SAINT-EUPHRONE", "SAINT-GERMAIN-DE-MODREON", "SAINT-GERMAIN-LE-ROCHEUX", "SAINT-GERMAIN-LES-SENAILEY", "SAINT-GERMAIN-SOURCE-SEINE", "SAINT-HELIER", "SAINT-JEAN-DE-BOEUF", "SAINT-JEAN-DE-LOSNE", "SAINT-JULIEN", "SAINT-LEGER-TRIEY", "SAINT-MARC-SUR-SEINE", "SAINT-MARTIN-DE-LA-MER", "SAINT-MARTIN-DU-MONT", "SAINT-MAURICE-SUR-VINGEANNE", "SAINT-MESMIN", "SAINT-NICOLAS-LES-CITEAUX", "SAINT-PHILIBERT", "SAINT-PIERRE-EN-VAUX", "SAINT-PRIX-LES-ARNAY", "SAINT-REMY", "SAINT-REVERSEUL", "SAINT-ROMAIN", "SAINT-SAMPSON", "SAINT-SEINE-EN-BACHE", "SAINT-SEINE-L'ABBAYE", "SAINT-SEINE-SUR-VINGEANNE", "SAINT-SYMPHORIEN-SUR-SAONE", "SAINT-THIBAULT", "SAINT-USAGE", "SAINT-VICTOR-SUR-OUCHE", "SALIVE", "SALMAISE", "SAMEREY", "SANTENAY", "SANTOSSE", "SAULIEU", "SAULON-LA-CHAPELLE", "SAULON-LA-RUE", "SAULX-LE-DUC", "SAUSSEY", "SAVIGNY-LE-SEC", "SAVIGNY-LES-BEAUNE", "SAVIGNY-SOUS-MALAIN", "SAVILLY", "SAVOISY", "SCAY-SUR-SAONE", "SEIGNY", "SELONGEY", "SEMUR-EN-AUXOIS", "SENNECEY-LES-DIJON", "SEUR", "SOIRANS", "SOISSONS-SUR-NACEY", "SOMBERNON", "SOUHEY", "SOURRE-LES-MONTS", "SOUSSEY-SUR-BRIONNE", "SPONVILLE", "TALANT", "TALMAY", "TANAY", "TARSUL", "TART-L'ABBAYE", "TART-LE-BAS", "TART-LE-HAUT", "TAUX", "TELEE", "TERRE-DE-BAS", "TERRE-DE-HAUT", "TERNANT", "TERREFONDREE", "THENISSEY", "THOREY-EN-PLAINE", "THOREY-SOUS-CHARNY", "THOREY-SUR-OUCHE", "THOSTE", "THURY", "TILLECHATEL", "TILLENAY", "TORCY-ET-POULIGNY", "TOUILLON", "TOUTRY", "TRECLUN", "TROCHEREAU", "TROCHÈRES", "TROUHAN", "TROUHAUT", "TRUCHE", "TURCEY", "UNCEY-LE-FRANC", "URCY", "VAL-SUZON", "VANDENESSE-EN-AUXOIS", "VANNAIRE", "VANT-LE-BAS", "VANVEY", "VAROIS-ET-CHAIGNOT", "VARANGES", "VAUCHIGNON", "VAULX", "VELARS-SUR-OUCHE", "VELOGNY", "VENAREY-LES-LAUMES", "VERDONNET", "VERNANTOIS", "VERNOIS-LES-BELVRE", "VERNONOT-SUR-SEINE", "VERREY-SOUS-DRÉE", "VERREY-SOUS-SALMAISE", "VERTILLT", "VEUVIEY", "VEUVEY-SUR-OUCHE", "VIERVILLE", "VIEVY", "VIGNOLLES", "VILLAINES-EN-DUESMOIS", "VILLAINES-LES-PREVOTES", "VILLARGOIX", "VILLARS-ET-VILLENOTTE", "VILLARS-FONTAINE", "VILLEBERNY", "VILLE-DE-MESSY", "VILLEFERRY", "VILLENEUVE-SOUS-CHARNY", "VILLERS-LA-FAYE", "VILLERS-LES-POTS", "VILLERS-PATRAS", "VILLERS-ROTIN", "VILLEY-SUR-TILLE", "VILLIERS-EN-MORVAN", "VILLIERS-LE-DUC", "VILLOTTE-SAINT-SEINE", "VILLOTTE-SUR-OURCE", "VINGEANNE", "VISERNY", "VITTEAUX", "VIX", "VOLNAY", "VONGE", "VOSNE-ROMANEE", "VOTEUIL", "VOUDENAY", "VOUGEOT", "VRILLY"
];

// Known Centres de Secours for dropdown
const centres21 = [
  "AIGNAY-LE-DUC", "ARNAY-LE-DUC", "AIGNAY", "AUXONNE", "AISEREY", "ARC-SUR-TILLE", "AISEY",
  "BAIGNEUX-LES-JUIFS", "BEAUNE", "BLIGNY-SUR-OUCHE", "BRAZEY-EN-PLAINE",
  "CHATILLON-SUR-SEINE", "DIJON EST", "DIJON NORD", "DIJON SUD", "DIJON TRANSVAAL",
  "FONTAINE-FRANCAISE", "GENLIS", "IS-SUR-TILLE", "LIERNAIS", "LAIGNES", "LEGLAY-VOULAINES",
  "MIREBEAU-SUR-BEZE", "MONTBARD", "MONTIGNY-SUR-AUBE", "MEURSAULT", "NOLAY",
  "NUITS-ST-GEORGES", "PONTAILLER", "POUILLY-EN-AUXOIS", "PRECY-SOUS-THIL", "RECEY-SUR-OURCE", "SAULIEU",
  "SELONGEY", "SEMUR-EN-AUXOIS", "SEURRE", "SOMBERNON", "ST-JEAN-DE-LOSNE", "ST-SEINE-L'ABBAYE",
  "VELARS-SUR-OUCHE", "VENAREY-LES-LAUMES", "VITTEAUX"
];
const centres71 = [
  "ANOST", "AUTUN", "AZE", "BLANZY", "BOURBON-LANCY", "BUXY", "CHAGNY", "CHALON-SUR-SAONE", 
  "CHARNAY-LES-MACON", "CHAROLLES", "CHAUFFAILLES", "CLUNY", "COUCHES", "CRISSEY", "CUISEAUX", 
  "DIGOIN", "DOMPIERRES-LES-ORMES", "FONTAINES", "GERGY", "GIVRY", "GUEUGNON", "ISSY-L'EVEQUE", 
  "JONCY", "LA CHAPELLE-DE-GUINCHAY", "LA CLAYETTE", "LE CREUSOT", "LOISY", "LOUHANS", "LUGNY", 
  "MACON", "MARCIGNY", "MATOUR", "MERVANS", "MONTCEAU-LES-MINES", "MONTCHANIN", "MONTPONT-EN-BRESSE", 
  "NAVILLY", "OUROUX-SUR-SAONE", "PARAY-LE-MONIAL", "PERRECY-GENELARD", "PIERRE-DE-BRESSE", "ROMENAY", 
  "SAGY", "SAINT-BONNET-DE-JOUX", "SAINT-ETIENNE-EN-BRESSE", "SAINT-GENGOUX-LE-NATIONAL", 
  "SAINT-GERMAIN-DU-BOIS", "SAINT-MARTIN-EN-BRESSE", "SALORNAY-SUR-GUYE", "SAVIGNY-EN-REVERMONT", 
  "SENNECEY-LE-GRAND", "SIMARD", "SORNAY", "TOULON-SUR-ARROUX", "TOURNUS", "TRAMAYES", 
  "VARENNES-SAINT-SAUVEUR", "VERDUN-SUR-LE-DOUBS", "EPINAC", "ETANG-SUR-ARROUX"
];
const centres58 = [
  "ALLIGNY-COSNE", "ARQUIAN", "BILLY-SUR-OISY", "BOUHY", "BRASSY", "BRINON-SUR-BEUVRON",
  "CERCY-LA-TOUR", "CHAMPLEMY", "CHANTENAY-SAINT-IMBERT", "CHATEAU-CHINON", "CHATILLON-EN-BAZOIS",
  "CHIDDES", "CIEZ", "CLAMECY", "CORBIGNY", "COSNE-COURS-SUR-LOIRE", "CRUX-LA-VILLE",
  "DAMPIERRE-SOUS-BOUHY", "DECIZE", "DONZY", "ENTRAINS-SUR-NOHAIN", "FOURS", "LA CHARITE-SUR-LOIRE",
  "LA MACHINE", "LAROCHEMILLAY", "LORMES", "LUCENAY-LES-AIX", "LUZY", "MONTREUILLON",
  "MOULINS-ENGILBERT", "MOUX-EN-MORVAN", "NEVERS", "OUROUX-EN-MORVAN", "POUILLY-SUR-LOIRE",
  "PREMERY", "SAINT-AMAND-EN-PUISAYE", "SAINT-ANDRE-EN-MORVAN", "SAINT-BENIN-D'AZY",
  "SAINT-HONORE-LES-BAINS", "SAINT-PIERRE-LE-MOUTIER", "SAINT-REVERIEN", "SAINT-SAULGE",
  "SEMELAY", "SURGY", "TANNAY", "VARZY"
];
const centres89 = [
  "AILLANT-SUR-THOLON", "ANCY-LE-FRANC", "AUXERRE", "AVALLON", "BLENEAU", "BRIENON-SUR-ARMANCON", 
  "CERISIERS", "CHABLIS", "CHAMPIGNELLES", "CHARNY", "CHEMILLY-BEAUMONT", "COURSON-LES-CARRIERES", 
  "CRUZY-LE-CHATEL", "JOIGNY", "L'ISLE-SUR-SEREIN", "LIGNY-LE-CHATEL", "MIGENNES", "NOYERS-SUR-SEREIN", 
  "PONT-SUR-YONNE", "QUARRE-LES-TOMBES", "SAINT-FARGEAU", "SAINT-FLORENTIN", "SAINT-JULIEN-DU-SAULT", 
  "SAINT-SAUVEUR-EN-PUISAYE", "SAINT-VALERIEN", "SENS", "SERGINES", "THORIGNY-SUR-OREUSE", "TONNERRE", 
  "TOUCY", "VENOY", "VERMENTON", "VEZELAY", "VILLENEUVE-L'ARCHEVEQUE", "VILLENEUVE-LA-GUYARD", "VILLENEUVE-SUR-YONNE"
];
const centres10 = [
  "AIX-EN-OTHE", "ARCIS-SUR-AUBE", "BAR-SUR-AUBE", "BAR-SUR-SEINE", "BOUILLY", "BRIENNE-LE-CHATEAU", 
  "BUCHERES", "CHALETTE-SUR-VOIRE", "CHAMOY", "CHAOURCE", "CHAVANGES", "CHESSY-LES-PRES", "DOSCHES", 
  "ERVY-LE-CHATEL", "ESSOYES", "ESTISSAC", "LES RICEYS", "LUSIGNY-SUR-BARSE", "MAILLY-LE-CAMP", 
  "MARAYE-EN-OTHE", "MARCILLY-LE-HAYER", "MARIGNY-LE-CHATEL", "MERY-SUR-SEINE", "MONTIGNY-LES-MONTS", 
  "MUSSY-SUR-SEINE", "NOGENT-SUR-SEINE", "PETIT-MESNIL", "PINEY", "PRUGNY", "RAMERUPT", "ROMILLY-SUR-SEINE", 
  "ROSIERES", "SAINT-MESMIN", "SAINT-PARRES-AUX-TERTRES", "SAINT-PARRES-LES-VAUDES", "SAINT-PHAL", 
  "SOMMEVAL", "TORVILLIERS", "TROYES OUEST", "TROYES VOULDY", "VENDEUVRE-SUR-BARSE", "VERRIERES", 
  "VILLENAUXE-LA-GRANDE"
];
const centres52 = [
  "ANDELOT-BLANCHEVILLE", "ARC-EN-BARROIS", "AUBERIVE", "BAYARD-SUR-MARNE", "BETTANCOURT-LA-FERREE", 
  "BIESLES", "BOLOGNE", "BOURBONNE-LES-BAINS", "BREUVANNES-EN-BASSIGNY", "BRICON", "CHALINDREY", 
  "CHATEAUVILLAIN", "CHAUMONT", "CHEVILLON", "COLOMBEY-LES-DEUX-EGLISES", "DOULAINCOURT-SAUCOURT", 
  "DOULEVANT-LE-CHATEAU", "ECLARON", "FAYL-BILLOT", "FRONCLES", "ILLOUD", "IS-EN-BASSIGNY", "JOINVILLE", 
  "LANGRES", "LONGEAU", "MANOIS", "MARANVILLE", "MONTIER-EN-DER", "MONTIGNY-LE-ROI", "NOGENT", "POISSONS", 
  "PRAUTHOY", "ROLAMPONT", "SAINT-DIZIER", "SOMMEVOIRE", "VARENNES-SOUS-AMANCE", "WASSY"
];
const centres70 = [
  "AILLEVILLERS-ET-LYAUMONT", "AMANCE", "ANCHENONCOURT-ET-CHAZEL", "APREMONT", "AUTREY-LES-GRAY", 
  "AUVET-ET-LA-CHAPELOTTE", "BEAUJEU", "BEAUMOTTE-LA-BARRE", "BOREY", "BUCEY-LES-GY", "CEMBOING", 
  "CENDRECOURT", "CHAMPAGNEY", "CHAMPEY", "CHAMPLITTE", "CHENEBIER", "CIREY-VANDELANS", "CLAIREGOUTTE", 
  "COMBEAUFONTAINE", "CONFLANS-SUR-LANTERNE", "CORBENAY", "CORRE", "DAMPIERRE-SUR-LINOTTE", 
  "DAMPIERRE-SUR-SALON", "ESPRELS", "ETOBON-BELVERNE", "FALLON", "FAUCOGNEY", "FLEUREY-LES-FAVERNEY", 
  "FONTAINE-LES-LUXEUIL", "FOUGEROLLES", "FOUVENT", "FRASNE-LE-CHATEAU", "FRESNE-SAINT-MAMES", "FRESSE", 
  "FRETIGNEY", "FROIDECONCHE", "GRAY", "GY", "HERICOURT", "JUSSEY", "LAVONCOURT", "LOULANS-VERCHAMP", 
  "LURE", "LUXEUIL-LES-BAINS", "LYOFFANS", "MAILLEY", "MARNAY", "MELISEY", "MOFFANS", "MONTBOZON", 
  "MONTUREUX", "NANTILLY", "OISELAY-ET-GRACHAUX", "ORMOY", "PASSAVANT-LA-ROCHERE", "PESMES", "PIN", 
  "PLANCHER-BAS", "PLANCHER-LES-MINES", "POLAINCOURT", "PORT-SUR-SAONE", "RADDON-BREUCHOTTE", "RIOZ", 
  "RONCHAMP", "SAINT-LOUP-SUR-SEMOUSE", "SAINT-REMY-EN-COMTE", "SAULNOT", "SAULX", "SCEY-SUR-SAONE", 
  "SENONCOURT", "SERVANCE", "SEVEUX", "SOING", "TRAVES", "VALAY", "VARS-ECUELLE", "VAUCONCOURT", 
  "VAUVILLERS", "VELESMES", "VELLEXON", "VESOUL", "VILLERS-SUR-SAULNOT", "VILLERSEXEL", "VORAY-SUR-L'OGNON"
];
const centres39 = [
  "ARBOIS", "ARINTHOD", "ARLAY", "BEAUFORT", "BELLEFONTAINE", "BLETTERANS", "BOIS-D'AMONT", 
  "CHAMPAGNOLE", "CHAUMERGY", "CHAUSSIN", "CHAUX", "CHAUX-DES-CROTENAY", "CLAIRVAUX-LES-LACS", 
  "COLONNE", "COUSANCE", "FONCINE-LE-HAUT", "GENDREY", "LES ROUSSES", "LONGCHAUMOIS", "LORETTE", 
  "MOIRANS-EN-MONTAGNE", "MONT-SOUS-VAUDREY", "MONT-SUR-MONNET", "MORBIER", "MOREZ", "ORGELET", 
  "POLIGNY", "PUBLY", "SAINT-AMOUR", "SAINT-AUBIN", "SAINT-CLAUDE", "SAINT-JULIEN-SUR-SURAN", 
  "SAINT-LAURENT-EN-GRANDVAUX", "SALINS-LES-BAINS", "SELLIERES", "SIROD", "THERVAY", "THOIRETTE", 
  "VILLARD-SUR-BIENNE", "VIRY", "VOITEUR-DOMBLANS"
];

const default_voies = [
  "Rue ", "Avenue ", "Boulevard ", "Impasse ", "Allée ", "Route ", "Chemin ", "Place ", "Lieu-dit "
];

const getVehiclePermitType = (engin, customVehicles = []) => {
  if (!engin) return 'VL';
  const e = engin.toUpperCase();
  
  // Check if it's a custom vehicle with a specific permit type
  const custom = customVehicles.find(v => v.nom.toUpperCase() === e.trim());
  if (custom && custom.permis) return custom.permis;

  // Standard Heavy Vehicles in French Fire Service
  if (e.includes('FPT') || e.includes('CCR') || e.includes('CCF') || e.includes('EPA') || e.includes('MEA') || e.includes('VSR') || e.includes('SR') || e.includes('DA') || e.includes('VAR')) {
    return 'PL';
  }
  return 'VL';
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMotif, setSelectedMotif] = useState(null);

  // States for dynamic communes and settings
  const [departement, setDepartement] = useState('21'); // Default to Côte-d'Or
  const [communesList, setCommunesList] = useState([]);
  const [caserne, setCaserne] = useState('LIERNAIS');
  const [cta, setCta] = useState('ST03-CTA-21');

  // Form state for the ticket
  const [ticketData, setTicketData] = useState({
    numeroDepart: '',
    operateurCta: '',
    vehiculeAffiche: '',
    commune: '',
    voie: '',
    numeroPlan: '',
    coordonnees: '',
    contact: '',
    dateAppel: '',
    observations: '',
    personnel: []
  });

  // Settings state for firemen
  const [qrModalPompier, setQrModalPompier] = useState(null);
  const [pompiers, setPompiers] = useState(() => {
    const saved = localStorage.getItem('pompiers');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(p => ({
      ...p,
      permisVL: p.permisVL !== undefined ? p.permisVL : false,
      permisPL: p.permisPL !== undefined ? p.permisPL : false,
      telephone: p.telephone || ""
    })).sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
  });

  const handleExportPersonnel = () => {
    const dataStr = JSON.stringify(pompiers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'liste_personnel_pompiers.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportPersonnel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`Importer ${imported.length} pompiers ? Cela remplacera votre liste actuelle.`)) {
            setPompiers(imported);
          }
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Settings state for vehicles
  const [customVehicles, setCustomVehicles] = useState(() => {
    const saved = localStorage.getItem('customVehicles');
    if (saved) return JSON.parse(saved);
    
    // Default list if none saved
    return [
      { nom: 'VSAV 01', personnel: '4', permis: 'VL' },
      { nom: 'CCR 01', personnel: '6', permis: 'PL' },
      { nom: 'FPT 01', personnel: '6', permis: 'PL' },
      { nom: 'VSR 01', personnel: '3', permis: 'PL' },
      { nom: 'VTU 01', personnel: '2', permis: 'VL' },
      { nom: 'CCF 01', personnel: '4', permis: 'PL' },
      { nom: 'EPA 01', personnel: '2', permis: 'PL' },
      { nom: 'VLCG 01', personnel: '1', permis: 'VL' },
      { nom: 'VL 01', personnel: '1', permis: 'VL' },
      { nom: 'EMBR 01', personnel: '2', permis: 'VL' },
      { nom: 'MPR 01', personnel: '1', permis: 'VL' },
      { nom: 'CD 01', personnel: '1', permis: 'VL' },
      { nom: 'INF 01', personnel: '1', permis: 'VL' },
      { nom: 'MED 01', personnel: '1', permis: 'VL' },
      { nom: 'BEA 01', personnel: '2', permis: 'PL' },
      { nom: 'CCGC 01', personnel: '1', permis: 'PL' },
      { nom: 'VIRT 01', personnel: '2', permis: 'PL' },
      { nom: 'VPL 01', personnel: '1', permis: 'PL' }
    ];
  });

const FONCTIONS_ORDER = ["COS", "CA", "CC", "CE BAT", "EQ BAT", "CE BAL", "EQ BAL", "COND", "EQ 1", "EQ 2", "EQ 3", "EQ 4", "INF", "MED"];
const GRADES_ORDER = ["SAPEUR", "SAPEUR 1ERE CLASSE", "CAPORAL", "CAPORAL-CHEF", "SERGENT", "SERGENT-CHEF", "ADJUDANT", "ADJUDANT-CHEF", "LIEUTENANT", "CAPITAINE", "COMMANDANT", "LIEUTENANT-COLONEL", "COLONEL", "INFIRMIER", "MEDECIN"];

function sortFonctions(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const idxA = FONCTIONS_ORDER.indexOf((a || '').trim().toUpperCase());
    const idxB = FONCTIONS_ORDER.indexOf((b || '').trim().toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (a || '').localeCompare(b || '');
  });
}

function sortGrades(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const nameA = (typeof a === 'string' ? a : a.nom || '').trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nameB = (typeof b === 'string' ? b : b.nom || '').trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const idxA = GRADES_ORDER.findIndex(g => nameA.includes(g));
    const idxB = GRADES_ORDER.findIndex(g => nameB.includes(g));
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return nameA.localeCompare(nameB);
  });
}

  // Settings state for functions and grades
  const [availableFonctions, setAvailableFonctions] = useState(() => {
    const saved = localStorage.getItem('availableFonctions');
    const parsed = saved ? JSON.parse(saved) : ["CA", "CC", "CE BAT", "EQ BAT", "CE BAL", "EQ BAL", "COND", "COS", "EQ 1", "EQ 2", "EQ 3", "EQ 4", "INF", "MED"];
    return sortFonctions(parsed);
  });

  const [availableGrades, setAvailableGrades] = useState(() => {
    const saved = localStorage.getItem('availableGrades');
    const parsed = saved ? JSON.parse(saved) : ["Sapeur", "Sapeur 1ère Classe", "Caporal", "Caporal-Chef", "Sergent", "Sergent-Chef", "Adjudant", "Adjudant-Chef", "Lieutenant", "Capitaine", "Commandant", "Lieutenant-Colonel", "Colonel", "Infirmier", "Médecin"];
    const mapped = parsed.map(g => {
      if (typeof g === 'string') return { nom: g, fonctions: [] };
      return { ...g, fonctions: g.fonctions || [] };
    });
    return sortGrades(mapped);
  });

  // Refs for auto-focus
  const communeRef = useRef(null);
  const voieRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('pompiers', JSON.stringify(pompiers));
  }, [pompiers]);

  useEffect(() => {
    localStorage.setItem('customVehicles', JSON.stringify(customVehicles));
  }, [customVehicles]);

  useEffect(() => {
    localStorage.setItem('availableFonctions', JSON.stringify(availableFonctions));
  }, [availableFonctions]);

  // Migration: ensure CE BAT and EQ BAT are available, and cleanup redundant synonyms
  useEffect(() => {
    const synonymsToRemove = ["CHEF D'AGRÈS", "CONDUCTEUR", "ÉQUIPIER", "BAT", "BAL", "CE"];
    const missing = ["CE BAT", "EQ BAT", "CE BAL", "EQ BAL"].filter(f => !availableFonctions.includes(f));
    
    const currentClean = availableFonctions.filter(f => !synonymsToRemove.includes(f.toUpperCase()));
    const unique = [...new Set([...missing, ...currentClean])].filter(f => f.trim() !== "");
    
    if (unique.length !== availableFonctions.length) {
      setAvailableFonctions(sortFonctions(unique));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('availableGrades', JSON.stringify(availableGrades));
  }, [availableGrades]);

  // Migration for standard vehicles
  useEffect(() => {
    const standardList = [
      { nom: 'VSAV 01', personnel: '4', permis: 'VL' },
      { nom: 'CCR 01', personnel: '6', permis: 'PL' },
      { nom: 'FPT 01', personnel: '6', permis: 'PL' },
      { nom: 'VSR 01', personnel: '3', permis: 'PL' },
      { nom: 'VTU 01', personnel: '2', permis: 'VL' },
      { nom: 'CCF 01', personnel: '4', permis: 'PL' },
      { nom: 'EPA 01', personnel: '2', permis: 'PL' },
      { nom: 'VLCG 01', personnel: '1', permis: 'VL' },
      { nom: 'VL 01', personnel: '1', permis: 'VL' },
      { nom: 'EMBR 01', personnel: '2', permis: 'VL' },
      { nom: 'MPR 01', personnel: '1', permis: 'VL' },
      { nom: 'CD 01', personnel: '1', permis: 'VL' },
      { nom: 'INF 01', personnel: '1', permis: 'VL' },
      { nom: 'MED 01', personnel: '1', permis: 'VL' },
      { nom: 'BEA 01', personnel: '2', permis: 'PL' },
      { nom: 'CCGC 01', personnel: '1', permis: 'PL' },
      { nom: 'VIRT 01', personnel: '2', permis: 'PL' },
      { nom: 'VPL 01', personnel: '1', permis: 'PL' }
    ];

    const existingNames = customVehicles.map(v => v.nom);
    const missing = standardList.filter(v => !existingNames.includes(v.nom));
    
    if (missing.length > 0) {
      setCustomVehicles(prev => [...prev, ...missing]);
    }
  }, []);

  // Fetch communes when department changes
  useEffect(() => {
    if (!departement || departement.length < 2) return;

    // Auto-update CTA
    setCta(`ST03-CTA-${departement}`);

    // If it's department 21, use our hardcoded fallback list as a starting point
    if (departement === '21') {
      setCommunesList(communes21_fallback);
    } else {
      setCommunesList([]);
    }

    // Try to fetch updated/more precise list from API
    fetch(`https://geo.api.gouv.fr/communes?codeDepartement=${departement}&fields=nom&format=json`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const names = data.map(c => c.nom).filter(Boolean).sort();
          if (names.length > 0) setCommunesList(names);
        }
      })
      .catch(() => {});
  }, [departement]);

  const centres71_list = [
    "ANOST", "AUTUN", "AZE", "BLANZY", "BOURBON-LANCY", "BUXY", "CHAGNY", "CHALON-SUR-SAONE", 
    "CHARNAY-LES-MACON", "CHAROLLES", "CHAUFFAILLES", "CLUNY", "COUCHES", "CRISSEY", "CUISEAUX", 
    "DIGOIN", "DOMPIERRES-LES-ORMES", "FONTAINES", "GERGY", "GIVRY", "GUEUGNON", "ISSY-L'EVEQUE", 
    "JONCY", "LA CHAPELLE-DE-GUINCHAY", "LA CLAYETTE", "LE CREUSOT", "LOISY", "LOUHANS", "LUGNY", 
    "MACON", "MARCIGNY", "MATOUR", "MERVANS", "MONTCEAU-LES-MINES", "MONTCHANIN", "MONTPONT-EN-BRESSE", 
    "NAVILLY", "OUROUX-SUR-SAONE", "PARAY-LE-MONIAL", "PERRECY-GENELARD", "PIERRE-DE-BRESSE", "ROMENAY", 
    "SAGY", "SAINT-BONNET-DE-JOUX", "SAINT-ETIENNE-EN-BRESSE", "SAINT-GENGOUX-LE-NATIONAL", 
    "SAINT-GERMAIN-DU-BOIS", "SAINT-MARTIN-EN-BRESSE", "SALORNAY-SUR-GUYE", "SAVIGNY-EN-REVERMONT", 
    "SENNECEY-LE-GRAND", "SIMARD", "SORNAY", "TOULON-SUR-ARROUX", "TOURNUS", "TRAMAYES", 
    "VARENNES-SAINT-SAUVEUR", "VERDUN-SUR-LE-DOUBS", "EPINAC", "ETANG-SUR-ARROUX"
  ];
  const centres58_list = [
    "ALLIGNY-COSNE", "ARQUIAN", "BILLY-SUR-OISY", "BOUHY", "BRASSY", "BRINON-SUR-BEUVRON",
    "CERCY-LA-TOUR", "CHAMPLEMY", "CHANTENAY-SAINT-IMBERT", "CHATEAU-CHINON", "CHATILLON-EN-BAZOIS",
    "CHIDDES", "CIEZ", "CLAMECY", "CORBIGNY", "COSNE-COURS-SUR-LOIRE", "CRUX-LA-VILLE",
    "DAMPIERRE-SOUS-BOUHY", "DECIZE", "DONZY", "ENTRAINS-SUR-NOHAIN", "FOURS", "LA CHARITE-SUR-LOIRE",
    "LA MACHINE", "LAROCHEMILLAY", "LORMES", "LUCENAY-LES-AIX", "LUZY", "MONTREUILLON",
    "MOULINS-ENGILBERT", "MOUX-EN-MORVAN", "NEVERS", "OUROUX-EN-MORVAN", "POUILLY-SUR-LOIRE",
    "PREMERY", "SAINT-AMAND-EN-PUISAYE", "SAINT-ANDRE-EN-MORVAN", "SAINT-BENIN-D'AZY",
    "SAINT-HONORE-LES-BAINS", "SAINT-PIERRE-LE-MOUTIER", "SAINT-REVERIEN", "SAINT-SAULGE",
    "SEMELAY", "SURGY", "TANNAY", "VARZY"
  ];
  const centres89_list = [
    "AILLANT-SUR-THOLON", "ANCY-LE-FRANC", "AUXERRE", "AVALLON", "BLENEAU", "BRIENON-SUR-ARMANCON", 
    "CERISIERS", "CHABLIS", "CHAMPIGNELLES", "CHARNY", "CHEMILLY-BEAUMONT", "COURSON-LES-CARRIERES", 
    "CRUZY-LE-CHATEL", "JOIGNY", "L'ISLE-SUR-SEREIN", "LIGNY-LE-CHATEL", "MIGENNES", "NOYERS-SUR-SEREIN", 
    "PONT-SUR-YONNE", "QUARRE-LES-TOMBES", "SAINT-FARGEAU", "SAINT-FLORENTIN", "SAINT-JULIEN-DU-SAULT", 
    "SAINT-SAUVEUR-EN-PUISAYE", "SAINT-VALERIEN", "SENS", "SERGINES", "THORIGNY-SUR-OREUSE", "TONNERRE", 
    "TOUCY", "VENOY", "VERMENTON", "VEZELAY", "VILLENEUVE-L'ARCHEVEQUE", "VILLENEUVE-LA-GUYARD", "VILLENEUVE-SUR-YONNE"
  ];
  const centres10_list = [
    "AIX-EN-OTHE", "ARCIS-SUR-AUBE", "BAR-SUR-AUBE", "BAR-SUR-SEINE", "BOUILLY", "BRIENNE-LE-CHATEAU", 
    "BUCHERES", "CHALETTE-SUR-VOIRE", "CHAMOY", "CHAOURCE", "CHAVANGES", "CHESSY-LES-PRES", "DOSCHES", 
    "ERVY-LE-CHATEL", "ESSOYES", "ESTISSAC", "LES RICEYS", "LUSIGNY-SUR-BARSE", "MAILLY-LE-CAMP", 
    "MARAYE-EN-OTHE", "MARCILLY-LE-HAYER", "MARIGNY-LE-CHATEL", "MERY-SUR-SEINE", "MONTIGNY-LES-MONTS", 
    "MUSSY-SUR-SEINE", "NOGENT-SUR-SEINE", "PETIT-MESNIL", "PINEY", "PRUGNY", "RAMERUPT", "ROMILLY-SUR-SEINE", 
    "ROSIERES", "SAINT-MESMIN", "SAINT-PARRES-AUX-TERTRES", "SAINT-PARRES-LES-VAUDES", "SAINT-PHAL", 
    "SOMMEVAL", "TORVILLIERS", "TROYES OUEST", "TROYES VOULDY", "VENDEUVRE-SUR-BARSE", "VERRIERES", 
    "VILLENAUXE-LA-GRANDE"
  ];
  const centres52_list = [
    "ANDELOT-BLANCHEVILLE", "ARC-EN-BARROIS", "AUBERIVE", "BAYARD-SUR-MARNE", "BETTANCOURT-LA-FERREE", 
    "BIESLES", "BOLOGNE", "BOURBONNE-LES-BAINS", "BREUVANNES-EN-BASSIGNY", "BRICON", "CHALINDREY", 
    "CHATEAUVILLAIN", "CHAUMONT", "CHEVILLON", "COLOMBEY-LES-DEUX-EGLISES", "DOULAINCOURT-SAUCOURT", 
    "DOULEVANT-LE-CHATEAU", "ECLARON", "FAYL-BILLOT", "FRONCLES", "ILLOUD", "IS-EN-BASSIGNY", "JOINVILLE", 
    "LANGRES", "LONGEAU", "MANOIS", "MARANVILLE", "MONTIER-EN-DER", "MONTIGNY-LE-ROI", "NOGENT", "POISSONS", 
    "PRAUTHOY", "ROLAMPONT", "SAINT-DIZIER", "SOMMEVOIRE", "VARENNES-SOUS-AMANCE", "WASSY"
  ];
  const centres70_list = [
    "AILLEVILLERS-ET-LYAUMONT", "AMANCE", "ANCHENONCOURT-ET-CHAZEL", "APREMONT", "AUTREY-LES-GRAY", 
    "AUVET-ET-LA-CHAPELOTTE", "BEAUJEU", "BEAUMOTTE-LA-BARRE", "BOREY", "BUCEY-LES-GY", "CEMBOING", 
    "CENDRECOURT", "CHAMPAGNEY", "CHAMPEY", "CHAMPLITTE", "CHENEBIER", "CIREY-VANDELANS", "CLAIREGOUTTE", 
    "COMBEAUFONTAINE", "CONFLANS-SUR-LANTERNE", "CORBENAY", "CORRE", "DAMPIERRE-SUR-LINOTTE", 
    "DAMPIERRE-SUR-SALON", "ESPRELS", "ETOBON-BELVERNE", "FALLON", "FAUCOGNEY", "FLEUREY-LES-FAVERNEY", 
    "FONTAINE-LES-LUXEUIL", "FOUGEROLLES", "FOUVENT", "FRASNE-LE-CHATEAU", "FRESNE-SAINT-MAMES", "FRESSE", 
    "FRETIGNEY", "FROIDECONCHE", "GRAY", "GY", "HERICOURT", "JUSSEY", "LAVONCOURT", "LOULANS-VERCHAMP", 
    "LURE", "LUXEUIL-LES-BAINS", "LYOFFANS", "MAILLEY", "MARNAY", "MELISEY", "MOFFANS", "MONTBOZON", 
    "MONTUREUX", "NANTILLY", "OISELAY-ET-GRACHAUX", "ORMOY", "PASSAVANT-LA-ROCHERE", "PESMES", "PIN", 
    "PLANCHER-BAS", "PLANCHER-LES-MINES", "POLAINCOURT", "PORT-SUR-SAONE", "RADDON-BREUCHOTTE", "RIOZ", 
    "RONCHAMP", "SAINT-LOUP-SUR-SEMOUSE", "SAINT-REMY-EN-COMTE", "SAULNOT", "SAULX", "SCEY-SUR-SAONE", 
    "SENONCOURT", "SERVANCE", "SEVEUX", "SOING", "TRAVES", "VALAY", "VARS-ECUELLE", "VAUCONCOURT", 
    "VAUVILLERS", "VELESMES", "VELLEXON", "VESOUL", "VILLERS-SUR-SAULNOT", "VILLERSEXEL", "VORAY-SUR-L'OGNON"
  ];
  const centres39_list = [
    "ARBOIS", "ARINTHOD", "ARLAY", "BEAUFORT", "BELLEFONTAINE", "BLETTERANS", "BOIS-D'AMONT", 
    "CHAMPAGNOLE", "CHAUMERGY", "CHAUSSIN", "CHAUX", "CHAUX-DES-CROTENAY", "CLAIRVAUX-LES-LACS", 
    "COLONNE", "COUSANCE", "FONCINE-LE-HAUT", "GENDREY", "LES ROUSSES", "LONGCHAUMOIS", "LORETTE", 
    "MOIRANS-EN-MONTAGNE", "MONT-SOUS-VAUDREY", "MONT-SUR-MONNET", "MORBIER", "MOREZ", "ORGELET", 
    "POLIGNY", "PUBLY", "SAINT-AMOUR", "SAINT-AUBIN", "SAINT-CLAUDE", "SAINT-JULIEN-SUR-SURAN", 
    "SAINT-LAURENT-EN-GRANDVAUX", "SALINS-LES-BAINS", "SELLIERES", "SIROD", "THERVAY", "THOIRETTE", 
    "VILLARD-SUR-BIENNE", "VIRY", "VOITEUR-DOMBLANS"
  ];

  let currentCentresList = [];
  switch (departement) {
    case '21': currentCentresList = centres21; break;
    case '71': currentCentresList = centres71_list; break;
    case '58': currentCentresList = centres58_list; break;
    case '89': currentCentresList = centres89_list; break;
    case '10': currentCentresList = centres10_list; break;
    case '52': currentCentresList = centres52_list; break;
    case '70': currentCentresList = centres70_list; break;
    case '39': currentCentresList = centres39_list; break;
    default: currentCentresList = [];
  }

  // Filter data based on search term
  const filteredMotifs = useMemo(() => {
    if (!searchTerm.trim()) return motifsData;

    const lowercasedSearch = searchTerm.toLowerCase();
    return motifsData.filter(item =>
      (item.motif && String(item.motif).toLowerCase().includes(lowercasedSearch)) ||
      (item.code && String(item.code).toLowerCase().includes(lowercasedSearch)) ||
      (item.vehicule && String(item.vehicule).toLowerCase().includes(lowercasedSearch)) ||
      (item.commune && String(item.commune).toLowerCase().includes(lowercasedSearch))
    );
  }, [searchTerm]);

  const handleCardClick = (motif) => {
    setSelectedMotif(motif);

    // No default personnel rows anymore as requested
    let defaultPersonnel = [];
    const veh = ''; 

    // Generate a random 6 digit number for the departure
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    setTicketData({
      numeroDepart: `${randomNum}-01-${caserne}`,
      operateurCta: cta,
      vehiculeAffiche: 'SANS VEHICULE',
      commune: motif.commune || '',
      voie: '',
      numeroPlan: '',
      coordonnees: '',
      contact: '',
      dateAppel: getCurrentDate(),
      observations: '',
      personnel: defaultPersonnel
    });
  };

  // Auto-focus logic when motif is selected
  useEffect(() => {
    if (selectedMotif) {
      setTimeout(() => {
        if (selectedMotif.commune) {
          voieRef.current?.focus();
        } else {
          communeRef.current?.focus();
        }
      }, 100);
    }
  }, [selectedMotif]);

  const handleCloseModal = () => {
    setSelectedMotif(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFonction = (pompierIndex, fonction) => {
    const newP = [...pompiers];
    const currentFonctions = newP[pompierIndex].fonction ? newP[pompierIndex].fonction.split(',').map(f => f.trim()).filter(f => f !== '') : [];
    
    if (currentFonctions.includes(fonction)) {
      newP[pompierIndex].fonction = currentFonctions.filter(f => f !== fonction).join(', ');
    } else {
      currentFonctions.push(fonction);
      newP[pompierIndex].fonction = currentFonctions.join(', ');
    }
    setPompiers(newP);
  };

  const toggleGradeFonction = (gradeIndex, fonction) => {
    const newG = [...availableGrades];
    const current = newG[gradeIndex].fonctions || [];
    if (current.includes(fonction)) {
      newG[gradeIndex].fonctions = current.filter(f => f !== fonction);
    } else {
      newG[gradeIndex].fonctions = [...current, fonction];
    }
    setAvailableGrades(newG);
  };

  const normalizeFunction = (f) => {
    if (!f) return "";
    return f.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  };

  const isFonctionAllowed = (gradeNom, fonctionNom) => {
    if (!gradeNom || !fonctionNom) return true;
    const nf = normalizeFunction(fonctionNom);
    const ng = normalizeFunction(gradeNom);
    
    // Hardcoded medical rules
    if ((nf === 'INF' || nf.includes('MEDIC') || nf.includes('SANTE')) && ng.includes('INFIRMIER')) return true;
    if ((nf === 'MED' || nf.includes('MEDIC') || nf.includes('SANTE')) && ng.includes('MEDECIN')) return true;

    const grade = availableGrades.find(g => normalizeFunction(g.nom) === ng);
    if (!grade || !grade.fonctions || grade.fonctions.length === 0) return true;
    
    return grade.fonctions.some(f => {
      const gnf = normalizeFunction(f);
      return gnf === nf || (nf.startsWith('EQ') && gnf.startsWith('EQ')) || (nf.startsWith('EQ') && gnf === 'EQUIPIER') || (nf === 'EQUIPIER' && gnf.startsWith('EQ'));
    });
  };

  const isVehicleAllowedForGrade = (gradeNom, engin) => {
    if (!gradeNom || !engin) return true;
    const cleanEngin = engin.toUpperCase().trim();
    const ng = normalizeFunction(gradeNom);
    
    // Le personnel médical peut armer des véhicules médicaux mais aussi d'autres véhicules légers (VL, VSAV, etc.)
    if (ng.includes('INFIRMIER') || ng.includes('MEDECIN')) {
      return cleanEngin.includes('INF') || cleanEngin.includes('MED') || cleanEngin.includes('VLM') || cleanEngin.includes('VL') || cleanEngin.includes('VSAV');
    }
    
    // Prevent non-medical personnel from taking medical vehicle seats
    if (cleanEngin.includes('INF') || cleanEngin.includes('MED') || cleanEngin.includes('VLM')) {
      return ng.includes('INFIRMIER') || ng.includes('MEDECIN');
    }
    
    return true;
  };

  const updatePersonnel = (index, field, value) => {
    const newPersonnel = [...ticketData.personnel];
    newPersonnel[index][field] = value;

    // Auto-fill logic when name is selected
    if (field === 'nom' && value !== '') {
      // Check if this person is already assigned to another seat
      const isAlreadyAssigned = newPersonnel.some((p, i) => i !== index && p.nom === value);
      if (isAlreadyAssigned) {
        alert(`⚠️ Attention : ${value} est déjà affecté à un autre poste sur ce départ.`);
        newPersonnel[index].nom = '';
        setTicketData({ ...ticketData, personnel: newPersonnel });
        return;
      }

      const pData = pompiers.find(p => p.nom === value);
      if (pData) {
        newPersonnel[index].matricule = pData.matricule || '';
        newPersonnel[index].grade = pData.grade || '';
        
        // Only fill function if the seat doesn't already have one assigned
        if (!newPersonnel[index].fonction) {
          newPersonnel[index].fonction = pData.fonction || '';
        }
      }
    }

    // Update header if engin changed
    let newVehiculeAffiche = ticketData.vehiculeAffiche;
    if (field === 'engin') {
      const uniqueEngins = [...new Set(newPersonnel.map(p => p.engin.trim()).filter(e => e !== ""))];
      newVehiculeAffiche = uniqueEngins.length > 0 ? uniqueEngins.join(' + ') : 'SANS VEHICULE';
    }

    setTicketData({ 
      ...ticketData, 
      personnel: newPersonnel,
      vehiculeAffiche: newVehiculeAffiche
    });
  };

  const checkPermitError = (pompierName, engin) => {
    if (!pompierName) return false;
    const pData = pompiers.find(f => f.nom === pompierName);
    if (!pData) return false;
    const req = getVehiclePermitType(engin, customVehicles);
    return (req === 'PL' && !pData.permisPL) || (req === 'VL' && !pData.permisVL);
  };

  const addPersonnelRow = () => {
    setTicketData({
      ...ticketData,
      personnel: [
        ...ticketData.personnel,
        { engin: '', fonction: '', nom: '', matricule: '', grade: '' }
      ]
    });
  };

  const addVehicle = (typeVehicule) => {
    let newRows = [];
    if (typeVehicule === 'VSAV') {
      newRows = [
        { engin: 'VSAV ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'VSAV ', fonction: 'COND', nom: '', matricule: '', grade: '' },
        { engin: 'VSAV ', fonction: 'EQ 1', nom: '', matricule: '', grade: '' },
        { engin: 'VSAV ', fonction: 'EQ 2', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'VSAV3') {
      newRows = [
        { engin: 'VSAV ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'VSAV ', fonction: 'COND', nom: '', matricule: '', grade: '' },
        { engin: 'VSAV ', fonction: 'EQ', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'FPT') {
      newRows = [
        { engin: 'FPT ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'FPT ', fonction: 'COND', nom: '', matricule: '', grade: '' },
        { engin: 'FPT ', fonction: 'CE BAT', nom: '', matricule: '', grade: '' },
        { engin: 'FPT ', fonction: 'EQ BAT', nom: '', matricule: '', grade: '' },
        { engin: 'FPT ', fonction: 'CE BAL', nom: '', matricule: '', grade: '' },
        { engin: 'FPT ', fonction: 'EQ BAL', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'SR') {
      newRows = [
        { engin: 'VSR ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'VSR ', fonction: 'COND', nom: '', matricule: '', grade: '' },
        { engin: 'VSR ', fonction: 'EQ', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'VTU') {
      newRows = [
        { engin: 'VTU ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'VTU ', fonction: 'COND', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'VLCG') {
      newRows = [
        { engin: 'VLCG ', fonction: 'COS', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'CCF') {
      newRows = [
        { engin: 'CCF ', fonction: 'CC', nom: '', matricule: '', grade: '' },
        { engin: 'CCF ', fonction: 'COND', nom: '', matricule: '', grade: '' },
        { engin: 'CCF ', fonction: 'EQ 1', nom: '', matricule: '', grade: '' },
        { engin: 'CCF ', fonction: 'EQ 2', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'EPA') {
      newRows = [
        { engin: 'EPA ', fonction: 'CA', nom: '', matricule: '', grade: '' },
        { engin: 'EPA ', fonction: 'COND', nom: '', matricule: '', grade: '' },
      ];
    } else if (typeVehicule === 'AUTRE') {
      const nomEngin = prompt("Nom de l'engin :");
      if (!nomEngin) return;
      newRows = [
        { engin: nomEngin.toUpperCase() + ' ', fonction: '', nom: '', matricule: '', grade: '' },
      ];
    } else {
      // Check for custom vehicles
      const customVeh = customVehicles.find(v => v.nom === typeVehicule);
      if (customVeh) {
        const count = parseInt(customVeh.personnel) || 1;
        newRows = Array.from({ length: count }, (_, i) => {
          let defaultFonction = i === 0 ? 'CA' : (i === 1 ? 'COND' : (count === 3 && i === 2 ? 'EQ' : `EQ ${i - 1}`));
          
          // Special case for medical vehicles
          if (customVeh.nom.toUpperCase().includes('INF')) defaultFonction = 'INF';
          if (customVeh.nom.toUpperCase().includes('MED')) defaultFonction = 'MED';

          return {
            engin: customVeh.nom + ' ', 
            fonction: defaultFonction, 
            nom: '', matricule: '', grade: ''
          };
        });
      }
    }

    if (newRows.length > 0) {
      const separatorRow = { engin: '', fonction: '', nom: '', matricule: '', grade: '' };
      const finalRows = ticketData.personnel.length > 0 
        ? [...ticketData.personnel, separatorRow, ...newRows] 
        : [...newRows];

      setTicketData({
        ...ticketData,
        personnel: finalRows,
        vehiculeAffiche: ticketData.vehiculeAffiche !== 'SANS VEHICULE' && ticketData.vehiculeAffiche !== ''
          ? `${ticketData.vehiculeAffiche} + ${newRows[0]?.engin.trim()}`
          : newRows[0]?.engin.trim()
      });
    }
  };

  const removePersonnelRow = (index) => {
    const newPersonnel = ticketData.personnel.filter((_, i) => i !== index);
    
    // Recalculate vehiculeAffiche from remaining rows
    const uniqueEngins = [...new Set(newPersonnel.map(p => p.engin.trim()).filter(e => e !== ""))];
    const newVehiculeAffiche = uniqueEngins.length > 0 ? uniqueEngins.join(' + ') : 'SANS VEHICULE';

    setTicketData({ 
      ...ticketData, 
      personnel: newPersonnel,
      vehiculeAffiche: newVehiculeAffiche
    });
  };

  const fillRandomPersonnel = () => {
    const newPersonnel = [...ticketData.personnel];
    const assignedNames = new Set();

    // Clear existing names to allow re-randomization on each click
    newPersonnel.forEach((row, index) => {
      newPersonnel[index] = { ...row, nom: '', matricule: '', grade: '' };
    });

    // Fill rows
    newPersonnel.forEach((row, index) => {

      const seatFonction = row.fonction ? row.fonction.trim().toUpperCase() : '';
      const engin = row.engin ? row.engin.trim() : '';
      const reqPermit = getVehiclePermitType(engin, customVehicles);

      // Find compatible firefighters
      const compatible = pompiers.filter(p => {
        if (assignedNames.has(p.nom)) return false;
        
        const pFonctions = p.fonction ? p.fonction.split(',').map(s => s.trim().toUpperCase()) : [];
        
        const nfSeat = normalizeFunction(seatFonction);
        const isEqSeat = nfSeat.startsWith('EQ') || nfSeat === 'EQUIPIER';
        
        const pHasEq = pFonctions.some(f => {
          const nfP = normalizeFunction(f);
          return nfP.startsWith('EQ') || nfP === 'EQUIPIER';
        });
        
        const ng = normalizeFunction(p.grade);
        const medicalMatch = ((nfSeat === 'INF' || nfSeat.includes('MEDIC') || nfSeat.includes('SANTE')) && ng.includes('INFIRMIER')) || 
                             ((nfSeat === 'MED' || nfSeat.includes('MEDIC') || nfSeat.includes('SANTE')) && ng.includes('MEDECIN'));

        const matchesFonction = medicalMatch || 
                               pFonctions.some(f => normalizeFunction(f) === nfSeat) || 
                               nfSeat === '' || 
                               (isEqSeat && pHasEq);
        
        // Check if grade allows this function
        const matchesGrade = isFonctionAllowed(p.grade, seatFonction);

        // Check vehicle-grade compatibility (Medical personnel)
        const matchesVehicle = isVehicleAllowedForGrade(p.grade, engin);

        let matchesPermit = true;
        if (seatFonction === 'COND' || seatFonction === 'CONDUCTEUR') {
          matchesPermit = (reqPermit === 'PL' ? p.permisPL : p.permisVL);
        }

        return matchesFonction && matchesGrade && matchesVehicle && matchesPermit;
      });

      if (compatible.length > 0) {
        const picked = compatible[Math.floor(Math.random() * compatible.length)];
        newPersonnel[index] = {
          ...row,
          nom: picked.nom,
          matricule: picked.matricule || '',
          grade: picked.grade || ''
        };
        assignedNames.add(picked.nom);
      }
    });

    setTicketData({ ...ticketData, personnel: newPersonnel });
  };

  const triggerBipAlert = async () => {
    const assignedPersonnel = ticketData.personnel.filter(p => p.nom && p.nom.trim() !== '');
    
    if (assignedPersonnel.length === 0) {
      alert("Aucun pompier n'est affecté à cette intervention.");
      return;
    }

    const alertTargets = [];
    assignedPersonnel.forEach(ap => {
      const dbPompier = pompiers.find(p => p.nom.trim() === ap.nom.trim());
      if (dbPompier && dbPompier.telephone && dbPompier.telephone.trim() !== '') {
        alertTargets.push(dbPompier.telephone.trim());
      }
    });

    if (alertTargets.length === 0) {
      alert("Aucun des pompiers affectés n'a de numéro de téléphone configuré dans la gestion du personnel.");
      return;
    }

    const motifText = selectedMotif ? selectedMotif.motif : 'Intervention';
    const codeText = selectedMotif && selectedMotif.code ? ` (${selectedMotif.code})` : '';
    const adresse = `${ticketData.commune || ''} ${ticketData.voie || ''}`.trim();
    const obs = ticketData.observations ? ` - OBS: ${ticketData.observations.trim()}` : '';
    
    const message = `${motifText}${codeText} - ADRESSE: ${adresse || 'Non précisée'}${obs}`;

    try {
      const resp = await fetch('https://manoeuvre-bip.vercel.app/api/trigger-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones: alertTargets,
          message,
          title: '🚨 ALERTE MANOEUVRE !'
        })
      });

      const result = await resp.json();

      if (result.sent > 0 && result.failed === 0) {
        alert(`✅ Bip déclenché avec succès pour ${result.sent} pompier(s) !`);
      } else if (result.sent > 0) {
        alert(`⚠️ Bip déclenché pour ${result.sent} pompier(s).\n${result.failed} pompier(s) n'ont pas encore activé leur bip sur leur téléphone.`);
      } else {
        alert(`❌ Aucun bip n'a pu être déclenché.\n\nVérifiez que les pompiers ont bien ouvert ManoeuvreBip sur leur téléphone et cliqué sur "Activer le Bip".\n\nErreurs : ${result.errors?.join(', ') || 'Inconnue'}`);
      }
    } catch (err) {
      alert(`❌ Impossible de joindre le serveur ManoeuvreBip.\n\nVérifiez votre connexion internet.`);
    }
  };

  const [voiesList, setVoiesList] = useState(default_voies);

  // Fetch streets dynamically when commune or voie changes
  useEffect(() => {
    if (!ticketData.commune) return;

    // We delay the fetch slightly to avoid spamming the API while typing
    const timeoutId = setTimeout(() => {
      const query = ticketData.voie ? `${ticketData.voie} ${ticketData.commune}` : ticketData.commune;

      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=street&limit=15`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.features && Array.isArray(data.features)) {
            const streets = data.features.map(f => f.properties.name);
            setVoiesList([...new Set(streets)]);
          }
        })
        .catch(err => {
          // Silent fail for offline mode
        });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [ticketData.commune, ticketData.voie]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
      {/* Hidden Datalists for dropdowns */}
      <datalist id="centres-list">
        {currentCentresList.map((c, i) => <option key={i} value={c} />)}
      </datalist>
      <datalist id="communes-list">
        {communesList.map((c, i) => <option key={i} value={c} />)}
      </datalist>
      <datalist id="voies-list">
        {voiesList.map((v, i) => <option key={i} value={v} />)}
      </datalist>
      <datalist id="contacts-list">
        <option value="Appelant" />
        <option value="Gendarmerie" />
        <option value="Police" />
        <option value="SAMU" />
        <option value="Mairie" />
        <option value="Enedis" />
        <option value="GRDF" />
      </datalist>
      <datalist id="pompiers-list">
        {pompiers.slice().sort((a, b) => a.nom.localeCompare(b.nom)).map((p, i) => <option key={i} value={p.nom} />)}
      </datalist>
      <datalist id="pompiers-list-vl">
        {pompiers.filter(p => p.permisVL).sort((a, b) => a.nom.localeCompare(b.nom)).map((p, i) => <option key={i} value={p.nom} />)}
      </datalist>
      <datalist id="pompiers-list-pl">
        {pompiers.filter(p => p.permisPL).sort((a, b) => a.nom.localeCompare(b.nom)).map((p, i) => <option key={i} value={p.nom} />)}
      </datalist>
      <datalist id="fonctions-list">
        {sortFonctions(availableFonctions).map((f, i) => <option key={i} value={f} />)}
      </datalist>
      <datalist id="grades-list">
        {sortGrades(availableGrades).map((g, i) => <option key={i} value={typeof g === 'string' ? g : g.nom} />)}
      </datalist>
      <datalist id="vehicules-list">
        {customVehicles.map((v, i) => <option key={i} value={v.nom} />)}
      </datalist>

      <header className="header no-print">
        <div className="settings-btn-container" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-settings" onClick={() => { setShowManual(!showManual); setShowSettings(false); }}>
            {showManual ? '🏠 Accueil' : '📖 Mode d\'emploi'}
          </button>
          <button className="btn-settings" onClick={() => { setShowSettings(!showSettings); setShowManual(false); }}>
            {showSettings ? '🏠 Accueil' : '⚙️ Paramètres Personnel'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dpt :</span>
            <input
              type="text"
              maxLength="3"
              style={{ width: '40px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', outline: 'none' }}
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Centre :</span>
            <input
              type="text"
              list="centres-list"
              style={{ width: '100px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', outline: 'none', textTransform: 'uppercase' }}
              value={caserne}
              onChange={(e) => setCaserne(e.target.value.toUpperCase())}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CTA :</span>
            <input
              type="text"
              style={{ width: '120px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', outline: 'none', textTransform: 'uppercase' }}
              value={cta}
              onChange={(e) => setCta(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <img src="./logo.png" alt="Logo Pompier" style={{ width: '60px', height: 'auto' }} />
          <h1 style={{ margin: 0 }}>Mes Manoeuvres</h1>
        </div>
        <p>Générateur d'Ordre de Départ (OD)</p>
      </header>

      {showManual ? (
        <div className="settings-container no-print" style={{ textAlign: 'left', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Mode d'Emploi - "Mes Manœuvres"</h1>
          <p>Bienvenue dans le manuel d'utilisation de l'application <strong>Mes Manœuvres</strong>, votre générateur d'Ordres de Départ (OD) informatisé.</p>
          
          <h2 className="section-title">1. Démarrage de l'application</h2>
          <p>L'application est conçue pour fonctionner sans installation complexe et sans nécessiter de connexion internet.</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Option A (Recommandée) :</strong> Double-cliquez sur le fichier <code>Mes Manoeuvres Setup.exe</code> pour installer l'application sur l'ordinateur. C'est le mode le plus stable et complet.</li>
            <li><strong>Option B (Portable) :</strong> Si vous ne voulez pas installer, ouvrez le dossier <code>win-unpacked</code> et lancez <code>Mes Manoeuvres.exe</code>.</li>
            <li><strong>Option C (Navigateur) :</strong> Double-cliquez sur le fichier <code>index.html</code>. L'application s'ouvrira dans votre navigateur (Chrome, Edge...).</li>
            <li><em>Rappel important :</em> Vos réglages (personnel, véhicules) sont sauvegardés sur l'ordinateur. Pour passer d'un ordinateur à un autre, utilisez les boutons <strong>Exporter / Importer</strong> dans les Paramètres.</li>
          </ul>

          <h2 className="section-title">2. Configuration Initiale</h2>
          <p>Avant de générer votre premier ticket, il est recommandé de configurer votre centre et votre personnel.</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>En-tête :</strong> Configurez votre Département, Centre (Caserne) et CTA.</li>
            <li><strong>Paramètres :</strong> Cliquez sur "⚙️ Paramètres Personnel" en haut à droite.</li>
            <li><strong>Le Personnel :</strong> Renseignez Nom, Matricule et Grade. Cliquez sur les étiquettes pour attribuer des compétences (CA, COND...) et sur VL/PL pour les permis.</li>
            <li><strong>Les Véhicules (plus bas) :</strong> Modifiez ou ajoutez vos propres véhicules avec le bon nombre de places et le permis requis.</li>
            <li><strong>Les Fonctions et Grades (tout en bas) :</strong> Gérez les listes déroulantes de l'application. Très important : <strong>définissez les fonctions autorisées pour chaque grade</strong> afin que le remplissage aléatoire soit intelligent !</li>
            <li><strong>Sauvegarde :</strong> Tout est sauvegardé automatiquement à chaque modification.</li>
          </ul>

          <h2 className="section-title">3. Générer un Ordre de Départ</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Choisir le motif :</strong> Utilisez la barre de recherche et cliquez sur la carte correspondante.</li>
            <li><strong>Renseigner les détails :</strong> Remplissez la Commune, Voie, Contact, et Observations.</li>
            <li><strong>Ajouter un engin :</strong> Cliquez sur les boutons de véhicules en bas (VSAV, FPT...). L'application créera les lignes de personnel requises.</li>
            <li><strong>Affectation Manuelle :</strong> Cliquez dans la case "Nom" d'une ligne. Si vous tapez le nom d'un pompier, son matricule, grade et fonction se rempliront automatiquement.</li>
            <li><strong>Remplissage Aléatoire :</strong> Cliquez sur le bouton "🎲 Remplir Aléatoirement". L'application analysera vos véhicules et vos "Paramètres Personnel" pour affecter les pompiers disponibles et <em>compétents</em> pour chaque poste (en vérifiant les permis et fonctions).</li>
          </ul>

          <h2 className="section-title">4. Impression et Fermeture</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Une fois le ticket rempli, cliquez sur <strong>"🖨️ Imprimer"</strong>.</li>
            <li>L'application passera automatiquement dans un format épuré, parfait pour sortir sur l'imprimante de la caserne.</li>
            <li>Pour quitter le ticket, cliquez simplement sur <strong>"Fermer"</strong>.</li>
          </ul>

          <h2 className="section-title">5. Astuces et Règles de l'application</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Sécurité des affectations :</strong> L'application vous empêchera d'affecter accidentellement le même pompier à deux postes différents sur le même départ.</li>
            <li><strong>Règles Médicales :</strong> Seul un Infirmier ou une Infirmière peut monter dans un véhicule "INF" ou prendre un poste "INF". Idem pour les Médecins.</li>
            <li><strong>Compatibilité :</strong> Lors du remplissage aléatoire, si aucune personne n'a les compétences requises pour un poste (ex: aucun conducteur PL disponible), la case restera vide pour vous alerter.</li>
          </ul>

          <h2 className="section-title">6. Téléalerte Bip Sapeurs-Pompiers & Bip 1-Clic / QR Code</h2>
          <p>L'application est directement interconnectée au système de téléalerte <strong>ManoeuvreBip</strong> pour faire sonner les bips des pompiers lors des départs.</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Déclencher les Bips :</strong> Lors de l'armement d'un départ, cliquez sur le bouton orange <strong>"📢 Déclencher les Bips"</strong>. Les bips et smartphones des pompiers affectés sonneront immédiatement.</li>
            <li><strong>Application Android Native (.apk) :</strong> Cliquez sur le bouton vert <strong>"📲 App Bip (.apk)"</strong> pour télécharger l'application Android native réveil d'écran automatique.</li>
            <li><strong>Activation 1-Clic & QR Code pour le personnel (Recommandé) :</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem' }}>
                <li>Allez dans <strong>"⚙️ Paramètres Personnel"</strong>.</li>
                <li>En face de chaque pompier, cliquez sur le bouton bleu <strong>"📱 QR Code"</strong>.</li>
                <li>Faites scanner le QR Code à l'écran avec l'appareil photo du smartphone du pompier <em>OU</em> cliquez sur <strong>"📋 Copier Lien 1-Clic"</strong> pour lui envoyer son accès direct par WhatsApp / SMS.</li>
                <li>Sur son écran, le pompier n'a qu'à toucher le bouton <strong>"🔔 Activer Mon Bip"</strong> : son téléphone est pré-configuré et activé en 3 secondes sans aucune saisie !</li>
              </ul>
            </li>
          </ul>
        </div>
      ) : showSettings ? (
        <div className="settings-container no-print">
          <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '1rem' }}>Gestion du Personnel</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button className="btn-small" style={{ background: '#4a5568' }} onClick={handleExportPersonnel}>
              📤 Sauvegarder la liste sur la clé (Export)
            </button>
            <label className="btn-small" style={{ background: '#4a5568', cursor: 'pointer', display: 'inline-block' }}>
              📥 Charger une liste (Import)
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportPersonnel} />
            </label>
            <a 
              href="/ManoeuvreBip.apk" 
              download="ManoeuvreBip.apk"
              className="btn-small"
              style={{ background: '#10b981', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
              title="Optionnel : Application Native Android pour réveil automatique d'écran éteint"
            >
              📲 App Bip Native (.apk)
            </a>
          </div>

          <div className="mobile-card-list">
            {pompiers.map((p, index) => (
              <div key={index} className="mobile-card-item pompier-card">
                {/* Ligne 1 : Nom + bouton supprimer */}
                <div className="mobile-card-row">
                  <input
                    type="text"
                    className="mobile-card-input"
                    placeholder="Nom complet"
                    value={p.nom}
                    onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].nom = e.target.value;
                      setPompiers(newP);
                    }}
                    onBlur={() => {
                      const sorted = [...pompiers].sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
                      setPompiers(sorted);
                    }}
                  />
                  <button className="btn-delete" style={{ flexShrink: 0 }} onClick={() => {
                    if (confirm(`Supprimer ${p.nom || 'ce pompier'} ?`)) {
                      setPompiers(pompiers.filter((_, i) => i !== index));
                    }
                  }}>×</button>
                </div>

                {/* Ligne 2 : Matricule + Grade */}
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Mat.</span>
                  <input
                    type="text"
                    className="mobile-card-input"
                    placeholder="Matricule"
                    style={{ maxWidth: '100px' }}
                    value={p.matricule}
                    onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].matricule = e.target.value;
                      setPompiers(newP);
                    }}
                  />
                  <span className="mobile-card-label">Grade</span>
                  <input
                    type="text"
                    list="grades-list"
                    className="mobile-card-input"
                    placeholder="Grade"
                    value={p.grade}
                    onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].grade = e.target.value;
                      setPompiers(newP);
                    }}
                  />
                </div>

                {/* Ligne 3 : Permis VL/PL + Téléphone */}
                <div className="mobile-card-row">
                  <div
                    className={`permit-badge ${p.permisVL ? 'active-vl' : ''}`}
                    onClick={() => {
                      const newP = [...pompiers];
                      newP[index].permisVL = !newP[index].permisVL;
                      setPompiers(newP);
                    }}
                  >VL</div>
                  <div
                    className={`permit-badge ${p.permisPL ? 'active-pl' : ''}`}
                    onClick={() => {
                      const newP = [...pompiers];
                      newP[index].permisPL = !newP[index].permisPL;
                      setPompiers(newP);
                    }}
                  >PL</div>
                  <input
                    type="text"
                    className="mobile-card-input"
                    placeholder="📞 Téléphone BIP"
                    value={p.telephone || ''}
                    onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].telephone = e.target.value.trim().replace(/\s+/g, '');
                      setPompiers(newP);
                    }}
                  />
                  {p.telephone ? (
                    <button
                      className="btn"
                      style={{ background: 'linear-gradient(135deg, #0984e3, #6c5ce7)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                      onClick={() => setQrModalPompier(p)}
                    >📱 QR</button>
                  ) : null}
                </div>

                {/* Ligne 4 : Fonctions */}
                <div className="mobile-card-label">Fonctions :</div>
                <div className="badges-grid">
                  {sortFonctions(availableFonctions).map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className={`badge-item ${p.fonction && p.fonction.split(',').map(s => s.trim()).includes(f) ? 'active' : ''}`}
                      onClick={() => toggleFonction(index, f)}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-print" onClick={() => {
              setPompiers([...pompiers, { nom: '', matricule: '', fonction: '', grade: '', permisVL: false, permisPL: false, telephone: '' }]);
            }}>+ Ajouter un Pompier</button>

          </div>

          <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', margin: '3rem 0 2rem 0' }}>Gestion des Véhicules</h2>
          <div className="mobile-card-list">
            {customVehicles.map((v, index) => (
              <div key={index} className="mobile-card-item">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Engin</span>
                  <input type="text" className="mobile-card-input" value={v.nom} placeholder="Nom de l'engin" onChange={(e) => {
                    const newV = [...customVehicles];
                    newV[index].nom = e.target.value.toUpperCase();
                    setCustomVehicles(newV);
                  }} />
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Pers.</span>
                  <input type="number" min="1" max="10" className="mobile-card-input" style={{ width: '80px' }} value={v.personnel} onChange={(e) => {
                    const newV = [...customVehicles];
                    newV[index].personnel = e.target.value;
                    setCustomVehicles(newV);
                  }} />
                  <span className="mobile-card-label" style={{ marginLeft: '1rem' }}>Permis</span>
                  <select
                    value={v.permis || 'VL'}
                    className="mobile-card-input"
                    style={{ width: '80px', background: 'var(--surface-color)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px' }}
                    onChange={(e) => {
                      const newV = [...customVehicles];
                      newV[index].permis = e.target.value;
                      setCustomVehicles(newV);
                    }}
                  >
                    <option value="VL" style={{ color: 'black' }}>VL</option>
                    <option value="PL" style={{ color: 'black' }}>PL</option>
                  </select>
                  <button className="btn-delete" style={{ marginLeft: 'auto' }} onClick={() => {
                    if (confirm(`Supprimer l'engin ${v.nom} ?`)) {
                      setCustomVehicles(customVehicles.filter((_, i) => i !== index));
                    }
                  }}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-print" onClick={() => {
              setCustomVehicles([...customVehicles, { nom: '', personnel: '1', permis: 'VL' }]);
            }}>+ Ajouter un Engin</button>
          </div>

          <div className="settings-two-columns" style={{ marginTop: '3rem' }}>
            <div>
              <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '1rem' }}>Liste des Fonctions</h2>
              <div className="mobile-card-list">
                {sortFonctions(availableFonctions).map((f, index) => (
                  <div key={index} className="mobile-card-item">
                    <div className="mobile-card-row">
                      <input type="text" className="mobile-card-input" value={f} placeholder="Nom de la fonction" onChange={(e) => {
                        const newF = [...availableFonctions];
                        newF[index] = e.target.value.toUpperCase();
                        setAvailableFonctions(newF);
                      }} />
                      <button className="btn-delete" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => {
                        setAvailableFonctions(availableFonctions.filter((_, i) => i !== index));
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-print" onClick={() => setAvailableFonctions([...availableFonctions, ""])}>+ Ajouter une Fonction</button>
              </div>
            </div>

            <div>
              <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '1rem' }}>Liste des Grades</h2>
              <div className="mobile-card-list">
                {sortGrades(availableGrades).map((g, index) => (
                  <div key={index} className="mobile-card-item">
                    <div className="mobile-card-row">
                      <input type="text" className="mobile-card-input" value={g.nom} placeholder="Nom du grade" onChange={(e) => {
                        const newG = [...availableGrades];
                        newG[index].nom = e.target.value;
                        setAvailableGrades(newG);
                      }} />
                      <button className="btn-delete" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => {
                        setAvailableGrades(availableGrades.filter((_, i) => i !== index));
                      }}>×</button>
                    </div>
                    <div className="mobile-card-label" style={{ marginBottom: '4px' }}>Fonctions autorisées :</div>
                    <div className="badges-grid">
                      {sortFonctions(availableFonctions).map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className={`badge-item ${g.fonctions && g.fonctions.includes(f) ? 'active' : ''}`}
                          onClick={() => toggleGradeFonction(index, f)}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-print" onClick={() => setAvailableGrades([...availableGrades, { nom: "", fonctions: [] }])}>+ Ajouter un Grade</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="search-container no-print">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher par motif, code, véhicule ou commune..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container no-print">
            {filteredMotifs.length > 0 ? (
              filteredMotifs.map((item, index) => (
                <div
                  className="card"
                  key={index}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="card-header">
                    {item.code ? <span className="code-badge">{item.code}</span> : <span></span>}
                  </div>
                  <h2 className="card-title">{item.motif || 'Motif non précisé'}</h2>
                </div>
              ))
            ) : (
              <div className="no-results">
                Aucun motif trouvé pour "{searchTerm}"
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal / Ticket Validation */}
      {selectedMotif && (
        <div className="modal-overlay">
          <div className="modal-content printable-ticket" onClick={(e) => e.stopPropagation()}>
            <>
              {/* Header of the Printable Ticket */}
                <div className="ticket-print-header">
                  <div className="ticket-print-left">
                    <div className="ticket-print-box">DEPART STANDARD</div>
                    <div className="ticket-print-box">{getCurrentDate()}</div>

                    <input
                      type="text"
                      className="ticket-header-input"
                      style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit' }}
                      value={ticketData.numeroDepart}
                      onChange={(e) => setTicketData({ ...ticketData, numeroDepart: e.target.value })}
                    />

                    <div className="ticket-print-row">
                      <span>Rang : 1</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>traité par : </span>
                        <input
                          type="text"
                          className="ticket-header-input"
                          style={{ marginLeft: '0.5rem', width: '150px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
                          value={ticketData.operateurCta}
                          onChange={(e) => setTicketData({ ...ticketData, operateurCta: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ticket-print-right">
                    <input
                      type="text"
                      className="ticket-vehicule-big"
                      style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', width: '100%', textAlign: 'right', outline: 'none' }}
                      value={ticketData.vehiculeAffiche}
                      onChange={(e) => setTicketData({ ...ticketData, vehiculeAffiche: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ticket-sinistre">
                  <strong>sinistre :</strong> {selectedMotif.motif} {selectedMotif.code && `(${selectedMotif.code})`}
                </div>

                <h3 className="section-title">Localisation du sinistre</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="input-commune">Commune</label>
                    <select
                      id="input-commune"
                      value={ticketData.commune}
                      onChange={(e) => setTicketData({ ...ticketData, commune: e.target.value })}
                      className="ticket-select no-print"
                    >
                      <option value="">-- Sélectionner une commune --</option>
                      {communesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                    <div className="print-only" style={{ flex: 1, paddingLeft: '5px' }}>
                      {ticketData.commune}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="input-voie">Voie</label>
                    <div className="no-print" style={{ display: 'flex', gap: '5px', flex: 1 }}>
                      <input
                        id="input-voie"
                        type="text"
                        list="voies-list"
                        placeholder="Sélectionner ou saisir une voie..."
                        value={ticketData.voie}
                        onChange={(e) => setTicketData({ ...ticketData, voie: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                      />
                    </div>
                    <div className="print-only" style={{ flex: 1, paddingLeft: '5px' }}>
                      {ticketData.voie}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="input-contact">Contact</label>
                    <select
                      id="input-contact"
                      value={ticketData.contact}
                      onChange={(e) => setTicketData({ ...ticketData, contact: e.target.value })}
                      className="ticket-select no-print"
                    >
                      <option value="">-- Sélectionner un contact --</option>
                      <option value="Appelant">Appelant</option>
                      <option value="Gendarmerie">Gendarmerie</option>
                      <option value="Police">Police</option>
                      <option value="SAMU">SAMU</option>
                      <option value="Mairie">Mairie</option>
                      <option value="Enedis">Enedis</option>
                      <option value="GRDF">GRDF</option>
                    </select>
                    <div className="print-only" style={{ flex: 1, paddingLeft: '5px' }}>
                      {ticketData.contact}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="input-plan">N° de plan</label>
                    <input
                      type="text"
                      id="input-plan"
                      value={ticketData.numeroPlan}
                      onChange={(e) => setTicketData({ ...ticketData, numeroPlan: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="input-date">Date Appel</label>
                    <input
                      type="text"
                      id="input-date"
                      value={ticketData.dateAppel}
                      onChange={(e) => setTicketData({ ...ticketData, dateAppel: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="input-coords">Coordonnées</label>
                    <input
                      type="text"
                      id="input-coords"
                      value={ticketData.coordonnees}
                      onChange={(e) => setTicketData({ ...ticketData, coordonnees: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="section-title">Observations</h3>
                <textarea
                  className="observations-input"
                  rows="2"
                  value={ticketData.observations}
                  onChange={(e) => setTicketData({ ...ticketData, observations: e.target.value })}
                ></textarea>

                <div className="section-header-flex">
                  <h3 className="section-title">ARMEMENT DU VEHICULE</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
                    <button 
                      className="btn-small" 
                      style={{ background: 'var(--success-color)' }}
                      onClick={fillRandomPersonnel}
                    >
                      🎲 Remplir Aléatoirement
                    </button>
                    <select
                      className="btn-small"
                      style={{ background: 'var(--surface-color)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
                      onChange={(e) => {
                        if (e.target.value) {
                          addVehicle(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Ajouter un Engin</option>
                      <option value="VSAV">VSAV (4 pers)</option>
                      <option value="VSAV3">VSAV (3 pers)</option>
                      <option value="FPT">FPT / CCR (6 pers)</option>
                      <option value="SR">VSR / SR (3 pers)</option>
                      <option value="VTU">VTU / VID (2 pers)</option>
                      <option value="VLCG">VLCG / VL (1 pers)</option>
                      <option value="CCF">CCF (4 pers)</option>
                      <option value="EPA">EPA / MEA (2 pers)</option>
                      {customVehicles.map((v, i) => (
                        <option key={i} value={v.nom}>{v.nom} ({v.personnel} pers)</option>
                      ))}
                      <option value="AUTRE">AUTRE (Saisie ponctuelle)</option>
                    </select>
                    <button className="btn-small" onClick={addPersonnelRow}>+ 1 Ligne</button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="personnel-table">
                    <thead>
                      <tr>
                        <th style={{ width: '9%' }}>ENGINS</th>
                        <th style={{ width: '35%' }}>NOM</th>
                        <th style={{ width: '5%' }}>MATRICULE</th>
                        <th style={{ width: '18%' }}>FONCTION</th>
                        <th style={{ width: '28%' }}>GRADE</th>
                        <th className="no-print" style={{ width: '5%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketData.personnel.map((p, index) => (
                        <tr key={index}>
                          <td><input type="text" list="vehicules-list" value={p.engin} onChange={(e) => updatePersonnel(index, 'engin', e.target.value)} /></td>
                          <td>
                            <input 
                              type="text" 
                              list={(p.fonction === 'COND' || p.fonction === 'CONDUCTEUR') 
                                ? (getVehiclePermitType(p.engin, customVehicles) === 'PL' ? 'pompiers-list-pl' : 'pompiers-list-vl')
                                : 'pompiers-list'
                              }
                              className={((p.fonction === 'COND' || p.fonction === 'CONDUCTEUR') && checkPermitError(p.nom, p.engin)) || !isVehicleAllowedForGrade(p.grade, p.engin) ? 'permit-error' : ''}
                              value={p.nom} 
                              onChange={(e) => updatePersonnel(index, 'nom', e.target.value)} 
                            />
                            {(p.fonction === 'COND' || p.fonction === 'CONDUCTEUR') && checkPermitError(p.nom, p.engin) && (
                              <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 'bold' }}>PERMIS NON VALIDE</div>
                            )}
                            {!isVehicleAllowedForGrade(p.grade, p.engin) && (
                              <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 'bold' }}>GRADE NON COMPATIBLE AVEC CE VÉHICULE</div>
                            )}
                          </td>
                          <td><input type="text" value={p.matricule} onChange={(e) => updatePersonnel(index, 'matricule', e.target.value)} /></td>
                          <td>
                            <input 
                              type="text" 
                              list="fonctions-list" 
                              className={!isFonctionAllowed(p.grade, p.fonction) ? 'permit-error' : ''}
                              value={p.fonction} 
                              onChange={(e) => updatePersonnel(index, 'fonction', e.target.value)} 
                            />
                            {!isFonctionAllowed(p.grade, p.fonction) && (
                              <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 'bold' }}>FONCTION NON AUTORISÉE</div>
                            )}
                          </td>
                          <td><input type="text" list="grades-list" value={p.grade} onChange={(e) => updatePersonnel(index, 'grade', e.target.value)} /></td>
                          <td className="no-print">
                            <button className="btn-delete" onClick={() => removePersonnelRow(index)}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions no-print" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button className="btn btn-cancel" onClick={handleCloseModal}>
                    Fermer
                  </button>
                  <button 
                    className="btn btn-confirm" 
                    style={{ background: '#f97316', color: 'white' }} 
                    onClick={triggerBipAlert}
                  >
                    📢 Déclencher les Bips
                  </button>
                  <button className="btn btn-print" onClick={handlePrint}>
                    🖨️ Imprimer
                  </button>
                </div>
            </>
          </div>
        </div>
      )}

      {qrModalPompier && (
        <div className="modal-overlay" onClick={() => setQrModalPompier(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#1e293b', padding: '2rem', borderRadius: '20px', maxWidth: '420px', width: '90%', textAlign: 'center', color: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#38bdf8', marginTop: 0, fontSize: '20px', fontWeight: 'bold' }}>📱 Bip 1-Clic Sapeur-Pompier</h2>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '10px 0 2px 0' }}>{qrModalPompier.nom}</p>
            <p style={{ color: '#94a3b8', margin: '0 0 15px 0', fontSize: '14px' }}>N° Téléphone : {qrModalPompier.telephone}</p>
            
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', margin: '10px 0', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://manoeuvre-bip.vercel.app/?phone=${qrModalPompier.telephone}&name=${encodeURIComponent(qrModalPompier.nom)}&auto=1`)}`} 
                alt="QR Code Bip Pompier"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 20px 0' }}>Faites scanner ce QR Code avec l'appareil photo du téléphone de {qrModalPompier.nom}.</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn" 
                style={{ background: '#8b5cf6', color: 'white', fontWeight: 'bold', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
                onClick={() => {
                  const url = `https://manoeuvre-bip.vercel.app/?phone=${qrModalPompier.telephone}&name=${encodeURIComponent(qrModalPompier.nom)}&auto=1`;
                  navigator.clipboard.writeText(url);
                  alert(`✅ Lien 1-Clic copié pour ${qrModalPompier.nom} !\n\nVous pouvez le coller directement dans WhatsApp ou par SMS.`);
                }}
              >
                📋 Copier Lien 1-Clic
              </button>
              <button 
                className="btn"
                style={{ background: '#475569', color: 'white', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', border: 'none' }} 
                onClick={() => setQrModalPompier(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
