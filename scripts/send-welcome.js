#!/usr/bin/env node
/**
 * send-welcome.js — Envía la secuencia de bienvenida de El Edicto Real
 *
 * Cada vez que se ejecuta, mira qué contactos hay en la lista #3 de Brevo,
 * calcula qué email les toca según los días que llevan suscritos,
 * y envía el que corresponda. Lleva un registro local para no repetir.
 *
 * Uso:
 *   node scripts/send-welcome.js              → envía lo que toque
 *   node scripts/send-welcome.js --dry-run     → muestra qué haría sin enviar
 *
 * Requiere Node 18+ (fetch nativo).
 * La API key se lee del .env del proyecto.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Configuración ──────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const TRACKER_PATH = resolve(__dirname, "welcome-tracker.json");
const BREVO_API = "https://api.brevo.com/v3";
const LIST_ID = 3;
const SENDER = { name: "Rey", email: "rey@recursosdelreyrojo.com" };
const REPLY_TO = "rey@recursosdelreyrojo.com";
const DRY_RUN = process.argv.includes("--dry-run");

// ── API key ────────────────────────────────────────────────────
let API_KEY = process.env.BREVO_API_KEY;
if (!API_KEY) {
  const envPath = resolve(PROJECT_ROOT, ".env");
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, "utf-8").match(/BREVO_API_KEY=(.+)/);
    if (match) API_KEY = match[1].trim();
  }
}
if (!API_KEY) {
  console.error("❌ No encuentro BREVO_API_KEY. Revísalo.");
  process.exit(1);
}

// ── Plantilla base de email ────────────────────────────────────
function wrapHTML(bodyHTML) {
  const footer = `
<hr style="border:none;border-top:1px solid #e0e0e0;margin:36px 0 16px;">
<ul style="font-size:12px;line-height:1.5;color:#999;padding-left:18px;margin:0;">
  <li style="margin-bottom:4px;">Si te gustan los emails de Rey, reenvíalos a un amigo y sino a tus enemigos y que se jodan.</li>
  <li style="margin-bottom:4px;">Si alguien te reenvió este email y quieres más de lo mismo, suscríbete en <a href="https://recursosdelreyrojo.com" style="color:#c32429;"><strong>recursosdelreyrojo.com</strong></a></li>
  <li>Si quieres darte de baja es <a href="{unsubscribe}" style="color:#c32429;"><strong>AQUÍ</strong></a></li>
</ul>`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
${bodyHTML}
${footer}
</body>
</html>`;
}

// ── Los 4 emails ───────────────────────────────────────────────
// Cada uno es una función que devuelve { subject, html }
// El HTML es texto llano: párrafos en <p>, negritas en <strong>, alguna <hr>

function email1() {
  const body = `
<p>Bienvenido a la Corte del Rey.</p>

<p>Estás en la primera fila del Banquete Real, esperando que el buffet sea de tu agrado.</p>

<p>Y si estás aquí sentado, es porque algo o alguien te ha dicho: "Esto es diferente. Esto promete" o porque te inquieta saber quién coño es el loco este que se las da de Rey.</p>

<p>El caso es que estás dentro, pulsaste el botón rojo, te tomaste la pastilla roja y quieres ver (qué tan profundo es el hoyo) la Matrix por dentro, o el Edicto Real, o cuáles son los Recursos esos de los que hablo.</p>

<p>Pero antes, vamos a definir dos cosas.</p>

<p><strong>Primero</strong>: Te has topado con un Rey. Eso ESTÁ CLARO.</p>

<p>Sí, ya sé que suena pretencioso pero en realidad no lo es tanto. La verdad es mucho más sencilla y desconcertante de lo que te puedas imaginar. Más abajo te lo explico.</p>

<p><strong>Segundo:</strong> Esto es un modelo de negocio, mi negocio. El salón de mi castillo, donde se hacen las fiestas y se emborracha el Rey. Así que vete preparando cepillo y pasta por si te coge la noche.</p>

<p><strong>Tercero:</strong> Sé que dije dos cosas, pero son tres, o cuatro, o las que se me antoje, que soy el Rey.</p>

<p><strong>Cuarto:</strong> Te contaré muchas cosas. MUCHAS. Algunas son bastante delirantes y contraintuitivas. Otras de puro sentido común y tan sencillas y prácticas que nadie las tiene en cuenta.</p>

<p>Te daré consejos y recursos acompañados de relatos divertidos que te ayudarán a recordar y aplicar lo aprendido. Algunos accionables y otros para ser (por lo menos) un poco mejor en los negocios y en la vida.</p>

<p>Mi objetivo es que pienses, te espabiles, te sacudas y, si te gusta lo que cuento en el salón, pagues por los productos y servicios del Reino.</p>

<p><strong>Quinto:</strong> Casi siempre estaré vendiendo algo. Como te dije, esto es un negocio. Y si te fijas cómo lo hago ya estarás aprovechando mis delirios.</p>

<p>Si todavía no lo pillas, te lo explico mejor:</p>

<p>Todos los días te escribo un email (un Edicto Real), en ellos te cuento cosas, pero también te vendo lo que sé y lo que aprendo.</p>

<p>Esto puede molestar a mucha gente, es posible que a ti también, no lo sé. Hoy en día la gente se ofende por todo. Si les vendes se ofenden y si no, también. Eso no es vida, pero qué más da. Problema de los ofendiditos.</p>

<p>Por otro lado hay gente espabilada que lo ve como una oportunidad de <em>ganar</em>, porque en el peor de los casos, aprenden algo interesante y lucrativo, aunque no compren nada.</p>

<p>Tú decides en cuál de los dos casos estar.</p>

<p>Si eres de los que se ofenden, te das de baja cuando te empieces a poner morado.</p>

<p>Si eres de los espabilados que quieren ganar y no perder el tiempo en quejarse o criticar, te digo de qué cosas hablo.</p>

<p>Pensándolo bien…</p>

<p>Mejor no te digo nada y lo vas descubriendo por el camino. Que a lo mejor te creas más expectativas de la cuenta y me das por loco en menos de un mes.</p>

<p>Si lo que te cuente te cuadra, ¡perfecto! Y si no, no me hagas caso. Si te aburres o te abrumas, te das de baja. Que abrumarse también es malo. Genera inmovilismo por bloqueo mental. A mí me ha pasado.</p>

<p><strong>Sexto:</strong> Me interesa que ganes dinero. Ganar dinero es bueno, es muy bueno. Es bueno para ti, para tu familia, para todos. Sobre todo para mí, ya que si aplicas y te funciona lo que digo, vendrás por más y con más dinero.</p>

<p>Por cierto, el dinero es un comodín que puedes cambiar por libertad, seguridad y recursos. Con el dinero ganas tiempo y paz mental. Quien te diga lo contrario no tiene ni tendrá nunca suficiente dinero.</p>

<p>OK, todo aclarado.</p>

<p>Con esto vale para que te hagas una idea de dónde te has metido.</p>

<p>En el próximo email te cuento de dónde viene lo de Rey Rojo, que al fin y al cabo no es tan importante.</p>

<p>Otra cosa.</p>

<p>Para que esto fluya como el dinero a la cuenta de un político, responde a este email ahora mismo contando cómo conociste mi reino. O pon lo que te venga a la cabeza. Algo corto, cualquier cosa. Dale un cabezazo al teclado y envía lo que salga. Responde con un simple punto "." y lo enmarcaré como prueba de tu existencia.</p>

<p>Rey</p>

<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

<p style="font-size:14px;color:#666;">PD. Por si aún no has descargado el PDF con 5 técnicas de persuasión para vender más y mejor, aquí lo tienes de nuevo: → <a href="https://recursosdelreyrojo.com/descargas/El%20Puente%20%E2%80%94%20Recursos%20del%20Rey%20Rojo.pdf" style="color:#c32429;"><strong>Descargar: "El Puente"</strong></a></p>

<p style="font-size:14px;color:#666;">PD 2: Si este email ha caído en la carpeta de "Promociones", arrástralo a "Principal". Si no, los centinelas de Google o del cliente de correo que uses decidirán por ti lo que lees y lo que no.</p>

<p style="font-size:14px;color:#666;">PD 3: Si no te interesa la persuasión tampoco te interesan los negocios.</p>
`.trim();

  return {
    subject: "Cómo evitar malos entendidos desde el primer día en la mesa de un castillo",
    html: wrapHTML(body),
  };
}

function email2() {
  const body = `
<p>En el email anterior te dije que te lo contaba.</p>

<p>Reiner Rojas.</p>

<p>Ese es mi nombre real.</p>

<p>No es un personaje inventado por un equipo de branding. Es que me pusieron ese nombre y mis amigos me llaman Rey, y con Rojas de apellido ya te podrás imaginar.</p>

<p>Rey Rojo.</p>

<p>Un día juntando las piezas me di cuenta de que tenía el nombre de un villano de cómic.</p>

<p>Así que lo usé.</p>

<p>Y ya. Eso es todo. Te dije que no era tan importante.</p>

<p>— Menudo gilipollas. ¿Qué has hecho? Has destrozado el mito. Rompiste el misterio.</p>

<p>— Puede ser. Ya te digo que muy listo no debe ser este Rey.</p>

<p>En realidad, pensé en usarlo y mantener el misterio para darle una capa de misticismo a la marca y de paso separar mi vida pública de la privada.</p>

<p>Pero resulta que Rey Rojo es la cara pública de un tipo desconocido, sin presencia en redes sociales.</p>

<p>Así que da igual. Hay más de Rey ahí afuera que del tipo que lo creó. Además, el anonimato es un coñazo difícil de mantener, sobre todo en los negocios.</p>

<p>Y aunque tengo redes sociales, no publico nada personal, ni comparto nada, ni lo hice nunca. No me gusta. No me interesa y además nunca me hizo falta para mis negocios.</p>

<p>Además, siendo Rey puedo adoptar un enfoque narrativo en mi contenido, y crear un "mundo" alrededor de mi marca con su propio lenguaje, cultura, reglas y personajes para hacerlo más interesante y entretenido.</p>

<p>— Pero Rey, a mí me va bien con las redes sociales.</p>

<p>— Seguro, no te lo discuto. Si tienes un negocio, las redes sociales son un canal de tráfico y captación brutal. Lo que digo es que a nadie le importa dónde pasaste tus vacaciones, ni en qué bar estás tomando cerveza, ni en qué concierto estás gritando como una cabra en celo. Esa necesidad de mostrarle al mundo lo genial que es tu vida es solo tuya y de nadie más.</p>

<p>Lo que sí es importante es lo que haces en tu vida, los errores que has cometido, las cosas que estás aprendiendo, las decisiones que tomas bajo presión y cómo eso puede ayudar a otras personas.</p>

<p>Así que te cuento lo que yo hice.</p>

<p>Imagina que naces en una isla tropical. Una postal con playa, palmeras y mojitos.</p>

<p>¿Qué más podrías pedirle a la vida, eh?</p>

<p>Te lo digo:</p>

<p><strong>LIBERTAD.</strong> Tienes que pedirle libertad. De eso se trata todo.</p>

<p>A esa postal edulcorada le falta el ingrediente principal: <strong>LIBERTAD.</strong></p>

<p>Libertad de pensamiento, libertad de decisión, libertad de opinión, libertad de movimiento, libertad económica…</p>

<p>Le falta <strong>mucha</strong>, pero <strong>muchísima libertad.</strong></p>

<p>Y dinero, también le falta dinero. Y el DINERO <strong>es</strong> LIBERTAD.</p>

<p>Pues eso.</p>

<p>Este Rey nació y creció en esa postal.</p>

<p>Pero detrás del cartón pintado, hay un infierno disfrazado de paraíso.</p>

<p>Un reino de contradicciones. Un lugar donde aprendes a vivir con dos versiones del mundo: la que te venden y la que te comes cruda. Creces con la promesa de un futuro que nunca llega, en una tierra detenida en el tiempo, donde el gobierno te dice hasta cómo respirar.</p>

<p><strong>Un país que se vende al mundo como un paraíso comunista en medio del mar Caribe. Pero del que hasta los perros quieren escapar.</strong></p>

<p><strong>¿Que si me escapé?</strong></p>

<p>Claro que me escapé. <strong>Me piré, me fui, lo dejé todo atrás.</strong></p>

<p><strong>Pero primero...</strong></p>

<p><strong>Monté un negocio. Cuando empezaron medio a permitirse, claro.</strong></p>

<p>Antes no se podía. Pero el Gobierno, en su infinita (y sospechosa) misericordia, aflojó ligeramente las riendas y decidió que tal vez, QUIZÁS, podríamos tener derecho a no morirnos de hambre.</p>

<p>El negocio era un estudio de diseño e impresión de artículos promocionales.</p>

<p>Tener y mantener un negocio en Cuba (¿ya sabías que era Cuba, no?) es una odisea que solo entiende quien la vive. En mi caso, la experiencia fue BRUTAL. Más de una vez estuve a punto de tirar la toalla, pero me enganché como un <strong>yonqui a su droga favorita.</strong></p>

<p>Me enganché a eso de emprender, buscar soluciones, superar retos, vender y ganar dinero. <strong>Sobre todo, a eso de ganar dinero.</strong></p>

<p>Y ojito con esto:</p>

<p><strong>Te tiene que gustar el dinero.</strong> Te tiene que excitar. No tiene por qué ser tu única obsesión, pero <strong>te tiene que gustar y excitar.</strong> Y si quieres emprender, te tiene que gustar y <strong>mucho</strong>. Si no me crees, ya te darás cuenta. <strong>Tarde o temprano</strong> te darás cuenta.</p>

<p>Al final y contra todo pronóstico, mi negocio prosperó más de lo que yo mismo esperaba.</p>

<p>Pero, por otro lado, había prosperado en el lugar equivocado.</p>

<p>En el país equivocado.</p>

<p>En Cuba siempre hay un <strong>PERO</strong> con letras de neón<strong>...</strong></p>

<p>Un <em>"no se puede"</em> seguido de un <em>"mira cómo te jodo".</em></p>

<p>Por eso. Si tienes dos dedos de frente y algo de perspectiva, tratas de escapar a lugares que generen más oportunidades.</p>

<p>No existe forma humana de describir lo que siente un cubano, pero basta decir que todos sueñan con escapar.</p>

<p>Así que este Rey agarró un pequeño cofre lleno de orgullo (y dinero) y se fue lejos de allí.</p>

<p>Y llámame loco, pero me vine a España.</p>

<p>¿Y por qué España?</p>

<p>No tengo un PowerPoint con razones lógicas.</p>

<p>No lo sé… supongo que hay decisiones que se eligen por intuición y el cerebro se limita a justificar después.</p>

<p>Sé que no es la meca del emprendimiento, ni el lugar con más oportunidades del mundo, pero después de Cuba, cualquier sitio parece Silicon Valley.</p>

<p>¿Qué quieres que te diga?</p>

<p>Prefiero que me acribillen con impuestos a consignas socialistas. Qué sé yo…</p>

<p>No me juzgues.</p>

<p>Hoy tengo casi 40 tacos, dos críos, un husky y una mujer que me aguanta.</p>

<p>Un puto milagro, lo sé.</p>

<p>Otra vez desde cero. Pero esta vez un poco más viejo y peinando canas.</p>

<p>Sin papeles, sin portfolio y sin el estatus que había alcanzado en Cuba.</p>

<p>Ahora llevo tres años desmenuzando persuasión, ventas, copywriting y marketing de respuesta directa. Me he tragado más de 50 libros relacionados con esta movida y cada semana sumo otro a la cuenta y aplico lo que voy aprendiendo.</p>

<p>Y mientras más aprendo, más me percato de lo necesario y práctico que hubiese sido contar con ese conocimiento años atrás. Pero son las cartas que me tocaron y las jugué lo mejor que pude.</p>

<p>En fin. No tengo MBA. Tengo un poco de experiencia en el mundo real y trato de aplicarla a la Matrix.</p>

<p>Y eso es Recursos del Rey Rojo y el Edicto Real: lo que aprendí montando un negocio de verdad en un país imposible + lo que estoy aprendiendo ahora construyendo uno digital.</p>

<p>Escribo desde mi experiencia para gente que sabe hacer cosas pero no sabe venderse.</p>

<p>Rey</p>

<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

<p style="font-size:14px;color:#666;">PD: Si quieres contratar mis servicios pincha <a href="https://recursosdelreyrojo.com/servicios" style="color:#c32429;">AQUÍ</a>.</p>

<p style="font-size:14px;color:#666;">PD 2: En el próximo email te cuento exactamente cómo empecé a emprender.</p>

<p style="font-size:14px;color:#666;">PD 3: Si respondiste al email anterior, genial. Si no respondiste, no pasa nada. No voy a insistir.</p>
`.trim();

  return {
    subject: "De dónde viene lo de Rey Rojo (y por qué es lo que menos debería importarte)",
    html: wrapHTML(body),
  };
}

function email3() {
  const body = `
<p>En 2013, cuando el gobierno cubano empezó a permitir que la gente montara negocios —con todas las trabas, impuestos absurdos y restricciones que te puedas imaginar— hice lo único que sabía hacer: lanzarme sin plan.</p>

<p>Monté un taller de serigrafía (técnica de impresión) y personalización de artículos promocionales. Camisetas, tazas, llaveros, cartelería institucional, etiquetas para botellas de vino artesanal. Lo que cayera.</p>

<p>El local era un cuarto en mi casa. El equipo, un trasto de hierro para hacer serigrafía que pesaba más que yo. El primer cliente, un tipo que necesitaba 200 etiquetas y no tenía a quién más pedírselas.</p>

<p>Sin crédito. Sin socio. Sin contactos. Sin internet decente para buscar en Google "cómo montar un negocio".</p>

<p>5 años después estaba coordinando un equipo de más de 6 personas, en un local en condiciones, negociando precios a diario con proveedores y gente que me pagaba sin hacer muchas preguntas, y manteniendo una cartera de clientes recurrentes sin un solo contrato formal.</p>

<p>Solo boca a boca. Solo palabra.</p>

<p>¿Publicidad? No existía. No había dónde ponerla. ¿CRM? ¿Embudo de ventas? ¿Newsletter? Ni sabía que existían. ¿Redes sociales? Internet era un lujo que pa' colmo no funcionaba nada bien.</p>

<p>Y aun así vendí. Cada día. Durante casi una década.</p>

<p>¿Sabes qué me enseñó eso?</p>

<p>Que lo que mata un negocio no es la falta de talento. Es la falta de capacidad para comunicar lo que vales. Porque yo era bueno en serigrafía —eso seguro. Pero los clientes no venían porque yo fuera bueno. Venían porque yo sabía explicarles por qué les convenía trabajar conmigo y no con el de al lado.</p>

<p>El de al lado tenía los mismos equipos que yo (creo que incluso más y mejores). Pero no sabía vender la diferencia. Así que la diferencia no existía.</p>

<p>Con lo que gané en ese negocio compré una casa para mis padres y me vine a Barcelona. Con mi mujer, mis dos hijos y una husky pretenciosa que se empeña en dejarme fuera del sofá las noches de cine en familia.</p>

<p>Otra vez desde cero. Pero esta vez con 37 años en un país nuevo en el que no conocía a más de 5 personas.</p>

<p>A diferencia de otros inmigrantes, no tengo una historia dramática, no dormí bajo un puente. Siempre estuve bajo presión, no lo voy a negar (tengo dos niños con más demandas que una central nuclear), pero tenía las cosas claras.</p>

<p><strong>La gente me preguntaba de qué vivía. Si ya tenía trabajo.</strong> Cómo pagaba el alquiler y si el gobierno me ayudaba.</p>

<p>Decía la verdad y <strong>no lo entendían, así que dejé de hacerlo.</strong></p>

<p><strong>Me dedicaba a buscar formas de emprender en internet,</strong> para no trabajar para nadie cuando se acabara el dinero, eso poca gente lo entiende.</p>

<p><strong>Por el camino aprendí. Aprendí mucho. Me reinventé y lo sigo haciendo.</strong> He probado muchas cosas y fracasado en casi todo. <strong>Perseguí objetos brillantes, me distraje varias veces,</strong> después me volví a centrar y a distraer de nuevo.</p>

<p>Hasta que finalmente encontré algo que se alineaba con lo que de cierta forma intuía y había puesto en práctica sin darme cuenta, años atrás y de manera inconsciente.</p>

<p>Que vender y comunicarse de manera elocuente y persuasiva forma parte de la columna vertebral de cualquier negocio, producto o servicio.</p>

<p><strong>En fin… he invertido tiempo en formarme y alejarme del servilismo.</strong></p>

<p><strong>Ahora</strong></p>

<p>Vendo servicios de redacción para campañas de marketing, sobre todo email marketing, y creo que se me da bastante bien, no sé a ti qué te parezca. Probablemente no encajemos. O sí. Ya veremos.</p>

<p>Si quieres contratar mis servicios pincha <a href="https://recursosdelreyrojo.com/servicios" style="color:#c32429;">AQUÍ</a>.</p>

<p>Rey</p>

<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

<p style="font-size:14px;color:#666;">PD: En el próximo email te cuento una cosa que aprendí vendiendo en mi taller que me cambió por completo la forma de entender la persuasión. Es corta y la puedes aplicar mañana.</p>
`.trim();

  return {
    subject: "Cómo monté un negocio, me fue bien y lo dejé para empezar de nuevo",
    html: wrapHTML(body),
  };
}

function email4() {
  const body = `
<p>Un tipo entró un día a pedir presupuesto para 1500 camisetas corporativas. Era un pedido gordo para mi taller — de los que te pagan el mes.</p>

<p>Le enseñé las telas, le expliqué el proceso, le mostré trabajos anteriores. Le di el precio.</p>

<p>Me dijo que no.</p>

<p>Delante de mi equipo. Tres personas que estaban mirando. En mi propio taller.</p>

<p>Me dio la excusa clásica: "Lo voy a pensar." Y se fue.</p>

<p>Esa noche no dormí bien. No por el dinero —que también— sino porque no entendía qué había fallado. Le había dado toda la información. Le había explicado perfectamente cómo funcionaba la serigrafía, el tipo de tinta, la durabilidad, los tiempos de entrega.</p>

<p>Atiende, porque esto es lo que me voló la cabeza:</p>

<p>Unos días después, el mismo tipo volvió. No a mi taller. A otro. Al de mi competencia directa, que cobraba más caro y hacía un trabajo mediocre.</p>

<p>Le pregunté a un conocido en común por qué había elegido al otro.</p>

<p>La respuesta me destrozó: "Porque el otro le dijo que si usaba esas camisetas en el evento, la gente iba a recordar su marca durante meses. Tú le dijiste que la tinta aguantaba 50 lavados."</p>

<p>Yo le hablé de la tinta. El otro le habló de lo que la tinta hacía por él.</p>

<p>La diferencia es ridícula.</p>

<p>Es una frase.</p>

<p>Es cambiar el enfoque de "lo que yo hago" a "lo que tú ganas".</p>

<p>Pero esa frase es la diferencia entre que te digan "lo voy a pensar" y que te digan "¿cuándo empezamos?".</p>

<p>Te lo pongo de otra forma: tú puedes describir tu servicio con precisión quirúrgica y que al cliente le dé igual. Pero si le pones en palabras lo que él gana — no lo que tú haces, sino lo que cambia en su vida o en su negocio — ya has ganado antes de haberle vendido nada.</p>

<p>La gente no compra porque entiende lo que haces. Compra porque nota que tú le entiendes a él.</p>

<p>Eso es persuasión. No es hablar bonito. No es manipular. Es traducir.</p>

<p>Y de eso va cada Edicto Real que te voy a mandar. De traducir. De convertir lo que sabes en palabras que el otro entienda, recuerde y pague.</p>

<p>A partir de mañana empiezan los Edictos regulares. Un email. Cada día. Sobre persuasión, negocio y cómo ganar dinero.</p>

<p>Si un día quieres irte, abandonas el Reino en un clic. Sin guardias en la puerta. Sin preguntas ni drama.</p>

<p>Rey</p>

<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">

<p style="font-size:14px;color:#666;">PD: Lo de las 1500 camisetas lo recuperé después. Pero no porque mejoré la tinta. Sino porque aprendí a hablar del resultado, no del proceso.</p>

<p style="font-size:14px;color:#666;">PD 2: Si quieres contratar mis servicios pincha <a href="https://recursosdelreyrojo.com/servicios" style="color:#c32429;">AQUÍ</a>.</p>
`.trim();

  return {
    subject: "Lo que aprendí el día que un cliente me dijo que no delante de mi equipo",
    html: wrapHTML(body),
  };
}

// Mapa de email según el día de la secuencia
const SEQUENCE = [null, email1, email2, email3, email4]; // índice 1 = email 1
// Días que deben pasar entre emails (null, 0, 2, 4, 7 desde suscripción)
const DAYS_FROM_SUBSCRIBE = [null, 0, 2, 4, 7];

// ── Cargar tracker ─────────────────────────────────────────────
function loadTracker() {
  if (existsSync(TRACKER_PATH)) {
    return JSON.parse(readFileSync(TRACKER_PATH, "utf-8"));
  }
  return {}; // { "email@ejemplo.com": { lastEmail: 3, sentAt: "2026-06-18T..." } }
}

function saveTracker(tracker) {
  writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), "utf-8");
}

// ── Obtener contactos de la lista ──────────────────────────────
async function getContacts() {
  const url = `${BREVO_API}/contacts?listIds=${LIST_ID}&limit=50`;
  const res = await fetch(url, {
    headers: { "api-key": API_KEY, Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error al obtener contactos (${res.status}): ${err.message || "desconocido"}`);
  }
  const data = await res.json();
  return data.contacts || [];
}

// ── Enviar un email transaccional ──────────────────────────────
async function sendEmail(toEmail, { subject, html }) {
  const payload = {
    sender: SENDER,
    to: [{ email: toEmail }],
    replyTo: { email: REPLY_TO },
    subject,
    htmlContent: html,
  };

  if (DRY_RUN) {
    console.log(`   [DRY RUN] → ${toEmail} — "${subject}"`);
    return { ok: true, dryRun: true };
  }

  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo devolvió ${res.status}: ${err.message || "error desconocido"}`);
  }

  return await res.json();
}

// ── Lógica principal ───────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? "🔍 MODO SIMULACIÓN (--dry-run)\n" : "📧 ENVIANDO secuencia de bienvenida\n");

  // 1. Cargar contactos
  let contacts;
  try {
    contacts = await getContacts();
  } catch (e) {
    console.error(`❌ No pude obtener los contactos: ${e.message}`);
    process.exit(1);
  }

  if (contacts.length === 0) {
    console.log("📭 No hay contactos en la lista #3.");
    return;
  }

  console.log(`👥 ${contacts.length} contacto(s) en la lista\n`);

  // 2. Cargar tracker
  const tracker = loadTracker();

  // 3. Calcular qué toca para cada contacto
  const ahora = new Date();
  const pendientes = []; // [{ email, emailNumber, subject }]

  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    const subscriptionDate = new Date(contact.createdAt);
    const diasSuscripto = Math.floor((ahora - subscriptionDate) / (1000 * 60 * 60 * 24));

    const entry = tracker[email];

    // Determinar qué email le toca
    let nextEmail;
    if (!entry) {
      // Nunca recibió nada. Toca email 1 si pasó el día 0 (inmediato)
      if (diasSuscripto >= 0) {
        nextEmail = 1;
      }
    } else if (entry.lastEmail < 4) {
      // Ya recibió alguno. ¿Toca el siguiente?
      const expectedNext = entry.lastEmail + 1;
      const daysNeeded = DAYS_FROM_SUBSCRIBE[expectedNext];
      if (diasSuscripto >= daysNeeded) {
        nextEmail = expectedNext;
      }
    }

    if (nextEmail) {
      const emailFn = SEQUENCE[nextEmail];
      const { subject } = emailFn();
      pendientes.push({ email, emailNumber: nextEmail, subject, emailFn, diasSuscripto });
    }
  }

  if (pendientes.length === 0) {
    console.log("✅ Nada pendiente. Todos los contactos están al día.");
    // Mostrar resumen igual
    console.log("\n📋 Resumen del tracker:");
    for (const [email, entry] of Object.entries(tracker)) {
      console.log(`   ${email} → Email ${entry.lastEmail}/4 (${entry.sentAt})`);
    }
    if (Object.keys(tracker).length === 0) {
      console.log("   (vacío — ningún envío registrado aún)");
    }
    return;
  }

  console.log(`📬 ${pendientes.length} email(s) para enviar:\n`);

  // 4. Enviar
  let enviados = 0;
  let fallos = 0;

  for (const p of pendientes) {
    const tag = DRY_RUN ? "[SIMULADO]" : "[ENVIANDO]";
    console.log(`   ${tag} Email ${p.emailNumber}/4 → ${p.email} (${p.diasSuscripto} días suscrito)`);
    console.log(`          Asunto: "${p.subject}"`);

    try {
      const result = await sendEmail(p.email, p.emailFn());
      if (!result.dryRun) {
        tracker[p.email] = {
          lastEmail: p.emailNumber,
          sentAt: ahora.toISOString(),
          messageId: result.messageId || null,
        };
      }
      enviados++;
    } catch (e) {
      console.error(`   ❌ Falló: ${e.message}`);
      fallos++;
    }
    console.log();
  }

  // 5. Guardar tracker
  if (!DRY_RUN && enviados > 0) {
    saveTracker(tracker);
  }

  // 6. Resumen
  console.log("──────────────────────────────────────────");
  console.log(`📊 Resumen: ${enviados} enviado(s), ${fallos} fallo(s)`);
  if (DRY_RUN) {
    console.log("🔍 Esto fue una simulación. Ejecuta sin --dry-run para enviar de verdad.");
  }
  console.log("\n📋 Estado del tracker:");
  if (!DRY_RUN) {
    for (const [email, entry] of Object.entries(tracker)) {
      console.log(`   ${email} → Email ${entry.lastEmail}/4 (${entry.sentAt})`);
    }
  }
  if (Object.keys(tracker).length === 0) {
    console.log("   (vacío — ningún envío registrado aún)");
  }
}

main().catch((e) => {
  console.error(`\n💥 Error inesperado: ${e.message}`);
  process.exit(1);
});
