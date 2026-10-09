import { LOCALE } from './idioma'

// Países (ISO 3166). O país decide o meio de pagamento: Brasil = Mercado Pago, outros = Stripe.
const CODIGOS = ('AD AE AF AG AI AL AM AO AR AS AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CU CV CW CY CZ '
    + 'DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP '
    + 'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ '
    + 'OM PA PE PF PG PH PK PL PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TL TM TN TO TR TT TV TW TZ '
    + 'UA UG US UY UZ VA VC VE VG VI VN VU WS XK YE YT ZA ZM ZW').split(' ')

const FUSOS_DO_BRASIL = ['Sao_Paulo', 'Fortaleza', 'Recife', 'Bahia', 'Belem', 'Manaus', 'Cuiaba', 'Campo_Grande', 'Porto_Velho', 'Boa_Vista', 'Rio_Branco', 'Araguaina', 'Maceio', 'Santarem', 'Noronha', 'Eirunepe']

export function nomeDoPais(codigo, idioma) {
    try {
        return new Intl.DisplayNames([LOCALE[idioma]], { type: 'region' }).of(codigo) ?? codigo
    } catch {
        return codigo
    }
}

// Lista em ordem alfabética no idioma da tela, com Brasil e Estados Unidos no topo.
export function listaDePaises(idioma) {
    const nomes = CODIGOS.map((codigo) => ({ codigo, nome: nomeDoPais(codigo, idioma) }))
        .sort((a, b) => a.nome.localeCompare(b.nome, LOCALE[idioma]))
    const topo = ['BR', 'US'].map((codigo) => nomes.find((p) => p.codigo === codigo))
    return [...topo, ...nomes.filter((p) => !['BR', 'US'].includes(p.codigo))]
}

// Primeiro palpite pelo fuso e pelo idioma do navegador (a pessoa pode trocar).
export function adivinharPais() {
    try {
        const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
        if (FUSOS_DO_BRASIL.some((f) => fuso === `America/${f}`)) return 'BR'
    } catch {
        // sem suporte a fuso
    }
    const regiao = navigator.language?.split('-')[1]?.toUpperCase()
    return regiao && CODIGOS.includes(regiao) ? regiao : 'US'
}
