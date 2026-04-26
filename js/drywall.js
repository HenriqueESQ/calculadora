function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function fmt(value, digits = 2) {
    return Number(value).toFixed(digits).replace(".", ",");
}

function calcularDrywall(largura, altura, espacamentoMontante = 0.6) {
    const area = round2(largura * altura);
    const placas = Math.ceil(area * 2);
    const montantes = Math.ceil(largura / espacamentoMontante);

    const barraGuia = 3.0;
    const totalGuiaMl = largura * 2;
    const guias = Math.ceil((totalGuiaMl / barraGuia) * 1.05);

    const parafusosPorPlaca = 35;
    const parafusos = placas * parafusosPorPlaca;
    const brutoPlacas = area * 2;
    const brutoMontantes = largura / espacamentoMontante;
    const brutoGuias = (totalGuiaMl / barraGuia) * 1.05;
    const conferencias = [
        `Área: ${fmt(largura)} x ${fmt(altura)} = ${fmt(area)} m²`,
        `Placas (2 lados): ${fmt(area)} x 2 = ${fmt(brutoPlacas)} -> arredonda para cima = ${placas}`,
        `Montantes: ${fmt(largura)} / ${fmt(espacamentoMontante)} = ${fmt(brutoMontantes)} -> arredonda para cima = ${montantes}`,
        `Guias: ((${fmt(largura)} x 2) / ${fmt(barraGuia, 0)}) x 1,05 = ${fmt(brutoGuias)} -> arredonda para cima = ${guias}`,
        `Parafusos: ${placas} x ${parafusosPorPlaca} = ${parafusos}`
    ];

    return {
        area,
        placas,
        montantes,
        guias,
        parafusos,
        conferencias
    };
}