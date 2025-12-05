// Symbols como keys dinámicos (unique por partida)
const STORM = Symbol('stormZone');
const LOOT = Symbol('lootDrop');
const SQUAD = Symbol('squadLive');

// WeakMap para loot temporal (auto-cleanup)
const lootTracker = new WeakMap();

// Objeto base del juego (ahora const, no se reasigna)
const miJuego = {
  [STORM]: {
    radio: 500n,              // BigInt: tamaño de storm
    activo: true,             // Boolean
    nombre: "Storm Circle",   // String
    medsRestantes: undefined, // Undefined: no asignado
    timer: null               // Null: paused
  },
  skin: "Raven",
  kills: 7,
  [LOOT]: null
};

// Proxy para debuggear Symbols y lecturas
const game = new Proxy(miJuego, {
  get(target, prop, receiver) {
    if (prop === 'debugKeys') {
      // Ver todos los Symbol keys importantes
      return Object.getOwnPropertySymbols(target);
    }
    return Reflect.get(target, prop, receiver);
  }
});

// Función para crear un tracker de storm (encapsula parte del estado)
function createStormTracker(gameObj) {
  const zona = gameObj[STORM];

  return {
    shrink() {
      // Asegura valor inicial si viniera null/undefined
      zona.radio ??= 1000n;

      // BigInt math: storm se reduce 10% cada tick
      zona.radio = zona.radio * 9n / 10n; // División BigInt truncada [web:11]

      // Trackeo de loot asociado al estado actual (auto-GC por WeakMap)
      lootTracker.set(gameObj, { balas: 30 });

      return zona.radio;
    },
    getRadio() {
      return zona.radio;
    }
  };
}

// Instanciamos el tracker de Storm
const stormTracker = createStormTracker(game);

// Squad con Symbols únicos por player
function addSquadMember(nombre) {
  game[SQUAD] ??= [];
  game[SQUAD].push({
    id: Symbol(nombre),      // Symbol único por player
    vivo: true,
    posicion: null
  });
}

// Demo en acción (ejecuta esto en Node o navegador)
console.log("🟢 Zero Build Storm Tracker OPTIMIZADO");
console.log("Radio inicial:", stormTracker.getRadio());

// Simula 5 ticks de storm
for (let tick = 0; tick < 5; tick++) {
  const nuevoRadio = stormTracker.shrink();
  console.log(`Tick ${tick}: Storm a ${nuevoRadio} metros`);
}

// Squad
addSquadMember("Teammate1");
console.log("Squad:", game[SQUAD]);

// Loot enlazado a miJuego vía WeakMap
console.log("Loot tracked:", lootTracker.get(game)); // Depende del GC, pero visible mientras vivo

// Acceso “secreto” usando optional chaining + nullish coalescing
console.log("Acceso secreto:", game[STORM]?.medsRestantes ?? "No meds");

// Nuevas tools de debug gracias al Proxy
console.log("Symbol keys en game (debug):", game.debugKeys);
