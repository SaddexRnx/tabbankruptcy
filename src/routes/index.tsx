import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download, Gavel, Landmark, Archive, RotateCcw, Sun, Moon, Keyboard,
  FileJson, Search, FolderOpen, ToggleRight, Puzzle, Pin, HelpCircle,
  ChevronDown, Sparkles, ShieldCheck, Ghost,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabBankruptcy — Declare bankruptcy on your browser tabs" },
      { name: "description", content: "A Chrome & Firefox extension that saves every open tab into a named session, closes them, and lets you restore anytime. Free your RAM in one click." },
      { property: "og:title", content: "TabBankruptcy — File for tab relief" },
      { property: "og:description", content: "Save every open tab, close them, restore later. One-click tab bankruptcy for Chrome and Firefox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية", rtl: true },
  { code: "zh", label: "中文" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
];

const I18N: Record<string, Record<string, string>> = {
  en: {
    tagline: "Chrome & Firefox extension · Manifest V3",
    guide: "How to install",
    versionBadge: "v1.6 · Auto-Archive & Ghost Checker",
    heroLead: "Hoarding tabs?",
    heroAccent: "Declare bankruptcy.",
    sub: "One click saves every open tab into a named session, closes them all, and frees your RAM. Restore anytime, no account required.",
    downloadChromium: "Download for Chrome",
    downloadFirefox: "Download for Firefox",
    worksOn: "Works on your browser",
    footer: "Local-first · No accounts · No tracking · Data stays in your browser.",
    changeLanguage: "Change language",
    toggleTheme: "Toggle theme",
    // features
    f1t: "Declare Bankruptcy", f1b: "Names, saves, and closes every tab in one motion. RAM freed instantly.",
    f2t: "Session History", f2b: "Every archive is stored locally on your machine. Search, tag, and add notes.",
    f3t: "Restore Anytime", f3b: "Reopen an entire session with a single click — new window or current one.",
    f4t: "Keyboard Shortcuts", f4b: "Ctrl+Shift+X to declare, Ctrl+Shift+L to restore, Ctrl+Shift+B for dashboard.",
    f5t: "Ghost Tab Checker", f5b: "Scan idle, suspended, or duplicate tabs and nuke them safely — with undo.",
    f6t: "Export & Import", f6b: "Back up sessions and archives to JSON. Move them between browsers.",
    f7t: "Search & Filters", f7b: "Find any past session by name, tab title, URL, or tag.",
    f8t: "Local-first & Private", f8b: "No accounts, no tracking. Optional sync to your own cloud endpoint.",
    f9t: "Auto-Archive", f9b: "Idle tabs move to a side panel to save RAM until you need them back.",
    f10t: "Google Drive Backup", f10b: "Sign in with Google to back up sessions to your Drive appData folder. Restore on any device.",
    f11t: "PIN Lock", f11b: "Optional PBKDF2-secured PIN keeps prying eyes out of your session history.",
    f12t: "Activity Log", f12b: "Every declare, restore, and archive action recorded in a tidy timeline you can review.",
    f13t: "Per-Domain Rules", f13b: "Never archive your favourite sites; always keep others pinned. Configure in Options.",
    f14t: "Scheduled Automation", f14b: "Auto-export sessions and scan ghost tabs on a schedule and timezone you choose.",
    faq6q: "How does Google Drive backup work?",
    faq6a: "Optional. In Options paste your own Google OAuth Client ID and sign in — TabBankruptcy pushes an encrypted snapshot into Drive's hidden appDataFolder (only this extension can read it). Restore on any browser after signing in. Nothing leaves your device unless you enable it.",
    faq7q: "How does the PIN lock work?",
    faq7a: "Set a PIN in Options and the popup asks for it every time it opens. The PIN is salted and hashed with PBKDF2-SHA256 (250k iterations) — we never store the raw PIN. Forget it? Remove the extension data in chrome://extensions and start fresh.",
    faq8q: "What are per-domain rules?",
    faq8a: "In Options you can add domains that should never be auto-archived (e.g. your inbox) and domains that should always stay pinned. Rules apply to Auto-Archive and the Ghost Tab Checker.",
    // install
    installKicker: "How to install",
    installTitle: "Install in 5 easy steps.",
    installIntro: "Never installed a browser extension before? No problem. Pick your browser below and follow along — each step has a picture.",
    tabChromium: "Chrome, Edge, Brave…",
    tabFirefox: "Firefox",
    // Chromium steps
    ch1t: "Download the Chrome zip",
    ch1b: "Click the button to save the extension file to your computer.",
    ch2t: "Unzip the file",
    ch2b: "Find the zip in your Downloads folder. Right-click it and pick Extract All… (Windows) or double-click it (Mac). You'll get a folder called tab-bankruptcy-chromium.",
    ch2n: "Remember where you put this folder — you'll point Chrome at it in step 4.",
    ch3t: "Open the Extensions page",
    ch3b: "In Chrome (or Edge, Brave, Arc, Opera, Vivaldi), copy this address into the address bar and press Enter:",
    ch3n: "On Edge use edge://extensions, on Brave brave://extensions.",
    ch4t: "Turn on Developer mode",
    ch4b: "Look at the top-right corner of that page — flip the Developer mode toggle to on. A new row of buttons appears.",
    ch4n: "This just lets Chrome load extensions from a folder. You can turn it back off later — TabBankruptcy will keep working.",
    ch5t: "Click 'Load unpacked' and pick the folder",
    ch5b: "Click Load unpacked, then select the tab-bankruptcy-chromium folder from step 2. You'll see the TabBankruptcy card appear on the page.",
    ch5n: "Finally, click the puzzle-piece icon in the toolbar and pin TabBankruptcy so it's always one click away.",
    // Firefox steps
    ff1t: "Download the Firefox zip",
    ff1b: "Save the Firefox build to your computer.",
    ff1n: "You do not need to unzip this one — Firefox loads the zip directly.",
    ff2t: "Open the debugging page",
    ff2b: "Copy this address into Firefox's address bar and press Enter:",
    ff3t: "Click 'Load Temporary Add-on…'",
    ff3b: "On that page you'll see a button labelled Load Temporary Add-on… — click it. A file picker opens.",
    ff4t: "Select the downloaded zip",
    ff4b: "Pick the tab-bankruptcy-firefox.zip file from your Downloads folder. TabBankruptcy will appear in the list of temporary extensions.",
    ff5t: "Pin it to your toolbar",
    ff5b: "Click the puzzle piece in the top-right of Firefox, find TabBankruptcy, and pin it. You're done.",
    ff5n: "Heads-up: Firefox removes temporary add-ons when you fully quit the browser. To make it permanent, we recommend using a Firefox Developer or Nightly build, or waiting for the AMO listing.",
    // FAQ
    faqTitle: "Common questions",
    faq1q: "Is this safe? Why is Developer mode required?",
    faq1a: "Developer mode lets you load extensions that aren't yet on the Chrome Web Store or Firefox Add-ons directory. It doesn't give the extension any extra powers — TabBankruptcy only uses the permissions listed in its manifest (tabs, storage, downloads, alarms). All your data stays on your device unless you enable optional cloud sync.",
    faq2q: "What happens to my tabs when I 'Declare Bankruptcy'?",
    faq2a: "Every open tab in your current window (except pinned tabs, if you kept that option on) gets saved into a named session in your history. Then the extension opens a fresh blank tab and closes the rest — your RAM frees up immediately. You can restore the session anytime, in the same window or a new one.",
    faq3q: "Where is my data stored? Can I lose it?",
    faq3a: "Everything is saved to your browser's local storage. To back it up, use Export in the popup (or enable scheduled auto-export). You can also mirror to chrome.storage.sync or push to your own HTTPS endpoint in Options.",
    faq4q: "How do I update to a new version later?",
    faq4a: "Download the new zip from this page, unzip it, then on chrome://extensions click the refresh icon on the TabBankruptcy card and re-select the new folder. Your saved sessions stay intact.",
    faq5q: "Does it work on my phone?",
    faq5a: "Yes on Android: use Kiwi Browser or Firefox for Android, both support Manifest V3 unpacked installs. Not currently supported on iOS.",
    // misc
    copied: "copied",
    clickToCopy: "click to copy",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "Extensions", devMode: "Developer mode",
    loadUnpacked: "Load unpacked", packExtension: "Pack extension", updateBtn: "Update",
    devModeHint: "Turn on the toggle in the top-right corner.",
    tempExtensions: "Temporary Extensions", thisFirefox: "This Firefox",
    loadTempAddon: "Load Temporary Add-on…",
  },
  es: {
    tagline: "Extensión de Chrome y Firefox · Manifest V3",
    guide: "Cómo instalar",
    versionBadge: "v1.6 · Auto-Archivo y Verificador de Fantasmas",
    heroLead: "¿Acumulas pestañas?",
    heroAccent: "Declara la bancarrota.",
    sub: "Con un clic guarda cada pestaña en una sesión, las cierra todas y libera tu RAM. Restaura cuando quieras, sin cuenta.",
    downloadChromium: "Descargar para Chrome",
    downloadFirefox: "Descargar para Firefox",
    worksOn: "Funciona en tu navegador",
    footer: "Local · Sin cuentas · Sin seguimiento · Todo se queda en tu navegador.",
    changeLanguage: "Cambiar idioma",
    toggleTheme: "Cambiar tema",
    f1t: "Declarar bancarrota", f1b: "Nombra, guarda y cierra todas las pestañas de un tirón. RAM libre al instante.",
    f2t: "Historial de sesiones", f2b: "Cada archivo se guarda localmente. Busca, etiqueta y añade notas.",
    f3t: "Restaurar cuando quieras", f3b: "Reabre una sesión completa con un clic — en ventana nueva o actual.",
    f4t: "Atajos de teclado", f4b: "Ctrl+Mayús+X para declarar, Ctrl+Mayús+L para restaurar, Ctrl+Mayús+B para el panel.",
    f5t: "Verificador de pestañas fantasma", f5b: "Detecta pestañas inactivas, suspendidas o duplicadas y ciérralas con seguridad — con deshacer.",
    f6t: "Exportar e importar", f6b: "Respalda sesiones y archivos en JSON. Muévelos entre navegadores.",
    f7t: "Búsqueda y filtros", f7b: "Encuentra cualquier sesión pasada por nombre, título, URL o etiqueta.",
    f8t: "Local y privado", f8b: "Sin cuentas ni seguimiento. Sincronización opcional a tu propio endpoint.",
    f9t: "Auto-archivo", f9b: "Las pestañas inactivas van al panel lateral para ahorrar RAM hasta que las necesites.",
    f10t: "Copia en Google Drive", f10b: "Inicia sesión con Google para respaldar sesiones en la carpeta appData de Drive. Restaura en cualquier dispositivo.",
    f11t: "Bloqueo con PIN", f11b: "PIN opcional protegido con PBKDF2 evita miradas ajenas al historial.",
    f12t: "Registro de actividad", f12b: "Cada acción de declarar, restaurar o archivar queda en una línea de tiempo revisable.",
    f13t: "Reglas por dominio", f13b: "No archives nunca tus sitios favoritos; mantén otros siempre fijados. Configura en Opciones.",
    f14t: "Automatización programada", f14b: "Exporta sesiones y escanea fantasmas en el horario y zona horaria que elijas.",
    faq6q: "¿Cómo funciona la copia en Google Drive?",
    faq6a: "Opcional. En Opciones pega tu propio Client ID OAuth de Google e inicia sesión — TabBankruptcy sube un snapshot a la carpeta oculta appDataFolder de Drive (solo esta extensión puede leerla). Restaura en cualquier navegador. Nada sale de tu dispositivo salvo que lo actives.",
    faq7q: "¿Cómo funciona el bloqueo por PIN?",
    faq7a: "Configura un PIN en Opciones y el popup lo pedirá cada vez que se abra. Se guarda con sal y PBKDF2-SHA256 (250k iteraciones) — nunca en claro. ¿Olvido? Borra los datos de la extensión en chrome://extensions y empieza de cero.",
    faq8q: "¿Qué son las reglas por dominio?",
    faq8a: "En Opciones añades dominios que nunca se auto-archivan (p. ej. tu correo) y dominios que siempre permanecen fijados. Se aplican al Auto-Archivo y al Verificador de Fantasmas.",
    installKicker: "Cómo instalar",
    installTitle: "Instala en 5 pasos sencillos.",
    installIntro: "¿Nunca instalaste una extensión? Sin problema. Elige tu navegador y sigue los pasos — cada uno tiene una imagen.",
    tabChromium: "Chrome, Edge, Brave…",
    tabFirefox: "Firefox",
    ch1t: "Descarga el zip de Chrome",
    ch1b: "Pulsa el botón para guardar el archivo de la extensión en tu equipo.",
    ch2t: "Descomprime el archivo",
    ch2b: "Encuentra el zip en Descargas. Clic derecho y elige Extraer todo… (Windows) o doble clic (Mac). Obtendrás una carpeta llamada tab-bankruptcy-chromium.",
    ch2n: "Recuerda dónde la pusiste — la usarás en el paso 4.",
    ch3t: "Abre la página de Extensiones",
    ch3b: "En Chrome (o Edge, Brave, Arc, Opera, Vivaldi), pega esta dirección en la barra y pulsa Enter:",
    ch3n: "En Edge usa edge://extensions, en Brave brave://extensions.",
    ch4t: "Activa el Modo desarrollador",
    ch4b: "Mira la esquina superior derecha y activa Modo desarrollador. Aparecerá una nueva fila de botones.",
    ch4n: "Esto solo permite cargar extensiones desde una carpeta. Puedes desactivarlo luego — TabBankruptcy seguirá funcionando.",
    ch5t: "Pulsa 'Cargar descomprimida' y elige la carpeta",
    ch5b: "Pulsa Cargar descomprimida y selecciona la carpeta tab-bankruptcy-chromium del paso 2. Verás la tarjeta de TabBankruptcy.",
    ch5n: "Finalmente, pulsa el ícono de puzzle en la barra y fija TabBankruptcy para acceder rápido.",
    ff1t: "Descarga el zip de Firefox",
    ff1b: "Guarda la versión Firefox en tu equipo.",
    ff1n: "No hace falta descomprimir — Firefox carga el zip directamente.",
    ff2t: "Abre la página de depuración",
    ff2b: "Pega esta dirección en la barra de Firefox y pulsa Enter:",
    ff3t: "Pulsa 'Cargar complemento temporal…'",
    ff3b: "Verás un botón Cargar complemento temporal… — pulsa. Se abrirá el selector de archivos.",
    ff4t: "Selecciona el zip descargado",
    ff4b: "Elige tab-bankruptcy-firefox.zip en Descargas. TabBankruptcy aparecerá en la lista.",
    ff5t: "Fíjalo a la barra",
    ff5b: "Pulsa el puzzle arriba a la derecha, busca TabBankruptcy y fíjalo. Listo.",
    ff5n: "Aviso: Firefox borra complementos temporales al cerrar el navegador. Para permanente, usa Firefox Developer/Nightly o espera al listado AMO.",
    faqTitle: "Preguntas frecuentes",
    faq1q: "¿Es seguro? ¿Por qué el Modo desarrollador?",
    faq1a: "Permite cargar extensiones que aún no están en la Chrome Web Store o AMO. No da poderes extra — TabBankruptcy solo usa los permisos de su manifest (tabs, storage, downloads, alarms). Los datos se quedan en tu dispositivo salvo que actives la sync opcional.",
    faq2q: "¿Qué pasa con mis pestañas al 'Declarar bancarrota'?",
    faq2a: "Todas las pestañas de la ventana actual (excepto las fijadas, si activaste esa opción) se guardan en una sesión con nombre. Después la extensión abre una pestaña vacía y cierra el resto — la RAM se libera al instante. Puedes restaurar cuando quieras.",
    faq3q: "¿Dónde se guardan mis datos? ¿Se pueden perder?",
    faq3a: "Todo se guarda en el almacenamiento local del navegador. Usa Exportar en el popup (o activa el auto-export). También puedes espejar a chrome.storage.sync o enviar a tu propio endpoint HTTPS.",
    faq4q: "¿Cómo actualizo a una versión nueva?",
    faq4a: "Descarga el zip nuevo, descomprímelo y en chrome://extensions pulsa recargar en la tarjeta de TabBankruptcy y vuelve a elegir la nueva carpeta. Tus sesiones se conservan.",
    faq5q: "¿Funciona en el móvil?",
    faq5a: "Sí en Android: usa Kiwi Browser o Firefox para Android, ambos soportan Manifest V3. No compatible con iOS.",
    copied: "copiado", clickToCopy: "clic para copiar",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "Extensiones", devMode: "Modo desarrollador",
    loadUnpacked: "Cargar descomprimida", packExtension: "Empaquetar", updateBtn: "Actualizar",
    devModeHint: "Activa el interruptor arriba a la derecha.",
    tempExtensions: "Extensiones temporales", thisFirefox: "Este Firefox",
    loadTempAddon: "Cargar complemento temporal…",
  },
  fr: {
    tagline: "Extension Chrome & Firefox · Manifest V3",
    guide: "Guide d'installation",
    versionBadge: "v1.6 · Auto-Archive & Vérificateur de Fantômes",
    heroLead: "Trop d'onglets ?",
    heroAccent: "Déclarez faillite.",
    sub: "Un clic enregistre chaque onglet dans une session, les ferme tous et libère la RAM. Restaurez quand vous voulez, sans compte.",
    downloadChromium: "Télécharger pour Chrome",
    downloadFirefox: "Télécharger pour Firefox",
    worksOn: "Fonctionne sur votre navigateur",
    footer: "Local · Sans compte · Sans tracking · Vos données restent chez vous.",
    changeLanguage: "Changer de langue", toggleTheme: "Changer de thème",
    f1t: "Déclarer faillite", f1b: "Nomme, sauvegarde et ferme chaque onglet d'un seul geste. RAM libérée immédiatement.",
    f2t: "Historique des sessions", f2b: "Chaque archive est stockée localement. Recherchez, taguez et annotez.",
    f3t: "Restaurer à tout moment", f3b: "Rouvrez une session entière en un clic — nouvelle fenêtre ou actuelle.",
    f4t: "Raccourcis clavier", f4b: "Ctrl+Maj+X pour déclarer, Ctrl+Maj+L pour restaurer, Ctrl+Maj+B pour le tableau de bord.",
    f5t: "Vérificateur d'onglets fantômes", f5b: "Scanne les onglets inactifs, suspendus ou dupliqués et les supprime sans risque — avec annulation.",
    f6t: "Exporter et importer", f6b: "Sauvegardez sessions et archives en JSON. Déplacez-les entre navigateurs.",
    f7t: "Recherche et filtres", f7b: "Retrouvez une session par nom, titre, URL ou tag.",
    f8t: "Local et privé", f8b: "Pas de compte, pas de tracking. Sync optionnelle vers votre propre endpoint.",
    f9t: "Auto-Archive", f9b: "Les onglets inactifs passent dans le panneau latéral pour économiser la RAM.",
    f10t: "Sauvegarde Google Drive", f10b: "Connectez-vous avec Google pour sauvegarder les sessions dans le dossier appData de Drive. Restaurez sur n'importe quel appareil.",
    f11t: "Verrou PIN", f11b: "PIN optionnel protégé par PBKDF2 pour préserver la confidentialité de votre historique.",
    f12t: "Journal d'activité", f12b: "Chaque action déclarer, restaurer, archiver enregistrée dans une timeline consultable.",
    f13t: "Règles par domaine", f13b: "N'archivez jamais vos sites favoris ; gardez d'autres toujours épinglés. À configurer dans Options.",
    f14t: "Automatisation planifiée", f14b: "Auto-export des sessions et scan des fantômes à l'horaire et fuseau que vous choisissez.",
    faq6q: "Comment fonctionne la sauvegarde Google Drive ?",
    faq6a: "Optionnelle. Dans Options collez votre propre Client ID OAuth Google et connectez-vous — TabBankruptcy pousse un snapshot dans le dossier caché appDataFolder de Drive (lisible uniquement par cette extension). Restaurez sur n'importe quel navigateur. Rien ne sort de votre appareil sans activation.",
    faq7q: "Comment fonctionne le verrou PIN ?",
    faq7a: "Définissez un PIN dans Options et la popup le demande à chaque ouverture. Il est salé et hashé avec PBKDF2-SHA256 (250k itérations) — jamais stocké en clair. Oublié ? Effacez les données de l'extension dans chrome://extensions et recommencez.",
    faq8q: "Que sont les règles par domaine ?",
    faq8a: "Dans Options vous ajoutez des domaines à ne jamais auto-archiver (ex : votre boîte mail) et des domaines à toujours épingler. Les règles s'appliquent à l'Auto-Archive et au Vérificateur de Fantômes.",
    installKicker: "Guide d'installation",
    installTitle: "Installez en 5 étapes faciles.",
    installIntro: "Jamais installé d'extension ? Aucun problème. Choisissez votre navigateur et suivez le guide — chaque étape a une image.",
    tabChromium: "Chrome, Edge, Brave…", tabFirefox: "Firefox",
    ch1t: "Téléchargez le zip Chrome",
    ch1b: "Cliquez sur le bouton pour enregistrer le fichier d'extension.",
    ch2t: "Décompressez le fichier",
    ch2b: "Trouvez le zip dans Téléchargements. Clic droit puis Extraire tout… (Windows) ou double-clic (Mac). Vous obtiendrez un dossier tab-bankruptcy-chromium.",
    ch2n: "Retenez où vous l'avez mis — vous en aurez besoin à l'étape 4.",
    ch3t: "Ouvrez la page Extensions",
    ch3b: "Dans Chrome (ou Edge, Brave, Arc, Opera, Vivaldi), collez cette adresse dans la barre et appuyez sur Entrée :",
    ch3n: "Sur Edge : edge://extensions, sur Brave : brave://extensions.",
    ch4t: "Activez le Mode développeur",
    ch4b: "En haut à droite, activez le Mode développeur. Une nouvelle rangée de boutons apparaît.",
    ch4n: "Cela permet juste de charger des extensions depuis un dossier. Vous pourrez le désactiver plus tard.",
    ch5t: "Cliquez sur 'Charger l'extension non empaquetée'",
    ch5b: "Cliquez Charger l'extension non empaquetée, puis choisissez le dossier tab-bankruptcy-chromium de l'étape 2.",
    ch5n: "Enfin, cliquez sur le puzzle dans la barre d'outils et épinglez TabBankruptcy.",
    ff1t: "Téléchargez le zip Firefox",
    ff1b: "Enregistrez la version Firefox sur votre ordinateur.",
    ff1n: "Pas besoin de décompresser — Firefox charge le zip directement.",
    ff2t: "Ouvrez la page de débogage",
    ff2b: "Collez cette adresse dans la barre de Firefox et appuyez sur Entrée :",
    ff3t: "Cliquez sur 'Charger un module temporaire…'",
    ff3b: "Vous verrez un bouton Charger un module temporaire… — cliquez. Un sélecteur de fichiers s'ouvre.",
    ff4t: "Sélectionnez le zip téléchargé",
    ff4b: "Choisissez tab-bankruptcy-firefox.zip dans Téléchargements. TabBankruptcy apparaîtra dans la liste.",
    ff5t: "Épinglez-le à la barre d'outils",
    ff5b: "Cliquez sur le puzzle en haut à droite, trouvez TabBankruptcy et épinglez-le. C'est terminé.",
    ff5n: "Attention : Firefox supprime les modules temporaires à la fermeture. Pour du permanent, utilisez Firefox Developer/Nightly ou attendez la publication AMO.",
    faqTitle: "Questions fréquentes",
    faq1q: "Est-ce sûr ? Pourquoi le Mode développeur ?",
    faq1a: "Il permet de charger des extensions absentes du Chrome Web Store ou d'AMO. Aucun pouvoir supplémentaire — TabBankruptcy n'utilise que les permissions de son manifest. Vos données restent locales sauf sync optionnelle.",
    faq2q: "Que se passe-t-il quand je 'Déclare faillite' ?",
    faq2a: "Chaque onglet de la fenêtre courante (sauf épinglés si l'option est active) est sauvegardé dans une session nommée. L'extension ouvre un onglet vide et ferme les autres — la RAM se libère. Restaurable à tout moment.",
    faq3q: "Où sont mes données ? Puis-je les perdre ?",
    faq3a: "Tout est dans le stockage local du navigateur. Utilisez Export dans la popup (ou l'auto-export planifié). Vous pouvez aussi mirrorer vers chrome.storage.sync ou votre endpoint HTTPS.",
    faq4q: "Comment mettre à jour ?",
    faq4a: "Téléchargez le nouveau zip, décompressez, puis sur chrome://extensions cliquez recharger et re-sélectionnez le nouveau dossier. Vos sessions restent intactes.",
    faq5q: "Ça marche sur mon téléphone ?",
    faq5a: "Oui sur Android : utilisez Kiwi Browser ou Firefox pour Android, tous deux supportent Manifest V3. Pas encore sur iOS.",
    copied: "copié", clickToCopy: "cliquer pour copier",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "Extensions", devMode: "Mode développeur",
    loadUnpacked: "Charger non empaquetée", packExtension: "Empaqueter", updateBtn: "Mettre à jour",
    devModeHint: "Activez le bouton en haut à droite.",
    tempExtensions: "Modules temporaires", thisFirefox: "Ce Firefox",
    loadTempAddon: "Charger un module temporaire…",
  },
  de: {
    tagline: "Chrome- & Firefox-Erweiterung · Manifest V3",
    guide: "Installationsanleitung",
    versionBadge: "v1.6 · Auto-Archiv & Ghost-Checker",
    heroLead: "Tabs gehortet?",
    heroAccent: "Erklären Sie Bankrott.",
    sub: "Ein Klick speichert alle offenen Tabs in einer Sitzung, schließt sie und gibt RAM frei. Jederzeit wiederherstellen, kein Konto nötig.",
    downloadChromium: "Für Chrome herunterladen",
    downloadFirefox: "Für Firefox herunterladen",
    worksOn: "Funktioniert in Ihrem Browser",
    footer: "Lokal · Keine Konten · Kein Tracking · Daten bleiben in Ihrem Browser.",
    changeLanguage: "Sprache ändern", toggleTheme: "Theme wechseln",
    f1t: "Bankrott erklären", f1b: "Benennt, speichert und schließt jeden Tab auf einmal. RAM sofort frei.",
    f2t: "Sitzungsverlauf", f2b: "Jedes Archiv wird lokal gespeichert. Suchen, taggen, Notizen hinzufügen.",
    f3t: "Jederzeit wiederherstellen", f3b: "Öffnen Sie eine ganze Sitzung mit einem Klick — neues oder aktuelles Fenster.",
    f4t: "Tastenkürzel", f4b: "Strg+Umschalt+X zum Erklären, Strg+Umschalt+L zum Wiederherstellen, Strg+Umschalt+B fürs Dashboard.",
    f5t: "Ghost-Tab-Checker", f5b: "Findet inaktive, suspendierte oder doppelte Tabs und schließt sie sicher — mit Rückgängig.",
    f6t: "Export & Import", f6b: "Sichern Sie Sitzungen und Archive als JSON. Zwischen Browsern verschieben.",
    f7t: "Suche & Filter", f7b: "Jede vergangene Sitzung nach Name, Titel, URL oder Tag finden.",
    f8t: "Lokal & privat", f8b: "Keine Konten, kein Tracking. Optionale Sync zu Ihrem Cloud-Endpunkt.",
    f9t: "Auto-Archiv", f9b: "Inaktive Tabs wandern ins Seitenpanel, um RAM zu sparen.",
    f10t: "Google-Drive-Backup", f10b: "Melden Sie sich mit Google an, um Sitzungen im appData-Ordner Ihres Drive zu sichern. Auf jedem Gerät wiederherstellen.",
    f11t: "PIN-Sperre", f11b: "Optionale PBKDF2-gesicherte PIN hält Neugierige aus Ihrem Sitzungsverlauf fern.",
    f12t: "Aktivitätsprotokoll", f12b: "Jede Deklarations-, Wiederherstellungs- und Archivaktion in einer übersichtlichen Timeline.",
    f13t: "Domain-Regeln", f13b: "Lieblingsseiten nie archivieren; andere immer angepinnt halten. In den Optionen konfigurieren.",
    f14t: "Geplante Automatisierung", f14b: "Auto-Export und Ghost-Scan zu Zeit und Zeitzone Ihrer Wahl.",
    faq6q: "Wie funktioniert das Google-Drive-Backup?",
    faq6a: "Optional. In den Optionen fügen Sie Ihre eigene Google-OAuth-Client-ID ein und melden sich an — TabBankruptcy speichert einen Snapshot im versteckten appDataFolder (nur diese Erweiterung darf ihn lesen). Auf jedem Browser wiederherstellbar. Ohne Aktivierung verlassen keine Daten Ihr Gerät.",
    faq7q: "Wie funktioniert die PIN-Sperre?",
    faq7a: "PIN in den Optionen setzen — die Popup fragt bei jedem Öffnen danach. Gehasht mit Salt und PBKDF2-SHA256 (250k Iterationen), nie im Klartext. Vergessen? Erweiterungsdaten unter chrome://extensions löschen.",
    faq8q: "Was sind Domain-Regeln?",
    faq8a: "In den Optionen fügen Sie Domains hinzu, die nie automatisch archiviert werden (z. B. Ihr Posteingang), und solche, die immer angepinnt bleiben. Gilt für Auto-Archiv und Ghost-Checker.",
    installKicker: "Installationsanleitung",
    installTitle: "In 5 einfachen Schritten installieren.",
    installIntro: "Noch nie eine Erweiterung installiert? Kein Problem. Wählen Sie Ihren Browser — jeder Schritt hat ein Bild.",
    tabChromium: "Chrome, Edge, Brave…", tabFirefox: "Firefox",
    ch1t: "Chrome-Zip herunterladen",
    ch1b: "Klicken Sie den Button, um die Erweiterungsdatei zu speichern.",
    ch2t: "Zip entpacken",
    ch2b: "Suchen Sie das Zip im Download-Ordner. Rechtsklick → Alle extrahieren… (Windows) oder Doppelklick (Mac). Sie erhalten einen Ordner tab-bankruptcy-chromium.",
    ch2n: "Merken Sie sich den Ort — Sie brauchen ihn in Schritt 4.",
    ch3t: "Erweiterungs-Seite öffnen",
    ch3b: "In Chrome (oder Edge, Brave, Arc, Opera, Vivaldi) diese Adresse einfügen und Enter drücken:",
    ch3n: "Auf Edge: edge://extensions, auf Brave: brave://extensions.",
    ch4t: "Entwicklermodus einschalten",
    ch4b: "Rechts oben Entwicklermodus einschalten. Eine neue Button-Reihe erscheint.",
    ch4n: "Das erlaubt nur, Erweiterungen aus Ordnern zu laden. Sie können es später wieder abschalten.",
    ch5t: "'Entpackte Erweiterung laden' klicken",
    ch5b: "Klicken Sie Entpackte Erweiterung laden und wählen Sie den Ordner tab-bankruptcy-chromium aus Schritt 2.",
    ch5n: "Zuletzt: Puzzle-Symbol in der Leiste, TabBankruptcy anpinnen.",
    ff1t: "Firefox-Zip herunterladen",
    ff1b: "Firefox-Version auf Ihrem Rechner speichern.",
    ff1n: "Nicht entpacken — Firefox lädt das Zip direkt.",
    ff2t: "Debug-Seite öffnen",
    ff2b: "Diese Adresse in Firefox einfügen und Enter drücken:",
    ff3t: "'Temporäres Add-on laden…' klicken",
    ff3b: "Klicken Sie Temporäres Add-on laden… — ein Dateidialog öffnet sich.",
    ff4t: "Heruntergeladenes Zip auswählen",
    ff4b: "Wählen Sie tab-bankruptcy-firefox.zip aus dem Download-Ordner.",
    ff5t: "An die Symbolleiste anpinnen",
    ff5b: "Klicken Sie das Puzzle rechts oben, finden Sie TabBankruptcy und pinnen Sie es an. Fertig.",
    ff5n: "Hinweis: Firefox entfernt temporäre Add-ons beim Beenden. Für dauerhaft: Firefox Developer/Nightly oder AMO abwarten.",
    faqTitle: "Häufige Fragen",
    faq1q: "Ist das sicher? Warum Entwicklermodus?",
    faq1a: "Er lädt Erweiterungen außerhalb des Chrome Web Stores/AMO. Keine zusätzlichen Rechte — TabBankruptcy nutzt nur die Manifest-Permissions. Daten bleiben lokal außer bei optionaler Sync.",
    faq2q: "Was passiert bei 'Bankrott erklären'?",
    faq2a: "Alle Tabs des aktuellen Fensters (außer angepinnten, wenn aktiv) werden in einer Sitzung gespeichert. Die Erweiterung öffnet einen leeren Tab und schließt die anderen — RAM frei. Jederzeit wiederherstellbar.",
    faq3q: "Wo werden meine Daten gespeichert?",
    faq3a: "Alles im lokalen Browser-Storage. Sichern via Export in der Popup (oder Auto-Export). Zusätzlich chrome.storage.sync-Mirror oder eigener HTTPS-Endpunkt möglich.",
    faq4q: "Wie aktualisiere ich?",
    faq4a: "Neues Zip laden, entpacken, in chrome://extensions auf Aktualisieren klicken und den neuen Ordner wählen. Sitzungen bleiben erhalten.",
    faq5q: "Läuft es auf dem Handy?",
    faq5a: "Ja auf Android: Kiwi Browser oder Firefox für Android. iOS wird nicht unterstützt.",
    copied: "kopiert", clickToCopy: "klicken zum Kopieren",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "Erweiterungen", devMode: "Entwicklermodus",
    loadUnpacked: "Entpackte laden", packExtension: "Packen", updateBtn: "Aktualisieren",
    devModeHint: "Schalter oben rechts einschalten.",
    tempExtensions: "Temporäre Erweiterungen", thisFirefox: "Dieser Firefox",
    loadTempAddon: "Temporäres Add-on laden…",
  },
  ar: {
    tagline: "امتداد كروم وفَيَرفوكس · Manifest V3",
    guide: "طريقة التثبيت",
    versionBadge: "v1.6 · الأرشفة التلقائية وفاحص الأشباح",
    heroLead: "تكدس علاماتك؟",
    heroAccent: "أعلن الإفلاس.",
    sub: "بنقرة واحدة يحفظ كل علامة في جلسة، ويغلقها جميعًا، ويحرر الذاكرة. استعد في أي وقت، بدون حساب.",
    downloadChromium: "تنزيل لكروم",
    downloadFirefox: "تنزيل لفَيَرفوكس",
    worksOn: "يعمل على متصفحك",
    footer: "محلي · بدون حسابات · بدون تتبع · البيانات تبقى في متصفحك.",
    changeLanguage: "تغيير اللغة", toggleTheme: "تبديل المظهر",
    f1t: "أعلن الإفلاس", f1b: "يسمي ويحفظ ويغلق كل علامة في حركة واحدة. تحرير الذاكرة فورًا.",
    f2t: "سجل الجلسات", f2b: "كل أرشيف يُحفظ محليًا. ابحث، وسِم، وأضف ملاحظات.",
    f3t: "استعد في أي وقت", f3b: "أعد فتح الجلسة كاملة بنقرة — نافذة جديدة أو الحالية.",
    f4t: "اختصارات المفاتيح", f4b: "Ctrl+Shift+X للإعلان، Ctrl+Shift+L للاستعادة، Ctrl+Shift+B للوحة.",
    f5t: "فاحص علامات الأشباح", f5b: "يفحص العلامات الخاملة أو المعلقة أو المكررة ويغلقها بأمان — مع تراجع.",
    f6t: "تصدير واستيراد", f6b: "انسخ الجلسات والأرشيف JSON. انقلها بين المتصفحات.",
    f7t: "بحث وتصفية", f7b: "ابحث عن أي جلسة بالاسم أو العنوان أو الرابط أو الوسم.",
    f8t: "محلي وخصوصي", f8b: "بدون حسابات ولا تتبع. مزامنة اختيارية إلى نقطة سحابية خاصة.",
    f9t: "الأرشفة التلقائية", f9b: "العلامات الخاملة تنتقل إلى لوحة جانبية لتوفير الذاكرة.",
    f10t: "نسخ احتياطي إلى Google Drive", f10b: "سجّل الدخول بجوجل لنسخ الجلسات إلى مجلد appData في درايف. استعد على أي جهاز.",
    f11t: "قفل برقم PIN", f11b: "رقم PIN اختياري محمي بـ PBKDF2 يمنع الفضوليين من سجل جلساتك.",
    f12t: "سجل النشاط", f12b: "كل عملية إعلان واستعادة وأرشفة مسجَّلة في خط زمني مرتب.",
    f13t: "قواعد لكل نطاق", f13b: "لا تؤرشف مواقعك المفضلة أبدًا؛ وثبِّت أخرى دائمًا. من الإعدادات.",
    f14t: "أتمتة مجدولة", f14b: "تصدير تلقائي وفحص أشباح في الوقت والمنطقة الزمنية التي تختارها.",
    faq6q: "كيف يعمل النسخ الاحتياطي إلى Google Drive؟",
    faq6a: "اختياري. في الإعدادات ضع Client ID الخاص بك لـ OAuth غوغل وسجّل الدخول — يرفع الامتداد لقطة إلى مجلد appDataFolder المخفي (لا يقرأه سوى هذا الامتداد). استعد على أي متصفح. لا شيء يغادر جهازك دون تفعيلك.",
    faq7q: "كيف يعمل قفل PIN؟",
    faq7a: "عيّن PIN في الإعدادات ويطلبه الامتداد عند كل فتح. يُخزَّن مملَّحًا بـ PBKDF2-SHA256 (250 ألف تكرار)، ولا يُحفظ كنص. نسيته؟ احذف بيانات الامتداد من chrome://extensions.",
    faq8q: "ما هي قواعد النطاقات؟",
    faq8a: "في الإعدادات تضيف نطاقات لا تُؤرشَف تلقائيًا أبدًا (مثل بريدك) ونطاقات تبقى مثبتة دائمًا. تُطبَّق على الأرشفة التلقائية وفاحص الأشباح.",
    installKicker: "طريقة التثبيت",
    installTitle: "التثبيت في 5 خطوات سهلة.",
    installIntro: "لم تُثبِّت امتدادًا من قبل؟ لا مشكلة. اختر متصفحك واتبع الخطوات — لكل خطوة صورة.",
    tabChromium: "كروم، إيدج، بريف…", tabFirefox: "فَيَرفوكس",
    ch1t: "نزّل زيب كروم",
    ch1b: "انقر الزر لحفظ ملف الامتداد على جهازك.",
    ch2t: "فك ضغط الملف",
    ch2b: "ابحث عن الزيب في مجلد التنزيلات. بزر الفأرة الأيمن اختر Extract All… (ويندوز) أو انقر مزدوجًا (ماك). ستحصل على مجلد tab-bankruptcy-chromium.",
    ch2n: "تذكر مكانه — ستحتاجه في الخطوة 4.",
    ch3t: "افتح صفحة الامتدادات",
    ch3b: "في كروم (أو إيدج، بريف، آرك، أوبرا، فيفالدي)، الصق هذا العنوان في شريط العناوين واضغط Enter:",
    ch3n: "في إيدج: edge://extensions، في بريف: brave://extensions.",
    ch4t: "فعّل وضع المطور",
    ch4b: "في أعلى يمين الصفحة، فعّل مفتاح وضع المطور. سيظهر صف جديد من الأزرار.",
    ch4n: "هذا يسمح فقط بتحميل الامتدادات من مجلد. يمكنك إيقافه لاحقًا.",
    ch5t: "انقر 'Load unpacked' واختر المجلد",
    ch5b: "انقر Load unpacked ثم اختر مجلد tab-bankruptcy-chromium من الخطوة 2.",
    ch5n: "أخيرًا: انقر أيقونة القطعة في شريط الأدوات وثبّت TabBankruptcy.",
    ff1t: "نزّل زيب فَيَرفوكس",
    ff1b: "احفظ نسخة فَيَرفوكس على جهازك.",
    ff1n: "لا حاجة لفك الضغط — فَيَرفوكس يحمّل الزيب مباشرة.",
    ff2t: "افتح صفحة التصحيح",
    ff2b: "الصق هذا العنوان في شريط فَيَرفوكس واضغط Enter:",
    ff3t: "انقر 'Load Temporary Add-on…'",
    ff3b: "سترى زر Load Temporary Add-on… — انقره. يفتح منتقي الملفات.",
    ff4t: "اختر ملف الزيب",
    ff4b: "اختر tab-bankruptcy-firefox.zip من التنزيلات.",
    ff5t: "ثبّته في شريط الأدوات",
    ff5b: "انقر أيقونة القطعة أعلى اليمين، جد TabBankruptcy وثبّته. انتهيت.",
    ff5n: "تنبيه: فَيَرفوكس يزيل الإضافات المؤقتة عند إغلاقه. للثبات: استخدم Firefox Developer/Nightly أو انتظر AMO.",
    faqTitle: "أسئلة شائعة",
    faq1q: "هل هذا آمن؟ ولماذا وضع المطور؟",
    faq1a: "يسمح بتحميل امتدادات خارج المتجر. لا صلاحيات إضافية — يستخدم فقط الصلاحيات المذكورة في manifest. البيانات محلية إلا إذا فعّلت المزامنة الاختيارية.",
    faq2q: "ماذا يحدث لعلاماتي عند 'إعلان الإفلاس'؟",
    faq2a: "كل علامات النافذة الحالية (عدا المثبتة إن فعّلت الخيار) تُحفظ في جلسة مسماة. ثم يفتح الامتداد علامة فارغة ويغلق الباقي — الذاكرة تُحرَّر. يمكن استعادتها متى شئت.",
    faq3q: "أين تُخزَّن بياناتي؟",
    faq3a: "كل شيء في التخزين المحلي للمتصفح. استخدم Export من النافذة، أو فعّل التصدير المجدول. يمكن أيضًا chrome.storage.sync أو نقطة HTTPS خاصة.",
    faq4q: "كيف أُحدّث لنسخة جديدة؟",
    faq4a: "نزّل الزيب الجديد وفك ضغطه، ثم في chrome://extensions انقر تحديث على بطاقة TabBankruptcy وأعد اختيار المجلد. جلساتك تبقى.",
    faq5q: "هل يعمل على الهاتف؟",
    faq5a: "نعم على أندرويد: Kiwi Browser أو Firefox for Android. غير مدعوم على iOS حاليًا.",
    copied: "تم النسخ", clickToCopy: "انقر للنسخ",
    chromeLabel: "كروم", firefoxLabel: "فَيَرفوكس",
    extensionsLabel: "الامتدادات", devMode: "وضع المطور",
    loadUnpacked: "تحميل غير مُحزَّم", packExtension: "حزم الامتداد", updateBtn: "تحديث",
    devModeHint: "فعّل المفتاح في الزاوية العلوية اليمنى.",
    tempExtensions: "امتدادات مؤقتة", thisFirefox: "هذا فَيَرفوكس",
    loadTempAddon: "تحميل إضافة مؤقتة…",
  },
  zh: {
    tagline: "Chrome 与 Firefox 扩展 · Manifest V3",
    guide: "如何安装",
    versionBadge: "v1.6 · 自动归档与幽灵检查",
    heroLead: "标签太多？",
    heroAccent: "宣告破产。",
    sub: "一键将所有标签保存为命名会话，全部关闭并释放内存。随时恢复，无需账户。",
    downloadChromium: "下载 Chrome 版",
    downloadFirefox: "下载 Firefox 版",
    worksOn: "支持你的浏览器",
    footer: "本地优先 · 无账户 · 无跟踪 · 数据留在你的浏览器中。",
    changeLanguage: "切换语言", toggleTheme: "切换主题",
    f1t: "宣告破产", f1b: "一次性命名、保存并关闭所有标签。内存立即释放。",
    f2t: "会话历史", f2b: "所有归档保存在本地。可搜索、加标签、加备注。",
    f3t: "随时恢复", f3b: "一键恢复整个会话——新窗口或当前窗口均可。",
    f4t: "键盘快捷键", f4b: "Ctrl+Shift+X 宣告，Ctrl+Shift+L 恢复，Ctrl+Shift+B 打开面板。",
    f5t: "幽灵标签检查", f5b: "扫描闲置、暂停或重复的标签并安全清理——可撤销。",
    f6t: "导出与导入", f6b: "以 JSON 备份会话与归档，在浏览器间迁移。",
    f7t: "搜索与筛选", f7b: "按名称、标题、URL 或标签查找任意历史会话。",
    f8t: "本地优先且隐私", f8b: "无账户无跟踪。可选同步至你自己的云端点。",
    f9t: "自动归档", f9b: "闲置标签自动移入侧栏以节省内存，随用随取。",
    f10t: "Google Drive 备份", f10b: "用 Google 账号登录，将会话备份到 Drive 的 appData 文件夹，任何设备均可恢复。",
    f11t: "PIN 锁", f11b: "可选的 PBKDF2 加密 PIN 码，避免他人窥探会话历史。",
    f12t: "活动日志", f12b: "所有宣告、恢复、归档操作按时间线整齐记录。",
    f13t: "按域名规则", f13b: "喜爱的网站永不归档；其他保持固定。在设置中配置。",
    f14t: "定时自动化", f14b: "按你选择的时间和时区自动导出会话并扫描幽灵标签。",
    faq6q: "Google Drive 备份如何使用？",
    faq6a: "可选。在设置中填入你自己的 Google OAuth 客户端 ID 并登录，TabBankruptcy 会把快照上传到 Drive 的隐藏 appDataFolder（只有本扩展能读取）。任何浏览器登录后都可恢复。未启用时数据不会离开你的设备。",
    faq7q: "PIN 锁如何工作？",
    faq7a: "在设置里设置 PIN，弹窗每次打开都会询问。使用加盐 PBKDF2-SHA256（25 万次迭代）存储，绝不保存明文。忘记了？在 chrome://extensions 清除扩展数据即可重置。",
    faq8q: "域名规则是什么？",
    faq8a: "在设置里可添加“永不自动归档”的域名（例如邮箱）和“始终保持固定”的域名。规则同时作用于自动归档与幽灵检查。",
    installKicker: "如何安装",
    installTitle: "5 个简单步骤安装。",
    installIntro: "从没装过扩展？没关系。选择你的浏览器，跟着做——每步都有图。",
    tabChromium: "Chrome、Edge、Brave…", tabFirefox: "Firefox",
    ch1t: "下载 Chrome zip",
    ch1b: "点击按钮将扩展文件保存到电脑。",
    ch2t: "解压文件",
    ch2b: "在“下载”文件夹找到 zip。右键选 Extract All…（Windows）或双击（Mac）。会得到 tab-bankruptcy-chromium 文件夹。",
    ch2n: "记住文件夹位置——第 4 步会用到。",
    ch3t: "打开扩展页面",
    ch3b: "在 Chrome（或 Edge、Brave、Arc、Opera、Vivaldi）地址栏粘贴并回车：",
    ch3n: "Edge 用 edge://extensions，Brave 用 brave://extensions。",
    ch4t: "打开开发者模式",
    ch4b: "在页面右上角开启开发者模式。会出现一排新按钮。",
    ch4n: "这仅允许从文件夹加载扩展。你可以之后再关闭。",
    ch5t: "点击“加载已解压的扩展”并选择文件夹",
    ch5b: "点击 Load unpacked，选择第 2 步的 tab-bankruptcy-chromium 文件夹。你会看到 TabBankruptcy 卡片。",
    ch5n: "最后：点击工具栏拼图图标，把 TabBankruptcy 固定。",
    ff1t: "下载 Firefox zip",
    ff1b: "保存 Firefox 版到电脑。",
    ff1n: "不用解压——Firefox 直接加载 zip。",
    ff2t: "打开调试页面",
    ff2b: "在 Firefox 地址栏粘贴并回车：",
    ff3t: "点击“临时载入附加组件…”",
    ff3b: "点击 Load Temporary Add-on…，会打开文件选择器。",
    ff4t: "选择下载的 zip",
    ff4b: "从下载文件夹选择 tab-bankruptcy-firefox.zip。TabBankruptcy 会出现在列表中。",
    ff5t: "固定到工具栏",
    ff5b: "点击右上角拼图，找到 TabBankruptcy 并固定。完成。",
    ff5n: "注意：Firefox 关闭后会移除临时附加组件。要永久使用请用 Firefox Developer/Nightly 或等待 AMO 上架。",
    faqTitle: "常见问题",
    faq1q: "安全吗？为什么要开发者模式？",
    faq1a: "开发者模式用于加载未上架 Chrome Web Store/AMO 的扩展，并不赋予额外权限。TabBankruptcy 仅使用 manifest 中的权限。数据留在本地，除非启用可选同步。",
    faq2q: "“宣告破产”会怎样处理我的标签？",
    faq2a: "当前窗口的所有标签（若启用则排除固定的）都会保存到命名会话，再打开新空白页并关闭其余标签，内存立即释放。可随时恢复。",
    faq3q: "数据存哪儿？会丢吗？",
    faq3a: "全部存在浏览器本地。可用弹窗的“导出”备份，或启用自动导出。也可镜像到 chrome.storage.sync 或推送到你自己的 HTTPS 端点。",
    faq4q: "如何更新新版本？",
    faq4a: "下载新的 zip 并解压，在 chrome://extensions 点 TabBankruptcy 卡片的刷新图标并重新选择新文件夹。会话不会丢失。",
    faq5q: "手机能用吗？",
    faq5a: "Android 可以：使用 Kiwi Browser 或 Firefox for Android，两者都支持 Manifest V3。暂不支持 iOS。",
    copied: "已复制", clickToCopy: "点击复制",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "扩展", devMode: "开发者模式",
    loadUnpacked: "加载已解压", packExtension: "打包扩展", updateBtn: "更新",
    devModeHint: "打开右上角的开关。",
    tempExtensions: "临时扩展", thisFirefox: "此 Firefox",
    loadTempAddon: "临时载入附加组件…",
  },
  pt: {
    tagline: "Extensão do Chrome e Firefox · Manifest V3",
    guide: "Como instalar",
    versionBadge: "v1.6 · Auto-Arquivo e Verificador de Fantasmas",
    heroLead: "Acumulando abas?",
    heroAccent: "Declare falência.",
    sub: "Um clique salva cada aba em uma sessão, fecha todas e libera sua RAM. Restaure quando quiser, sem conta.",
    downloadChromium: "Baixar para Chrome",
    downloadFirefox: "Baixar para Firefox",
    worksOn: "Funciona no seu navegador",
    footer: "Local · Sem contas · Sem rastreio · Dados ficam no seu navegador.",
    changeLanguage: "Mudar idioma", toggleTheme: "Alternar tema",
    f1t: "Declarar falência", f1b: "Nomeia, salva e fecha todas as abas de uma vez. RAM liberada na hora.",
    f2t: "Histórico de sessões", f2b: "Cada arquivo é salvo localmente. Pesquise, marque e adicione notas.",
    f3t: "Restaurar quando quiser", f3b: "Reabra uma sessão inteira com um clique — nova janela ou atual.",
    f4t: "Atalhos de teclado", f4b: "Ctrl+Shift+X para declarar, Ctrl+Shift+L para restaurar, Ctrl+Shift+B para o painel.",
    f5t: "Verificador de abas fantasmas", f5b: "Detecta abas ociosas, suspensas ou duplicadas e as fecha com segurança — com desfazer.",
    f6t: "Exportar e importar", f6b: "Faça backup de sessões e arquivos em JSON. Mova entre navegadores.",
    f7t: "Busca e filtros", f7b: "Encontre qualquer sessão por nome, título, URL ou tag.",
    f8t: "Local e privado", f8b: "Sem contas, sem rastreio. Sync opcional para seu próprio endpoint.",
    f9t: "Auto-Arquivo", f9b: "Abas ociosas vão para o painel lateral para economizar RAM.",
    f10t: "Backup no Google Drive", f10b: "Entre com Google para salvar sessões na pasta appData do Drive. Restaure em qualquer dispositivo.",
    f11t: "Trava por PIN", f11b: "PIN opcional protegido por PBKDF2 mantém curiosos longe do seu histórico.",
    f12t: "Registro de atividade", f12b: "Cada ação de declarar, restaurar e arquivar em uma linha do tempo revisável.",
    f13t: "Regras por domínio", f13b: "Nunca arquive seus sites favoritos; mantenha outros sempre fixados. Configure em Opções.",
    f14t: "Automação agendada", f14b: "Auto-exportação e varredura de fantasmas no horário e fuso que você escolher.",
    faq6q: "Como funciona o backup no Google Drive?",
    faq6a: "Opcional. Em Opções cole seu próprio Client ID OAuth do Google e faça login — a extensão envia um snapshot para a pasta oculta appDataFolder do Drive (só esta extensão lê). Restaure em qualquer navegador. Nada sai do seu dispositivo sem ativação.",
    faq7q: "Como funciona a trava por PIN?",
    faq7a: "Defina um PIN em Opções e a popup pede a cada abertura. Ele é salgado e hasheado com PBKDF2-SHA256 (250k iterações) — nunca em texto puro. Esqueceu? Remova os dados da extensão em chrome://extensions.",
    faq8q: "O que são regras por domínio?",
    faq8a: "Em Opções você adiciona domínios que nunca devem ser auto-arquivados (por exemplo seu email) e domínios que devem permanecer fixados. Valem para Auto-Arquivo e o Verificador de Fantasmas.",
    installKicker: "Como instalar",
    installTitle: "Instale em 5 passos fáceis.",
    installIntro: "Nunca instalou uma extensão? Sem problema. Escolha seu navegador e siga — cada passo tem imagem.",
    tabChromium: "Chrome, Edge, Brave…", tabFirefox: "Firefox",
    ch1t: "Baixe o zip do Chrome",
    ch1b: "Clique para salvar o arquivo da extensão no seu computador.",
    ch2t: "Descompacte o arquivo",
    ch2b: "Encontre o zip em Downloads. Clique direito e Extrair Tudo… (Windows) ou duplo clique (Mac). Você terá a pasta tab-bankruptcy-chromium.",
    ch2n: "Lembre onde colocou — será usada no passo 4.",
    ch3t: "Abra a página de Extensões",
    ch3b: "No Chrome (ou Edge, Brave, Arc, Opera, Vivaldi), cole este endereço na barra e pressione Enter:",
    ch3n: "No Edge: edge://extensions, no Brave: brave://extensions.",
    ch4t: "Ative o Modo desenvolvedor",
    ch4b: "No canto superior direito, ligue Modo desenvolvedor. Uma nova linha de botões aparece.",
    ch4n: "Apenas permite carregar extensões de pastas. Pode desligar depois.",
    ch5t: "Clique 'Carregar sem compactação'",
    ch5b: "Clique Load unpacked e escolha a pasta tab-bankruptcy-chromium do passo 2.",
    ch5n: "Por fim: clique o quebra-cabeça na barra e fixe TabBankruptcy.",
    ff1t: "Baixe o zip do Firefox",
    ff1b: "Salve a versão Firefox no seu computador.",
    ff1n: "Não precisa descompactar — Firefox carrega o zip direto.",
    ff2t: "Abra a página de depuração",
    ff2b: "Cole este endereço na barra do Firefox e pressione Enter:",
    ff3t: "Clique 'Carregar Complemento Temporário…'",
    ff3b: "Clique Load Temporary Add-on…, um seletor de arquivos abre.",
    ff4t: "Selecione o zip baixado",
    ff4b: "Escolha tab-bankruptcy-firefox.zip em Downloads.",
    ff5t: "Fixe na barra",
    ff5b: "Clique o quebra-cabeça no canto superior direito, encontre TabBankruptcy e fixe. Pronto.",
    ff5n: "Aviso: Firefox remove complementos temporários ao fechar. Para permanente: Firefox Developer/Nightly ou aguarde a AMO.",
    faqTitle: "Perguntas frequentes",
    faq1q: "É seguro? Por que Modo desenvolvedor?",
    faq1a: "Ele permite carregar extensões fora da Chrome Web Store/AMO. Não dá poderes extra — TabBankruptcy usa só as permissões do manifest. Dados ficam locais salvo sync opcional.",
    faq2q: "O que acontece ao 'Declarar falência'?",
    faq2a: "Todas as abas da janela atual (exceto fixadas, se ativado) são salvas em uma sessão nomeada. A extensão abre uma aba em branco e fecha as demais — RAM liberada. Restaure quando quiser.",
    faq3q: "Onde ficam meus dados?",
    faq3a: "No armazenamento local do navegador. Use Exportar no popup, ou auto-export agendado. Também dá para espelhar em chrome.storage.sync ou seu endpoint HTTPS.",
    faq4q: "Como atualizo para nova versão?",
    faq4a: "Baixe o novo zip, descompacte, e em chrome://extensions clique atualizar no cartão do TabBankruptcy e re-selecione a nova pasta. Sessões permanecem.",
    faq5q: "Funciona no celular?",
    faq5a: "Sim no Android: use Kiwi Browser ou Firefox para Android. Sem suporte a iOS.",
    copied: "copiado", clickToCopy: "clique para copiar",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "Extensões", devMode: "Modo desenvolvedor",
    loadUnpacked: "Carregar sem compactação", packExtension: "Empacotar", updateBtn: "Atualizar",
    devModeHint: "Ligue o botão no canto superior direito.",
    tempExtensions: "Extensões temporárias", thisFirefox: "Este Firefox",
    loadTempAddon: "Carregar Complemento Temporário…",
  },
  ja: {
    tagline: "Chrome & Firefox 拡張機能 · Manifest V3",
    guide: "インストール手順",
    versionBadge: "v1.6 · 自動アーカイブ & ゴーストチェッカー",
    heroLead: "タブが多すぎる？",
    heroAccent: "破産宣告を。",
    sub: "1クリックで全タブをセッションに保存し、すべて閉じてメモリを解放。いつでも復元、アカウント不要。",
    downloadChromium: "Chrome 版をダウンロード",
    downloadFirefox: "Firefox 版をダウンロード",
    worksOn: "お使いのブラウザで動作します",
    footer: "ローカル優先・アカウント不要・トラッキングなし・データはブラウザ内。",
    changeLanguage: "言語を変更", toggleTheme: "テーマ切替",
    f1t: "破産宣告", f1b: "すべてのタブを一度に命名・保存・クローズ。メモリ即解放。",
    f2t: "セッション履歴", f2b: "アーカイブはローカル保存。検索・タグ・メモ可能。",
    f3t: "いつでも復元", f3b: "1クリックでセッション全体を復元 — 新規または現在のウィンドウ。",
    f4t: "キーボードショートカット", f4b: "Ctrl+Shift+X で宣告、Ctrl+Shift+L で復元、Ctrl+Shift+B でダッシュボード。",
    f5t: "ゴーストタブチェッカー", f5b: "アイドル・サスペンド・重複タブを検出して安全に閉じる — 取り消し可。",
    f6t: "エクスポート & インポート", f6b: "セッションとアーカイブを JSON でバックアップ。ブラウザ間で移動。",
    f7t: "検索とフィルター", f7b: "名前・タイトル・URL・タグでセッションを検索。",
    f8t: "ローカル優先・プライベート", f8b: "アカウント不要、追跡なし。任意の自前クラウドへ同期可能。",
    f9t: "自動アーカイブ", f9b: "アイドルタブをサイドパネルへ退避してメモリを節約。",
    f10t: "Google Drive バックアップ", f10b: "Google でサインインし、Drive の appData フォルダにセッションをバックアップ。どの端末でも復元可能。",
    f11t: "PIN ロック", f11b: "任意の PBKDF2 で保護された PIN が履歴を第三者から守ります。",
    f12t: "アクティビティログ", f12b: "すべての宣告・復元・アーカイブ操作をきれいなタイムラインで確認。",
    f13t: "ドメイン別ルール", f13b: "お気に入りサイトは絶対に自動アーカイブしない、他は常にピン留め。設定から。",
    f14t: "スケジュール自動化", f14b: "任意の時刻とタイムゾーンでセッション自動書き出しとゴースト検査。",
    faq6q: "Google Drive バックアップの使い方は？",
    faq6a: "任意です。設定に自分の Google OAuth クライアント ID を貼ってサインインすると、Drive の隠し appDataFolder（この拡張のみ読める）にスナップショットを保存します。どのブラウザでも復元可能。有効化しない限り端末外へは出ません。",
    faq7q: "PIN ロックの仕組みは？",
    faq7a: "設定で PIN を登録するとポップアップ起動時に毎回要求されます。ソルト付き PBKDF2-SHA256（25 万回反復）でハッシュ保存し、平文は保持しません。忘れた場合は chrome://extensions で拡張データを削除して再設定してください。",
    faq8q: "ドメイン別ルールとは？",
    faq8a: "設定で「決して自動アーカイブしないドメイン」（例：メール）と「常にピン留めにするドメイン」を追加できます。自動アーカイブとゴーストチェッカーの両方に適用されます。",
    installKicker: "インストール手順",
    installTitle: "簡単5ステップでインストール。",
    installIntro: "拡張機能を入れるのが初めて？大丈夫。ブラウザを選んで進めてください — 各ステップに画像あり。",
    tabChromium: "Chrome、Edge、Brave…", tabFirefox: "Firefox",
    ch1t: "Chrome 用 zip をダウンロード",
    ch1b: "ボタンをクリックして拡張機能ファイルをPCに保存。",
    ch2t: "zip を解凍",
    ch2b: "ダウンロードフォルダの zip を、右クリック→すべて展開…（Windows）または ダブルクリック（Mac）。tab-bankruptcy-chromium フォルダができます。",
    ch2n: "場所を覚えておいてください — ステップ4で使います。",
    ch3t: "拡張機能ページを開く",
    ch3b: "Chrome（または Edge, Brave, Arc, Opera, Vivaldi）のアドレスバーに貼り付けて Enter：",
    ch3n: "Edge は edge://extensions、Brave は brave://extensions。",
    ch4t: "デベロッパーモードを ON",
    ch4b: "ページ右上のデベロッパーモードを ON。新しいボタン列が現れます。",
    ch4n: "フォルダから拡張機能を読み込むためだけの設定です。後でオフにしても大丈夫。",
    ch5t: "「パッケージ化されていない拡張機能を読み込む」をクリック",
    ch5b: "Load unpacked を押し、ステップ2の tab-bankruptcy-chromium フォルダを選択。",
    ch5n: "最後にツールバーのパズルアイコンから TabBankruptcy をピン留め。",
    ff1t: "Firefox 用 zip をダウンロード",
    ff1b: "Firefox 版をPCに保存。",
    ff1n: "解凍不要 — Firefox は zip をそのまま読み込みます。",
    ff2t: "デバッグページを開く",
    ff2b: "Firefox のアドレスバーに貼り付けて Enter：",
    ff3t: "「一時的なアドオンを読み込む…」をクリック",
    ff3b: "Load Temporary Add-on… をクリックするとファイル選択が開きます。",
    ff4t: "ダウンロードした zip を選択",
    ff4b: "ダウンロードから tab-bankruptcy-firefox.zip を選択。",
    ff5t: "ツールバーにピン留め",
    ff5b: "右上のパズルから TabBankruptcy を見つけてピン留め。完了。",
    ff5n: "注意：Firefox は終了時に一時アドオンを削除します。恒久利用は Firefox Developer/Nightly か AMO を待ってください。",
    faqTitle: "よくある質問",
    faq1q: "安全ですか？なぜデベロッパーモードが必要？",
    faq1a: "Chrome Web Store / AMO 未掲載の拡張機能を読み込むためで、追加権限は付与しません。TabBankruptcy はマニフェストの権限のみ使用。データはローカル保存（任意同期を除く）。",
    faq2q: "「破産宣告」で何が起こる？",
    faq2a: "現在のウィンドウの全タブ（オプションでピン留めを除外）を名前付きセッションに保存し、空白タブを開いて他を閉じます。メモリ即解放、いつでも復元可能。",
    faq3q: "データはどこ？失う可能性は？",
    faq3a: "ブラウザのローカルストレージに保存。Popup の Export でバックアップ、または定期エクスポートを有効化。chrome.storage.sync ミラーや自前 HTTPS エンドポイントも可能。",
    faq4q: "新バージョンへの更新方法は？",
    faq4a: "新しい zip をダウンロードして解凍、chrome://extensions で TabBankruptcy カードの更新をクリックし新フォルダを再選択。セッションは保持されます。",
    faq5q: "スマホで動きますか？",
    faq5a: "Android は可：Kiwi Browser または Firefox for Android（どちらも Manifest V3 対応）。iOS 非対応。",
    copied: "コピー済", clickToCopy: "クリックでコピー",
    chromeLabel: "Chrome", firefoxLabel: "Firefox",
    extensionsLabel: "拡張機能", devMode: "デベロッパーモード",
    loadUnpacked: "パッケージ化されていない読込", packExtension: "パッケージ化", updateBtn: "更新",
    devModeHint: "右上のトグルを ON にしてください。",
    tempExtensions: "一時的な拡張機能", thisFirefox: "この Firefox",
    loadTempAddon: "一時的なアドオンを読み込む…",
  },
};

