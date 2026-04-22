import { useState, useMemo, useEffect } from 'react';
import './App.css';
import motifsData from './data.json';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  // States for dynamic communes and settings
  const [departement, setDepartement] = useState('21'); // Default to Côte-d'Or
  const [communesList, setCommunesList] = useState([]);
  const [caserne, setCaserne] = useState('LIER');
  const [cta, setCta] = useState('ST03-CTA-21');

  // Form state for the ticket
  const [ticketData, setTicketData] = useState({
    numeroDepart: '',
    operateurCta: '',
    vehiculeAffiche: '',
    commune: '',
    voie: '',
    contact: '',
    observations: '',
    personnel: []
  });

  // Settings state for firemen
  const [pompiers, setPompiers] = useState(() => {
    const saved = localStorage.getItem('pompiers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSettings, setShowSettings] = useState(false);

  // Settings state for vehicles
  const [customVehicles, setCustomVehicles] = useState(() => {
    const saved = localStorage.getItem('customVehicles');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings state for functions and grades
  const [availableFonctions, setAvailableFonctions] = useState(() => {
    const saved = localStorage.getItem('availableFonctions');
    return saved ? JSON.parse(saved) : ["CA", "COND", "CE", "BAT", "BAL", "EQ 1", "EQ 2", "EQ BAT 1", "EQ BAT 2", "EQ BAL 1", "EQ BAL 2", "COS", "CC", "CHEF D'AGRÈS", "CONDUCTEUR", "ÉQUIPIER"];
  });

  const [availableGrades, setAvailableGrades] = useState(() => {
    const saved = localStorage.getItem('availableGrades');
    return saved ? JSON.parse(saved) : ["Sapeur", "Sapeur 1ère Classe", "Caporal", "Caporal-Chef", "Sergent", "Sergent-Chef", "Adjudant", "Adjudant-Chef", "Lieutenant", "Capitaine", "Commandant", "Lieutenant-Colonel", "Colonel", "Infirmier", "Médecin"];
  });

  useEffect(() => {
    localStorage.setItem('pompiers', JSON.stringify(pompiers));
  }, [pompiers]);

  useEffect(() => {
    localStorage.setItem('customVehicles', JSON.stringify(customVehicles));
  }, [customVehicles]);

  useEffect(() => {
    localStorage.setItem('availableFonctions', JSON.stringify(availableFonctions));
  }, [availableFonctions]);

  useEffect(() => {
    localStorage.setItem('availableGrades', JSON.stringify(availableGrades));
  }, [availableGrades]);

  // Fetch communes when department changes
  useEffect(() => {
    if (!departement || departement.length < 2) return;

    // Auto-update CTA
    setCta(`ST03-CTA-${departement}`);

    fetch(`https://geo.api.gouv.fr/communes?codeDepartement=${departement}&fields=nom&format=json`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(c => c.nom).sort();
        setCommunesList(names);
      })
      .catch(err => console.error("Erreur de chargement des communes:", err));
  }, [departement]);

  // Known Centres de Secours for dropdown
  const centres21 = [
    "AIGNAY-LE-DUC", "ARNAY-LE-DUC", "AUXONNE", "BAIGNEUX-LES-JUIFS", "BEAUNE", "BLIGNY-SUR-OUCHE",
    "CHATILLON-SUR-SEINE", "CHENOVE", "CHEVIGNY", "DIJON EST", "DIJON NORD", "DIJON SUD", "DIJON TRANSVAAL",
    "FONTAINE-FRANCAISE", "GENLIS", "IS-SUR-TILLE", "LIERNAIS", "MIREBEAU-SUR-BEZE", "MONTBARD", "NOLAY",
    "NUITS-ST-GEORGES", "PONTAILLER", "POUILLY-EN-AUXOIS", "PRECY-SOUS-THIL", "RECEY-SUR-OURCE", "SAULIEU",
    "SAULON", "SELONGEY", "SEMUR-EN-AUXOIS", "SEURRE", "SOMBERNON", "ST-JEAN-DE-LOSNE", "ST-SEINE-L'ABBAYE",
    "VELARS-SUR-OUCHE", "VENAREY-LES-LAUMES", "VITTEAUX"
  ];
  const centres71 = [
    "AUTUN", "CHAGNY", "CHALON-SUR-SAONE", "CHAROLLES", "CLUNY", "DIGOIN", "GUEUGNON", "LE CREUSOT", "LOUHANS", "MACON", "MONTCEAU", "PARAY-LE-MONIAL", "TOURNUS"
  ];
  const centres58 = ["CHATEAU-CHINON", "CLAMECY", "COSNE-SUR-LOIRE", "DECIZE", "LA CHARITE", "LORMES", "LUZY", "NEVERS"];
  const centres89 = ["AUXERRE", "AVALLON", "CHABLIS", "JOIGNY", "MIGENNES", "PONT-SUR-YONNE", "SENS", "TONNERRE"];
  const centres10 = ["BAR-SUR-AUBE", "BAR-SUR-SEINE", "NOGENT-SUR-SEINE", "ROMILLY-SUR-SEINE", "TROYES"];
  const centres52 = ["BOURBONNE-LES-BAINS", "CHAUMONT", "JOINVILLE", "LANGRES", "ST-DIZIER"];
  const centres70 = ["GRAY", "LURE", "LUXEUIL", "MARNAY", "RIOZ", "VESOUL"];
  const centres39 = ["ARBOIS", "CHAMPAGNOLE", "DOLE", "LONS-LE-SAUNIER", "POLIGNY", "SALINS-LES-BAINS", "ST-CLAUDE"];

  let currentCentresList = [];
  switch (departement) {
    case '21': currentCentresList = centres21; break;
    case '71': currentCentresList = centres71; break;
    case '58': currentCentresList = centres58; break;
    case '89': currentCentresList = centres89; break;
    case '10': currentCentresList = centres10; break;
    case '52': currentCentresList = centres52; break;
    case '70': currentCentresList = centres70; break;
    case '39': currentCentresList = centres39; break;
    default: currentCentresList = [];
  }

  // Filter data based on search term
  const filteredMotifs = useMemo(() => {
    if (!searchTerm.trim()) return motifsData;

    const lowercasedSearch = searchTerm.toLowerCase();
    return motifsData.filter(item =>
      (item.motif && item.motif.toLowerCase().includes(lowercasedSearch)) ||
      (item.code && item.code.toLowerCase().includes(lowercasedSearch)) ||
      (item.vehicule && item.vehicule.toLowerCase().includes(lowercasedSearch)) ||
      (item.commune && item.commune.toLowerCase().includes(lowercasedSearch))
    );
  }, [searchTerm]);

  const handleCardClick = (motif) => {
    setSelectedMotif(motif);
    setIsValidated(false);

    // Determine default personnel rows based on vehicule type
    let defaultPersonnel = [];
    const veh = motif.vehicule ? motif.vehicule.toUpperCase() : '';

    if (veh.includes('VSAV')) {
      defaultPersonnel = [
        { engin: veh, fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ 2', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (veh.includes('FPT') || veh.includes('CCR')) {
      defaultPersonnel = [
        { engin: veh, fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'CE', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ BAT 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ BAT 2', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ BAL 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'EQ BAL 2', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else {
      defaultPersonnel = [
        { engin: veh, fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: veh, fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' }
      ];
    }

    // Generate a random 6 digit number for the departure
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    setTicketData({
      numeroDepart: `${randomNum}-01-${caserne}`,
      operateurCta: cta,
      vehiculeAffiche: motif.vehicule || 'SANS VEHICULE',
      commune: motif.commune || '',
      voie: '',
      contact: '',
      observations: '',
      personnel: defaultPersonnel
    });
  };

  const handleCloseModal = () => {
    setSelectedMotif(null);
    setTimeout(() => setIsValidated(false), 300);
  };

  const handleValidate = () => {
    setIsValidated(true);
    setTimeout(() => {
      handleCloseModal();
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
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
        newPersonnel[index].telephone = pData.telephone || '';
        
        // Only fill function if the seat doesn't already have one assigned
        if (!newPersonnel[index].fonction) {
          newPersonnel[index].fonction = pData.fonction || '';
        }
      }
    }

    setTicketData({ ...ticketData, personnel: newPersonnel });
  };

  const addPersonnelRow = () => {
    setTicketData({
      ...ticketData,
      personnel: [
        ...ticketData.personnel,
        { engin: selectedMotif.vehicule || '', fonction: '', nom: '', matricule: '', grade: '', telephone: '' }
      ]
    });
  };

  const addVehicle = (typeVehicule) => {
    let newRows = [];
    if (typeVehicule === 'VSAV') {
      newRows = [
        { engin: 'VSAV ', fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSAV ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSAV ', fonction: 'EQ 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSAV ', fonction: 'EQ 2', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'VSAV3') {
      newRows = [
        { engin: 'VSAV ', fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSAV ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSAV ', fonction: 'EQ', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'FPT') {
      newRows = [
        { engin: 'FPT ', fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'FPT ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'FPT ', fonction: 'CE', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'FPT ', fonction: 'BAT', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'FPT ', fonction: 'EQ 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'FPT ', fonction: 'EQ 2', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'SR') {
      newRows = [
        { engin: 'VSR ', fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSR ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VSR ', fonction: 'EQ', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'VTU') {
      newRows = [
        { engin: 'VTU ', fonction: 'CA', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'VTU ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'VLCG') {
      newRows = [
        { engin: 'VLCG ', fonction: 'COS', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'CCF') {
      newRows = [
        { engin: 'CCF ', fonction: 'CC', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'CCF ', fonction: 'COND', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'CCF ', fonction: 'EQ 1', nom: '', matricule: '', grade: '', telephone: '' },
        { engin: 'CCF ', fonction: 'EQ 2', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else if (typeVehicule === 'AUTRE') {
      const nomEngin = prompt("Nom de l'engin :");
      if (!nomEngin) return;
      newRows = [
        { engin: nomEngin.toUpperCase() + ' ', fonction: '', nom: '', matricule: '', grade: '', telephone: '' },
      ];
    } else {
      // Check for custom vehicles
      const customVeh = customVehicles.find(v => v.nom === typeVehicule);
      if (customVeh) {
        newRows = Array.from({ length: parseInt(customVeh.personnel) || 1 }, () => ({
          engin: customVeh.nom + ' ', fonction: '', nom: '', matricule: '', grade: '', telephone: ''
        }));
      }
    }

    setTicketData({
      ...ticketData,
      personnel: [...ticketData.personnel, ...newRows],
      vehiculeAffiche: ticketData.vehiculeAffiche !== 'SANS VEHICULE' && ticketData.vehiculeAffiche !== ''
        ? `${ticketData.vehiculeAffiche} + ${newRows[0]?.engin.trim()}`
        : newRows[0]?.engin.trim()
    });
  };

  const removePersonnelRow = (index) => {
    const newPersonnel = ticketData.personnel.filter((_, i) => i !== index);
    setTicketData({ ...ticketData, personnel: newPersonnel });
  };

  const [voiesList, setVoiesList] = useState([
    "Rue ", "Avenue ", "Boulevard ", "Impasse ", "Allée ", "Route ", "Chemin ", "Place ", "Lieu-dit "
  ]);

  // Fetch streets dynamically when commune or voie changes
  useEffect(() => {
    if (!ticketData.commune) return;

    // We delay the fetch slightly to avoid spamming the API while typing
    const timeoutId = setTimeout(() => {
      const query = ticketData.voie ? `${ticketData.voie} ${ticketData.commune}` : ticketData.commune;

      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=street&limit=15`)
        .then(res => res.json())
        .then(data => {
          if (data && data.features && data.features.length > 0) {
            const streets = data.features.map(f => f.properties.name);
            setVoiesList([...new Set(streets)]);
          }
        })
        .catch(err => console.error("Erreur de chargement des voies:", err));
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
        {pompiers.map((p, i) => <option key={i} value={p.nom} />)}
      </datalist>
      <datalist id="fonctions-list">
        {availableFonctions.map((f, i) => <option key={i} value={f} />)}
      </datalist>
      <datalist id="grades-list">
        {availableGrades.map((g, i) => <option key={i} value={g} />)}
      </datalist>

      <header className="header no-print">
        <div className="settings-btn-container">
          <button className="btn-settings" onClick={() => setShowSettings(!showSettings)}>
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
          <img src="/logo.png" alt="Logo Pompier" style={{ width: '60px', height: 'auto' }} />
          <h1 style={{ margin: 0 }}>Mes Manoeuvres</h1>
        </div>
        <p>Générateur d'Ordre de Départ (OD)</p>
      </header>

      {showSettings ? (
        <div className="settings-container no-print">
          <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '2rem' }}>Gestion du Personnel</h2>
          <div className="table-responsive">
            <table className="personnel-table settings-table">
              <thead>
                <tr>
                  <th>NOM COMPLET</th>
                  <th>MATRICULE</th>
                  <th>FONCTIONS (ex: CA, COND)</th>
                  <th>GRADE</th>
                  <th>TELEPHONE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pompiers.map((p, index) => (
                  <tr key={index}>
                    <td><input type="text" value={p.nom} onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].nom = e.target.value;
                      setPompiers(newP);
                    }} /></td>
                    <td><input type="text" value={p.matricule} onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].matricule = e.target.value;
                      setPompiers(newP);
                    }} /></td>
                    <td><input type="text" list="fonctions-list" value={p.fonction} onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].fonction = e.target.value;
                      setPompiers(newP);
                    }} /></td>
                    <td><input type="text" list="grades-list" value={p.grade} onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].grade = e.target.value;
                      setPompiers(newP);
                    }} /></td>
                    <td><input type="text" value={p.telephone} onChange={(e) => {
                      const newP = [...pompiers];
                      newP[index].telephone = e.target.value;
                      setPompiers(newP);
                    }} /></td>
                    <td>
                      <button className="btn-delete" onClick={() => {
                        setPompiers(pompiers.filter((_, i) => i !== index));
                      }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-print" onClick={() => {
              setPompiers([...pompiers, { nom: '', matricule: '', fonction: '', grade: '', telephone: '' }]);
            }}>+ Ajouter un Pompier</button>
          </div>

          <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', margin: '3rem 0 2rem 0' }}>Gestion des Véhicules</h2>
          <div className="table-responsive">
            <table className="personnel-table settings-table">
              <thead>
                <tr>
                  <th>NOM DE L'ENGIN</th>
                  <th>NB DE PERSONNEL PAR DÉFAUT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customVehicles.map((v, index) => (
                  <tr key={index}>
                    <td><input type="text" value={v.nom} onChange={(e) => {
                      const newV = [...customVehicles];
                      newV[index].nom = e.target.value.toUpperCase();
                      setCustomVehicles(newV);
                    }} /></td>
                    <td><input type="number" min="1" max="10" value={v.personnel} onChange={(e) => {
                      const newV = [...customVehicles];
                      newV[index].personnel = e.target.value;
                      setCustomVehicles(newV);
                    }} /></td>
                    <td>
                      <button className="btn-delete" onClick={() => {
                        setCustomVehicles(customVehicles.filter((_, i) => i !== index));
                      }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-print" onClick={() => {
              setCustomVehicles([...customVehicles, { nom: '', personnel: '1' }]);
            }}>+ Ajouter un Engin</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
            <div>
              <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '2rem' }}>Liste des Fonctions</h2>
              <div className="table-responsive">
                <table className="personnel-table settings-table">
                  <thead>
                    <tr>
                      <th>NOM DE LA FONCTION</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableFonctions.map((f, index) => (
                      <tr key={index}>
                        <td><input type="text" value={f} onChange={(e) => {
                          const newF = [...availableFonctions];
                          newF[index] = e.target.value.toUpperCase();
                          setAvailableFonctions(newF);
                        }} /></td>
                        <td>
                          <button className="btn-delete" onClick={() => {
                            setAvailableFonctions(availableFonctions.filter((_, i) => i !== index));
                          }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-print" onClick={() => setAvailableFonctions([...availableFonctions, ""])}>+ Ajouter une Fonction</button>
              </div>
            </div>

            <div>
              <h2 className="section-title" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '2rem' }}>Liste des Grades</h2>
              <div className="table-responsive">
                <table className="personnel-table settings-table">
                  <thead>
                    <tr>
                      <th>NOM DU GRADE</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableGrades.map((g, index) => (
                      <tr key={index}>
                        <td><input type="text" value={g} onChange={(e) => {
                          const newG = [...availableGrades];
                          newG[index] = e.target.value;
                          setAvailableGrades(newG);
                        }} /></td>
                        <td>
                          <button className="btn-delete" onClick={() => {
                            setAvailableGrades(availableGrades.filter((_, i) => i !== index));
                          }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-print" onClick={() => setAvailableGrades([...availableGrades, ""])}>+ Ajouter un Grade</button>
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
                    {item.vehicule && <span className="vehicule-badge">{item.vehicule}</span>}
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
            {!isValidated ? (
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
                    <label>Commune</label>
                    <input
                      type="text"
                      list="communes-list"
                      value={ticketData.commune}
                      onChange={(e) => setTicketData({ ...ticketData, commune: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Voie</label>
                    <input
                      type="text"
                      list="voies-list"
                      value={ticketData.voie}
                      onChange={(e) => setTicketData({ ...ticketData, voie: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact</label>
                    <input
                      type="text"
                      list="contacts-list"
                      value={ticketData.contact}
                      onChange={(e) => setTicketData({ ...ticketData, contact: e.target.value })}
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
                        <th>ENGINS</th>
                        <th>NOM</th>
                        <th>MATRICULE</th>
                        <th>FONCTION</th>
                        <th>GRADE</th>
                        <th>TEL</th>
                        <th className="no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketData.personnel.map((p, index) => (
                        <tr key={index}>
                          <td><input type="text" value={p.engin} onChange={(e) => updatePersonnel(index, 'engin', e.target.value)} /></td>
                          <td><input type="text" list="pompiers-list" value={p.nom} onChange={(e) => updatePersonnel(index, 'nom', e.target.value)} /></td>
                          <td><input type="text" value={p.matricule} onChange={(e) => updatePersonnel(index, 'matricule', e.target.value)} /></td>
                          <td><input type="text" list="fonctions-list" value={p.fonction} onChange={(e) => updatePersonnel(index, 'fonction', e.target.value)} /></td>
                          <td><input type="text" list="grades-list" value={p.grade} onChange={(e) => updatePersonnel(index, 'grade', e.target.value)} /></td>
                          <td><input type="text" value={p.telephone} onChange={(e) => updatePersonnel(index, 'telephone', e.target.value)} /></td>
                          <td className="no-print">
                            <button className="btn-delete" onClick={() => removePersonnelRow(index)}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions no-print" style={{ marginTop: '2rem' }}>
                  <button className="btn btn-cancel" onClick={handleCloseModal}>
                    Fermer
                  </button>
                  <button className="btn btn-print" onClick={handlePrint}>
                    🖨️ Imprimer
                  </button>
                  <button className="btn btn-confirm" onClick={handleValidate}>
                    ✓ Valider le départ
                  </button>
                </div>
              </>
            ) : (
              <div className="success-message no-print">
                <span className="success-icon">✅</span>
                <h2>Ordre Envoyé !</h2>
                <p>Les véhicules sont en route pour le motif {selectedMotif.code}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
