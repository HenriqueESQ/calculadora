function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function fmt(value, digits = 2) {
    return Number(value).toFixed(digits).replace(".", ",");
}

function calcularForro(
    largura,
    comprimento,
    larguraPlaca = 0.2,
    barraArremate = 6,
    pacoteIsolanteM2 = 5,
    orientacao = "horizontal"
) {
    const usaHorizontal = orientacao === "horizontal";
    const eixoPlaca = usaHorizontal ? largura : comprimento;
    const eixoComprimentoPlaca = usaHorizontal ? comprimento : largura;

    const area = round2(largura * comprimento);
    const perimetro = 2 * (largura + comprimento);

    const fiadasPlaca = Math.ceil(eixoPlaca / larguraPlaca);
    const comprimentoPlaca = round2(Math.ceil(eixoComprimentoPlaca / 0.25) * 0.25);
    const metalon = Math.ceil((area * 0.4) * 1.1);
    const arremate = Math.ceil(perimetro / barraArremate);
    const parafusoForro = Math.ceil(area * 10);
    const parafusoEstrutura = Math.ceil(parafusoForro / 2);
    const isolanteM2 = area;
    const isolantePacotes = Math.ceil(isolanteM2 / pacoteIsolanteM2);
    const brutoPlacas = eixoPlaca / larguraPlaca;
    const brutoCompPlaca = eixoComprimentoPlaca / 0.25;
    const brutoMetalon = (area * 0.4) * 1.1;
    const brutoArremate = perimetro / barraArremate;
    const brutoParafusoForro = area * 10;
    const brutoParafusoEstrutura = parafusoForro / 2;
    const brutoPacotes = isolanteM2 / pacoteIsolanteM2;
    const conferencias = [
        `Área: ${fmt(largura)} x ${fmt(comprimento)} = ${fmt(area)} m²`,
        `Placas: ${fmt(eixoPlaca)} / ${fmt(larguraPlaca)} = ${fmt(brutoPlacas)} -> arredonda para cima = ${fiadasPlaca}`,
        `Comprimento da placa: ${fmt(eixoComprimentoPlaca)} / 0,25 = ${fmt(brutoCompPlaca)} -> próximo múltiplo = ${fmt(comprimentoPlaca)} m`,
        `Metalon: (${fmt(area)} x 40%) + 10% = ${fmt(brutoMetalon)} -> arredonda para cima = ${metalon}`,
        `Arremate: ((${fmt(largura)} + ${fmt(comprimento)}) x 2) / ${barraArremate} = ${fmt(brutoArremate)} -> arredonda para cima = ${arremate}`,
        `Parafuso forro: ${fmt(area)} x 10 = ${fmt(brutoParafusoForro)} -> arredonda para cima = ${parafusoForro}`,
        `Parafuso estrutura: ${parafusoForro} / 2 = ${fmt(brutoParafusoEstrutura)} -> arredonda para cima = ${parafusoEstrutura}`,
        `Isolante: igual à área = ${fmt(isolanteM2)} m²`,
        `Pacotes de isolante: ${fmt(isolanteM2)} / ${fmt(pacoteIsolanteM2)} = ${fmt(brutoPacotes)} -> arredonda para cima = ${isolantePacotes}`
    ];

    return {
        area,
        placas: fiadasPlaca,
        compPlaca: comprimentoPlaca,
        metalon,
        arremate,
        parafusoForro,
        parafusoEstrutura,
        isolanteM2: round2(isolanteM2),
        isolantePacotes,
        orientacao,
        conferencias
    };
}