const tr = (lang: string, k: string) => I18N[lang]?.[k] ?? I18N.en[k] ?? k;

type Browser = "chromium" | "firefox";

function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [browser, setBrowser] = useState<Browser>("chromium");

  useEffect(() => {
    const stored = localStorage.getItem("tb_home_theme");
    const preferred =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(preferred);
    const storedLang = localStorage.getItem("tb_home_lang");
    if (storedLang && I18N[storedLang]) setLang(storedLang);
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("firefox")) setBrowser("firefox");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tb_home_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("tb_home_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const T = (k: string) => tr(lang, k);

  const download = (variant: Browser) => {
    const file = variant === "firefox" ? "tab-bankruptcy-firefox.zip" : "tab-bankruptcy-chromium.zip";
    fetch(`/${file}`)
      .then((res) => { if (!res.ok) throw new Error(`Download failed: ${res.status}`); return res.blob(); })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file; a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-20 border-b border-neutral-200/70 dark:border-neutral-900/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
              <Landmark size={16} className="text-white dark:text-neutral-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight">TabBankruptcy</h1>
              <p className="text-[10px] text-neutral-500 truncate">{T("tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <a href="#install" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 px-2">
              <HelpCircle size={13} /> {T("guide")}
            </a>
            <button onClick={() => setLangOpen((v) => !v)} className="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[11px] font-medium uppercase" aria-label={T("changeLanguage")}>
              {lang}
            </button>
            {langOpen && (
              <div className="absolute right-10 top-10 z-30 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1 max-h-72 overflow-auto">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 ${lang === l.code ? "font-semibold" : ""}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center" aria-label={T("toggleTheme")}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-3 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles size={11} /> {T("versionBadge")}
          </span>
          <h2 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            {T("heroLead")}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">{T("heroAccent")}</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-neutral-900/10 dark:bg-white/15 -z-0" />
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400">{T("sub")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => download("chromium")} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-5 py-3 font-semibold hover:opacity-90 active:scale-[0.98] transition shadow-sm">
              <Download size={18} />{T("downloadChromium")}
            </button>
            <button onClick={() => download("firefox")} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-3 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 active:scale-[0.98] transition">
              <Download size={18} />{T("downloadFirefox")}
            </button>
            <a href="#install" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <HelpCircle size={16} />{T("guide")}
            </a>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">{T("worksOn")}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] text-neutral-500">
              <Chip>Chrome</Chip><Chip>Edge</Chip><Chip>Brave</Chip><Chip>Opera</Chip>
              <Chip>Vivaldi</Chip><Chip>Arc</Chip><Chip>Kiwi (Android)</Chip>
              <Chip>Firefox</Chip><Chip>Firefox for Android</Chip>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Gavel size={16} />} title={T("f1t")} body={T("f1b")} />
          <Feature icon={<Archive size={16} />} title={T("f2t")} body={T("f2b")} />
          <Feature icon={<RotateCcw size={16} />} title={T("f3t")} body={T("f3b")} />
          <Feature icon={<Keyboard size={16} />} title={T("f4t")} body={T("f4b")} />
          <Feature icon={<Ghost size={16} />} title={T("f5t")} body={T("f5b")} />
          <Feature icon={<FileJson size={16} />} title={T("f6t")} body={T("f6b")} />
          <Feature icon={<Search size={16} />} title={T("f7t")} body={T("f7b")} />
          <Feature icon={<ShieldCheck size={16} />} title={T("f8t")} body={T("f8b")} />
          <Feature icon={<Sparkles size={16} />} title={T("f9t")} body={T("f9b")} />
        </section>

        <section id="install" className="mt-24 scroll-mt-20">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{T("installKicker")}</p>
              <h3 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">{T("installTitle")}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">{T("installIntro")}</p>
            </div>
            <div className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 bg-neutral-50 dark:bg-neutral-900" role="tablist">
              <button role="tab" aria-selected={browser === "chromium"} onClick={() => setBrowser("chromium")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${browser === "chromium" ? "bg-white dark:bg-neutral-950 shadow-sm text-neutral-900 dark:text-neutral-50" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"}`}>
                {T("tabChromium")}
              </button>
              <button role="tab" aria-selected={browser === "firefox"} onClick={() => setBrowser("firefox")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${browser === "firefox" ? "bg-white dark:bg-neutral-950 shadow-sm text-neutral-900 dark:text-neutral-50" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"}`}>
                {T("tabFirefox")}
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {browser === "chromium" ? <ChromiumSteps T={T} onDownload={() => download("chromium")} /> : <FirefoxSteps T={T} onDownload={() => download("firefox")} />}
          </div>

          <div className="mt-14">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle size={16} /> {T("faqTitle")}
            </h4>
            <div className="mt-4 space-y-2">
              <FAQ q={T("faq1q")}>{T("faq1a")}</FAQ>
              <FAQ q={T("faq2q")}>{T("faq2a")}</FAQ>
              <FAQ q={T("faq3q")}>{T("faq3a")}</FAQ>
              <FAQ q={T("faq4q")}>{T("faq4a")}</FAQ>
              <FAQ q={T("faq5q")}>{T("faq5a")}</FAQ>
            </div>
          </div>
        </section>

        <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-900 py-8 text-xs text-neutral-500 flex flex-wrap items-center gap-2">
          <ShieldCheck size={13} /> {T("footer")}
        </footer>
      </div>
    </main>
  );
}

/* components */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-2.5 py-0.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white hover:shadow-sm cursor-default">
      {children}
    </span>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_20px_40px_-20px_rgba(255,255,255,0.1)] hover:border-neutral-900 dark:hover:border-white">
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-neutral-900/[0.04] dark:via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-neutral-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
      <div className="relative flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md">
          {icon}
        </span>
        <h4 className="text-sm font-semibold transition-transform duration-500 group-hover:translate-x-0.5">{title}</h4>
      </div>
      <p className="relative mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 transition-colors duration-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200">{body}</p>
    </div>
  );
}

function StepCard({ n, title, body, visual }: { n: number; title: string; body: React.ReactNode; visual: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm font-bold">{n}</span>
            <h5 className="text-lg font-semibold tracking-tight">{title}</h5>
          </div>
          <div className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 space-y-2">{body}</div>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900/70 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 p-5 flex items-center justify-center">{visual}</div>
      </div>
    </div>
  );
}

type TFn = (k: string) => string;

function ChromiumSteps({ T, onDownload }: { T: TFn; onDownload: () => void }) {
  return (
    <>
      <StepCard n={1} title={T("ch1t")} body={
        <>
          <p>{T("ch1b")}</p>
          <button onClick={onDownload} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 text-xs font-semibold hover:opacity-90">
            <Download size={13} /> tab-bankruptcy-chromium.zip
          </button>
        </>
      } visual={<ZipVisual name="tab-bankruptcy-chromium.zip" />} />
      <StepCard n={2} title={T("ch2t")} body={<><p>{T("ch2b")}</p><p className="text-xs text-neutral-500">{T("ch2n")}</p></>} visual={<FolderVisual />} />
      <StepCard n={3} title={T("ch3t")} body={<><p>{T("ch3b")}</p><CopyBox text="chrome://extensions" T={T} /><p className="text-xs text-neutral-500">{T("ch3n")}</p></>} visual={<BrowserBar url="chrome://extensions" label={T("chromeLabel")} />} />
      <StepCard n={4} title={T("ch4t")} body={<><p>{T("ch4b")}</p><p className="text-xs text-neutral-500">{T("ch4n")}</p></>} visual={<DevToggleVisual T={T} />} />
      <StepCard n={5} title={T("ch5t")} body={<><p>{T("ch5b")}</p><p className="text-xs text-neutral-500">{T("ch5n")} <Puzzle size={11} className="inline align-[-1px]" /></p></>} visual={<LoadUnpackedVisual T={T} />} />
    </>
  );
}

function FirefoxSteps({ T, onDownload }: { T: TFn; onDownload: () => void }) {
  return (
    <>
      <StepCard n={1} title={T("ff1t")} body={
        <>
          <p>{T("ff1b")}</p>
          <button onClick={onDownload} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 text-xs font-semibold hover:opacity-90">
            <Download size={13} /> tab-bankruptcy-firefox.zip
          </button>
          <p className="text-xs text-neutral-500">{T("ff1n")}</p>
        </>
      } visual={<ZipVisual name="tab-bankruptcy-firefox.zip" />} />
      <StepCard n={2} title={T("ff2t")} body={<><p>{T("ff2b")}</p><CopyBox text="about:debugging#/runtime/this-firefox" T={T} /></>} visual={<BrowserBar url="about:debugging#/runtime/this-firefox" label={T("firefoxLabel")} />} />
      <StepCard n={3} title={T("ff3t")} body={<p>{T("ff3b")}</p>} visual={<LoadTempVisual T={T} />} />
      <StepCard n={4} title={T("ff4t")} body={<p>{T("ff4b")}</p>} visual={<FolderVisual firefox />} />
      <StepCard n={5} title={T("ff5t")} body={<><p>{T("ff5b")} <Puzzle size={11} className="inline align-[-1px]" /></p><p className="text-xs text-neutral-500">{T("ff5n")}</p></>} visual={<PinVisual />} />
    </>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-neutral-200 dark:border-neutral-800 open:bg-neutral-50 dark:open:bg-neutral-900/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
        {q}
        <ChevronDown size={16} className="text-neutral-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{children}</div>
    </details>
  );
}

/* visual mocks */
function CopyBox({ text, T }: { text: string; T: TFn }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="mt-1 inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <code>{text}</code>
      <span className="text-[10px] uppercase tracking-widest text-neutral-500">{copied ? T("copied") : T("clickToCopy")}</span>
    </button>
  );
}

function ZipVisual({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="h-24 w-20 rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 flex flex-col items-center justify-center shadow-sm">
          <div className="flex flex-col gap-1 items-center">
            {[0, 1, 2, 3].map((i) => (<div key={i} className="h-1 w-4 bg-neutral-300 dark:bg-neutral-700 rounded-sm" />))}
          </div>
          <span className="mt-2 text-[9px] font-bold text-neutral-400">ZIP</span>
        </div>
        <Download size={14} className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 p-1 border-2 border-neutral-50 dark:border-neutral-900" />
      </div>
      <code className="text-[10px] text-neutral-500 font-mono">{name}</code>
    </div>
  );
}

function FolderVisual({ firefox = false }: { firefox?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <FolderOpen size={64} className="text-neutral-400 dark:text-neutral-600" strokeWidth={1.3} />
      <code className="text-[10px] text-neutral-500 font-mono">{firefox ? "Downloads/" : "tab-bankruptcy-chromium/"}</code>
    </div>
  );
}

function BrowserBar({ url, label }: { url: string; label: string }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-400">{label}</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <code className="text-[11px] font-mono truncate">{url}</code>
        </div>
      </div>
    </div>
  );
}

function DevToggleVisual({ T }: { T: TFn }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400">{T("extensionsLabel")}</span>
        <div className="flex items-center gap-2 text-[11px] font-medium">
          {T("devMode")}
          <span className="relative inline-flex h-4 w-7 rounded-full bg-neutral-900 dark:bg-white">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white dark:bg-neutral-900" />
          </span>
        </div>
      </div>
      <div className="flex gap-1.5 p-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold">{T("loadUnpacked")}</span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">{T("packExtension")}</span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">{T("updateBtn")}</span>
      </div>
      <div className="p-3 flex items-center gap-1 text-[10px] text-neutral-400">
        <ToggleRight size={12} /> {T("devModeHint")}
      </div>
    </div>
  );
}

function LoadUnpackedVisual({ T }: { T: TFn }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex gap-1.5 p-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-1 text-[10px] font-bold shadow">{T("loadUnpacked")}</span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-[10px] text-neutral-500">{T("packExtension")}</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 flex items-center gap-2">
          <Landmark size={14} className="text-neutral-500" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold">TabBankruptcy</div>
            <div className="text-[9px] text-neutral-500 truncate">{T("sub")}</div>
          </div>
          <span className="text-[9px] font-mono text-neutral-400">1.6.0</span>
        </div>
      </div>
    </div>
  );
}

function LoadTempVisual({ T }: { T: TFn }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-400">{T("tempExtensions")}</div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-[11px] text-neutral-500">{T("thisFirefox")}</span>
        <span className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2.5 py-1 text-[10px] font-bold shadow">{T("loadTempAddon")}</span>
      </div>
    </div>
  );
}

function PinVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <Puzzle size={14} className="text-neutral-500" />
        <div className="h-6 w-6 rounded-md bg-neutral-900 dark:bg-white flex items-center justify-center">
          <Landmark size={11} className="text-white dark:text-neutral-900" />
        </div>
      </div>
      <div className="p-3">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 flex items-center gap-2">
          <Landmark size={13} className="text-neutral-500" />
          <div className="flex-1 text-[11px] font-semibold">TabBankruptcy</div>
          <Pin size={12} className="text-neutral-900 dark:text-white" />
        </div>
      </div>
    </div>
  );
}
